import React from 'react';
import { useLocation } from 'react-router-dom';
import { BottomNav } from './BottomNav';
import { TopHeader } from './TopHeader';
import { Currency } from '../../types';

interface AppShellProps {
  children: React.ReactNode;
  currency?: Currency;
  onCurrencyChange?: (c: Currency) => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  currency = 'IDR',
  onCurrencyChange,
}) => {
  const location = useLocation();

  const getPageHeaderInfo = () => {
    switch (location.pathname) {
      case '/':
        return { title: 'FinTar Copilot', showBack: false };
      case '/reports':
        return { title: 'Laporan Keuangan', showBack: false };
      case '/scan':
        return { title: 'Pindai Struk Belanja', showBack: false };
      case '/assistant':
        return { title: 'Finix AI Copilot', showBack: false };
      case '/profile':
        return { title: 'Profil & Pengaturan', showBack: false };
      case '/alerts':
        return { title: 'Peringatan Risiko & Kas', showBack: true };
      case '/funding':
        return { title: 'Simulasi Pinjaman Modal', showBack: true };
      case '/protect':
        return { title: 'Asuransi Mikro Toko', showBack: true };
      case '/activity':
        return { title: 'Audit Log & Tata Kelola AI', showBack: true };
      case '/onboarding':
        return { title: 'Pengaturan Usaha', showBack: false };
      case '/login':
        return { title: 'Masuk Akun', showBack: false };
      default:
        return { title: 'FinTar', showBack: true };
    }
  };

  const { title, showBack } = getPageHeaderInfo();
  const isAuthOrOnboarding = location.pathname === '/onboarding' || location.pathname === '/login';

  return (
    <div className="min-h-screen bg-slate-100 flex justify-center selection:bg-brand-500 selection:text-white">
      <div className="mobile-container relative flex flex-col bg-[#F8FAFC] min-h-screen pb-24 border-x border-slate-200">
        {!isAuthOrOnboarding && (
          <TopHeader
            title={title}
            showBack={showBack}
            currency={currency}
            onCurrencyChange={onCurrencyChange}
          />
        )}
        <main className="flex-1 px-4 py-4 overflow-y-auto">
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
};
