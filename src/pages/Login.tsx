import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { Lock, Mail, Store, ArrowRight, ShieldCheck } from 'lucide-react';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, signup } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('owner@vierabakery.com');
  const [password, setPassword] = useState('password123');
  const [businessName, setBusinessName] = useState('Viera Bakery');
  const [isLoading, setIsLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsLoading(true);
    try {
      if (mode === 'login') {
        await login(email, password);
        navigate(from, { replace: true });
      } else {
        await signup(email, password, { name: businessName });
        navigate('/onboarding', { replace: true });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-8 px-2 space-y-6">
      {/* Brand Hero */}
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-full bg-[#0066FF] text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/30">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
            <polyline points="16 7 22 7 22 13"></polyline>
          </svg>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">FinTar</h1>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          AI Finance Copilot untuk Pemilik Usaha Mikro dan Kecil (UMKM).
        </p>
      </div>

      {/* Tab Switcher */}
      <div className="flex bg-slate-200/70 p-1 rounded-2xl text-xs max-w-xs mx-auto">
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`flex-1 py-2 font-bold rounded-xl transition-all ${
            mode === 'login'
              ? 'bg-white text-[#0066FF] shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Masuk Akun
        </button>
        <button
          type="button"
          onClick={() => setMode('signup')}
          className={`flex-1 py-2 font-bold rounded-xl transition-all ${
            mode === 'signup'
              ? 'bg-white text-[#0066FF] shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Daftar Baru
        </button>
      </div>

      {/* Form Card */}
      <form onSubmit={handleSubmit} className="card-white p-5 space-y-4 shadow-sm">
        {mode === 'signup' && (
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Usaha / Toko</label>
            <div className="relative">
              <Store className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Viera Bakery"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
                required
              />
            </div>
          </div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@vierabakery.com"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1.5">Kata Sandi</label>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={isLoading}
          rightIcon={<ArrowRight className="w-4 h-4" />}
          className="mt-2"
        >
          {mode === 'login' ? 'Masuk ke Dashboard' : 'Lanjut ke Pengaturan Toko'}
        </Button>

        <div className="pt-2 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            Row Level Security (RLS) terisolasi per akun bisnis
          </p>
        </div>
      </form>
    </div>
  );
};
