import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConsent } from '../context/ConsentContext';
import { Button } from '../components/common/Button';
import { Currency } from '../types';
import { Shield, Sparkles, Store, ChevronRight, Lock, CheckCircle2, ArrowLeft } from 'lucide-react';

export const Onboarding: React.FC = () => {
  const navigate = useNavigate();
  const { business, updateBusiness } = useAuth();
  const { grantConsent, revokeConsent } = useConsent();

  const [step, setStep] = useState<'profile' | 'consent'>('profile');
  const [businessName, setBusinessName] = useState(business?.name || 'Viera Bakery');
  const [category, setCategory] = useState(business?.category || 'Food & Beverage / Bakery');
  const [scale, setScale] = useState<'micro' | 'small' | 'medium'>(business?.scale || 'micro');
  const [displayCurrency, setDisplayCurrency] = useState<Currency>(business?.displayCurrency || 'IDR');

  // Consent states (PRD FR-02)
  const [aiConsent, setAiConsent] = useState(true);
  const [anonymousConsent, setAnonymousConsent] = useState(true);

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateBusiness({
      name: businessName,
      category,
      scale,
      displayCurrency,
    });
    setStep('consent');
  };

  const handleConsentSubmit = async () => {
    if (aiConsent) {
      await grantConsent('ai_processing');
    } else {
      await revokeConsent('ai_processing');
    }

    if (anonymousConsent) {
      await grantConsent('anonymous_insights');
    } else {
      await revokeConsent('anonymous_insights');
    }

    navigate('/', { replace: true });
  };

  return (
    <div className="py-6 px-1 space-y-5">
      {/* Header */}
      <div className="text-center space-y-1.5">
        <div className="w-12 h-12 rounded-2xl bg-[#0066FF] text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/30">
          <Sparkles className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-black text-slate-900 tracking-tight">
          {step === 'profile' ? 'Atur Profil Bisnis' : 'Persetujuan Privasi & AI'}
        </h1>
        <p className="text-xs text-slate-500 max-w-xs mx-auto">
          {step === 'profile'
            ? 'Lengkapi data usaha Anda untuk personalisasi perkiraan keuangan'
            : 'Pahami bagaimana data Anda diproses secara aman & transparan'}
        </p>
      </div>

      {step === 'profile' ? (
        <form onSubmit={handleProfileSubmit} className="card-white p-5 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Store className="w-4 h-4 text-[#0066FF]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Informasi Usaha
            </h2>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Nama Usaha</label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0066FF]"
              placeholder="e.g. Viera Bakery"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Kategori Usaha</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
            >
              <option value="Food & Beverage / Bakery">Food & Beverage / Bakery</option>
              <option value="Laundry & Dry Cleaning">Laundry & Dry Cleaning</option>
              <option value="Retail & Grocery">Retail & Kelontong</option>
              <option value="Services & Crafts">Jasa & Kerajinan</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Skala Bisnis</label>
            <div className="grid grid-cols-3 gap-2">
              {(['micro', 'small', 'medium'] as const).map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => setScale(s)}
                  className={`py-2 rounded-2xl text-xs font-bold capitalize transition-all ${
                    scale === s
                      ? 'bg-[#0066FF] text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {s === 'micro' ? 'Mikro' : s === 'small' ? 'Kecil' : 'Menengah'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Mata Uang Tampilan (FR-24)</label>
            <select
              value={displayCurrency}
              onChange={(e) => setDisplayCurrency(e.target.value as Currency)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
            >
              <option value="IDR">IDR - Rupiah Indonesia (Rp)</option>
              <option value="USD">USD - United States Dollar ($)</option>
              <option value="CNY">CNY - Chinese Yuan (¥)</option>
            </select>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            rightIcon={<ChevronRight className="w-5 h-5" />}
            className="mt-2"
          >
            Lanjut ke Lembar Persetujuan
          </Button>
        </form>
      ) : (
        <div className="card-white p-5 space-y-4 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
            <Shield className="w-4 h-4 text-[#0066FF]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Persetujuan & Kebijakan Data
            </h2>
          </div>

          {/* Consent Item 1: REQUIRED */}
          <div
            onClick={() => setAiConsent(!aiConsent)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              aiConsent
                ? 'bg-blue-50/60 border-blue-300'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={aiConsent}
                onChange={(e) => setAiConsent(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-[#0066FF] accent-[#0066FF] cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-900">
                    Proses data keuangan saya dengan AI
                  </p>
                  <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-red-100 text-red-700">
                    Wajib
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Memberikan izin kepada agen AI FinTar untuk membaca foto struk, mendeteksi anomali biaya, dan membuat proyeksi defisit kas 30 hari.
                </p>
              </div>
            </div>
          </div>

          {/* Consent Item 2: OPTIONAL */}
          <div
            onClick={() => setAnonymousConsent(!anonymousConsent)}
            className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
              anonymousConsent
                ? 'bg-blue-50/60 border-blue-300'
                : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                checked={anonymousConsent}
                onChange={(e) => setAnonymousConsent(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-[#0066FF] accent-[#0066FF] cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-1.5">
                  <p className="text-xs font-bold text-slate-900">
                    Bagikan wawasan anonim (Benchmark)
                  </p>
                  <span className="text-[9px] font-bold uppercase px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                    Opsional
                  </span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
                  Menyumbangkan metrik anonim untuk membandingkan margin usaha Anda dengan rata-rata toko sejenis di industri.
                </p>
              </div>
            </div>
          </div>

          {/* Explanation Banner */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 space-y-1">
            <p className="font-bold text-slate-800 flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-[#0066FF]" /> Transparansi Pemrosesan Data:
            </p>
            <p>
              FinTar mematuhi UU PDP No. 27/2022. Persetujuan ini bersifat <em>revocable</em> (dapat dicabut sewaktu-waktu) dari menu Profil dan seluruh data dapat dihapus permanen.
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button
              type="button"
              variant="secondary"
              size="lg"
              onClick={() => setStep('profile')}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
            >
              Kembali
            </Button>
            <Button
              type="button"
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleConsentSubmit}
              rightIcon={<CheckCircle2 className="w-4 h-4" />}
            >
              Mulai Gunakan FinTar
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
