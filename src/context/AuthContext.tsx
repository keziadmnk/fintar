import React, { createContext, useContext, useState, useEffect } from 'react';
import { Business } from '../types';
import { mockBusiness } from '../mock/vieraBakeryData';

export interface User {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  business: Business | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, businessData: Partial<Business>) => Promise<boolean>;
  logout: () => void;
  updateBusiness: (updates: Partial<Business>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'fintar_user_session';
const BIZ_STORAGE_KEY = 'fintar_user_business';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem(AUTH_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default logged in as demo user for smooth testing
    return {
      id: 'user_viera_owner',
      email: 'owner@vierabakery.com',
      name: 'Viera Bakery Owner',
    };
  });

  const [business, setBusiness] = useState<Business | null>(() => {
    const saved = localStorage.getItem(BIZ_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    return mockBusiness;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [user]);

  useEffect(() => {
    if (business) {
      localStorage.setItem(BIZ_STORAGE_KEY, JSON.stringify(business));
    } else {
      localStorage.removeItem(BIZ_STORAGE_KEY);
    }
  }, [business]);

  const login = async (email: string, _password: string): Promise<boolean> => {
    // Simulated authentication (can bind to Supabase Auth)
    const newUser: User = {
      id: `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email,
      name: email.split('@')[0],
    };
    setUser(newUser);
    if (!business) {
      setBusiness({
        ...mockBusiness,
        id: `biz_${newUser.id}`,
        ownerId: newUser.id,
      });
    }
    return true;
  };

  const signup = async (
    email: string,
    _password: string,
    businessData: Partial<Business>
  ): Promise<boolean> => {
    const newUser: User = {
      id: `user_${email.replace(/[^a-zA-Z0-9]/g, '_')}`,
      email,
      name: email.split('@')[0],
    };
    const newBiz: Business = {
      id: `biz_${Date.now()}`,
      ownerId: newUser.id,
      name: businessData.name || 'My Business',
      category: businessData.category || 'Food & Beverage',
      scale: businessData.scale || 'micro',
      displayCurrency: businessData.displayCurrency || 'IDR',
      avgMonthlyProfit: 1_100_000,
      currentCashBalance: 1_100_000,
    };

    setUser(newUser);
    setBusiness(newBiz);
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
  };

  const updateBusiness = (updates: Partial<Business>) => {
    setBusiness((prev) => (prev ? { ...prev, ...updates } : null));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        business,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        updateBusiness,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
