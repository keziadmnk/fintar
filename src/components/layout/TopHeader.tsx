import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, Sparkles } from 'lucide-react';
import { mockAlerts } from '../../mock/vieraBakeryData';
import { useAuth } from '../../context/AuthContext';
import { Currency } from '../../types';

interface TopHeaderProps {
  title?: string;
  showBack?: boolean;
  currency?: Currency;
  onCurrencyChange?: (c: Currency) => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({
  title,
  showBack = false,
  currency = 'IDR',
  onCurrencyChange,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { business } = useAuth();

  const unresolvedAlertsCount = mockAlerts.filter((a) => !a.resolved).length;
  const isHome = location.pathname === '/';

  return (
    <header className="sticky top-0 z-20 w-full bg-slate-50/95 backdrop-blur-md px-4 py-3.5 border-b border-slate-100">
      <div className="flex items-center justify-between">
        {showBack ? (
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 active:scale-95 transition-all"
              aria-label="Back"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-base font-bold text-slate-900 truncate">
              {title || 'FinTar'}
            </h1>
          </div>
        ) : isHome ? (
          <div className="flex items-center gap-2.5">
            {/* Logo matching the blue circle icon in image */}
            <div className="w-9 h-9 rounded-full bg-[#0066FF] flex items-center justify-center text-white shadow-md shadow-blue-500/30">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
                <polyline points="16 7 22 7 22 13"></polyline>
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-1">
                <span className="text-lg font-black text-slate-900 tracking-tight">FinTar</span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">Finance copilot • {business?.name || 'Viera Bakery'}</p>
            </div>
          </div>
        ) : (
          <h1 className="text-base font-bold text-slate-900">{title}</h1>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {onCurrencyChange && (
            <select
              value={currency}
              onChange={(e) => onCurrencyChange(e.target.value as Currency)}
              className="bg-white border border-slate-200 text-slate-700 text-xs rounded-full px-2.5 py-1 font-semibold focus:outline-none focus:ring-1 focus:ring-brand-500 shadow-sm"
            >
              <option value="IDR">IDR</option>
              <option value="USD">USD</option>
              <option value="CNY">CNY</option>
            </select>
          )}

          {/* Activity / Audit link */}
          <Link
            to="/activity"
            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors shadow-sm"
            title="Audit Log"
          >
            <Sparkles className="w-4 h-4 text-brand-600" />
          </Link>

          {/* Bell Icon matching gray circular button with red dot */}
          <Link
            to="/alerts"
            className="relative w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors shadow-sm"
            aria-label="Alerts"
          >
            <Bell className="w-4 h-4 text-slate-700" />
            {unresolvedAlertsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#EF4444] ring-2 ring-white" />
            )}
          </Link>
        </div>
      </div>
    </header>
  );
};
