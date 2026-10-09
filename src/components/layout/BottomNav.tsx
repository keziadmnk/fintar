import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, BarChart3, ScanLine, Bot, User } from 'lucide-react';
import { cn } from '../../lib/utils';

export const BottomNav: React.FC = () => {
  const location = useLocation();

  // Hide on onboarding and login routes
  if (location.pathname === '/onboarding' || location.pathname === '/login') {
    return null;
  }

  const navItems = [
    { label: 'Home', path: '/', icon: Home },
    { label: 'Reports', path: '/reports', icon: BarChart3 },
    { label: 'Scan', path: '/scan', icon: ScanLine, isCenter: true },
    { label: 'Assistant', path: '/assistant', icon: Bot },
    { label: 'Profile', path: '/profile', icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 max-w-[420px] mx-auto bg-white/95 backdrop-blur-xl border-t border-slate-100 px-3 py-2 shadow-floating">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          if (item.isCenter) {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className="relative -top-5 flex flex-col items-center group focus:outline-none"
              >
                <div
                  className={cn(
                    'w-13 h-13 rounded-full flex items-center justify-center transition-all duration-200 active:scale-95 border-4 border-slate-50',
                    isActive
                      ? 'bg-[#0066FF] text-white shadow-lg shadow-blue-500/40'
                      : 'bg-[#0066FF] text-white shadow-lg shadow-blue-500/30 hover:scale-105'
                  )}
                  style={{ width: '54px', height: '54px' }}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span
                  className={cn(
                    'text-[10px] font-bold mt-0.5',
                    isActive ? 'text-[#0066FF]' : 'text-slate-500'
                  )}
                >
                  {item.label}
                </span>
              </NavLink>
            );
          }

          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center py-1 px-3 min-w-[54px] rounded-xl transition-all duration-150',
                  isActive
                    ? 'text-[#0066FF] font-bold'
                    : 'text-slate-400 hover:text-slate-600 active:scale-95'
                )
              }
            >
              <Icon className={cn('w-5 h-5 mb-1', isActive ? 'stroke-[2.5px] text-[#0066FF]' : 'text-slate-400')} />
              <span className="text-[10px] tracking-tight">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
