import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Consent } from '../types';

interface ConsentContextType {
  consents: Consent[];
  hasConsent: (type: 'ai_processing' | 'anonymous_insights') => boolean;
  grantConsent: (type: 'ai_processing' | 'anonymous_insights') => Promise<void>;
  revokeConsent: (type: 'ai_processing' | 'anonymous_insights') => Promise<void>;
  clearAllConsents: () => void;
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined);

const CONSENT_STORAGE_KEY = 'fintar_user_consents';

export const ConsentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();

  const [consents, setConsents] = useState<Consent[]>(() => {
    const saved = localStorage.getItem(CONSENT_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    // Default initial consents for demo user
    return [
      {
        id: 'c1',
        userId: 'user_viera_owner',
        type: 'ai_processing',
        granted: true,
        timestamp: new Date().toISOString(),
      },
      {
        id: 'c2',
        userId: 'user_viera_owner',
        type: 'anonymous_insights',
        granted: true,
        timestamp: new Date().toISOString(),
      },
    ];
  });

  useEffect(() => {
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(consents));
  }, [consents]);

  /**
   * Helper hasConsent: Checks if the latest consent record for a given type is granted.
   * Required by PRD FR-02 & Task 3.
   */
  const hasConsent = (type: 'ai_processing' | 'anonymous_insights'): boolean => {
    const currentUserId = user?.id || 'user_viera_owner';
    const userConsents = consents
      .filter((c) => c.userId === currentUserId && c.type === type)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    if (userConsents.length === 0) return false;
    return userConsents[0].granted;
  };

  /**
   * Insert-only grant consent (appends a new consent row with timestamp)
   */
  const grantConsent = async (type: 'ai_processing' | 'anonymous_insights') => {
    const currentUserId = user?.id || 'user_viera_owner';
    const newRecord: Consent = {
      id: `consent_${Date.now()}`,
      userId: currentUserId,
      type,
      granted: true,
      timestamp: new Date().toISOString(),
    };

    setConsents((prev) => [newRecord, ...prev]);
  };

  /**
   * Insert-only revoke consent (appends a new consent row with granted: false)
   */
  const revokeConsent = async (type: 'ai_processing' | 'anonymous_insights') => {
    const currentUserId = user?.id || 'user_viera_owner';
    const newRecord: Consent = {
      id: `consent_${Date.now()}`,
      userId: currentUserId,
      type,
      granted: false,
      timestamp: new Date().toISOString(),
    };

    setConsents((prev) => [newRecord, ...prev]);
  };

  const clearAllConsents = () => {
    setConsents([]);
    localStorage.removeItem(CONSENT_STORAGE_KEY);
  };

  return (
    <ConsentContext.Provider
      value={{
        consents,
        hasConsent,
        grantConsent,
        revokeConsent,
        clearAllConsents,
      }}
    >
      {children}
    </ConsentContext.Provider>
  );
};

export const useConsent = () => {
  const context = useContext(ConsentContext);
  if (!context) {
    throw new Error('useConsent must be used within a ConsentProvider');
  }
  return context;
};
