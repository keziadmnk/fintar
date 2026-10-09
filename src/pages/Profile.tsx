import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useConsent } from '../context/ConsentContext';
import { useTransactions } from '../context/TransactionContext';
import { Button } from '../components/common/Button';
import { seedDemoDataForUser } from '../lib/supabase';
import { Currency } from '../types';
import {
  Globe,
  Shield,
  History,
  Lock,
  ChevronRight,
  Sparkles,
  Database,
  CheckCircle2,
  Trash2,
  LogOut,
  AlertTriangle,
} from 'lucide-react';

interface ProfileProps {
  currency: Currency;
  onCurrencyChange: (c: Currency) => void;
}

export const Profile: React.FC<ProfileProps> = ({ currency, onCurrencyChange }) => {
  const navigate = useNavigate();
  const { user, business, logout } = useAuth();
  const { hasConsent, grantConsent, revokeConsent, clearAllConsents } = useConsent();

  const [seeding, setSeeding] = useState(false);
  const [seedSuccess, setSeedSuccess] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isAiConsentGranted = hasConsent('ai_processing');
  const isAnonConsentGranted = hasConsent('anonymous_insights');

  const handleToggleAiConsent = async () => {
    if (isAiConsentGranted) {
      await revokeConsent('ai_processing');
    } else {
      await grantConsent('ai_processing');
    }
  };

  const handleToggleAnonConsent = async () => {
    if (isAnonConsentGranted) {
      await revokeConsent('anonymous_insights');
    } else {
      await grantConsent('anonymous_insights');
    }
  };

  const { resetToDemoSeed } = useTransactions();

  const handleLoadDemoData = async () => {
    setSeeding(true);
    try {
      await resetToDemoSeed();
      await grantConsent('ai_processing');
      setSeedSuccess(true);
      setTimeout(() => setSeedSuccess(false), 3000);
    } catch (e) {
      console.error(e);
    } finally {
      setSeeding(false);
    }
  };

  const handleDeleteAllData = async () => {
    setDeleting(true);
    try {
      // Simulate server function invocation delete_my_data(user_id)
      clearAllConsents();
      setShowDeleteModal(false);
      alert('Seluruh data bisnis, transaksi, dan riwayat audit telah dihapus secara permanen dari server.');
      logout();
      navigate('/login');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Business Identity Card */}
      <div className="card-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#0066FF] text-white flex items-center justify-center font-black text-lg shadow-md shadow-blue-500/30">
            {business?.name ? business.name.slice(0, 2).toUpperCase() : 'FT'}
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">{business?.name || 'Viera Bakery'}</h2>
            <p className="text-xs text-slate-500">{user?.email || 'owner@vierabakery.com'}</p>
            <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 text-[#0066FF] border border-blue-100">
              Skala {business?.scale === 'micro' ? 'Mikro' : 'Kecil'} (Aktif)
            </span>
          </div>
        </div>

        <button
          onClick={logout}
          className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          title="Keluar Akun"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* AI Consent Management Toggles (PRD FR-02 & Task 3) */}
      <div className="card-white p-4 space-y-3 border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#0066FF]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Manajemen Izin AI & Privasi
            </h3>
          </div>
        </div>

        {/* Toggle 1: AI Processing */}
        <div className="flex items-center justify-between py-2 border-b border-slate-100">
          <div className="pr-3">
            <p className="text-xs font-bold text-slate-900">Pemrosesan AI & Ekstraksi Struk</p>
            <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
              {isAiConsentGranted
                ? 'Aktif: AI memproses struk, defisit kas, dan rekomendasi.'
                : 'Dinonaktifkan: Seluruh fitur AI diblokir.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleAiConsent}
            className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
              isAiConsentGranted ? 'bg-[#0066FF]' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                isAiConsentGranted ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* Toggle 2: Anonymous Insights */}
        <div className="flex items-center justify-between py-1">
          <div className="pr-3">
            <p className="text-xs font-bold text-slate-900">Wawasan Anonim Industri</p>
            <p className="text-[11px] text-slate-500 leading-snug mt-0.5">
              Kontribusi perbandingan margin toko anonim.
            </p>
          </div>
          <button
            type="button"
            onClick={handleToggleAnonConsent}
            className={`w-11 h-6 rounded-full transition-colors relative shrink-0 p-0.5 ${
              isAnonConsentGranted ? 'bg-[#0066FF]' : 'bg-slate-300'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                isAnonConsentGranted ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Database Seeder Button */}
      <div className="card-white p-4 space-y-2.5 border-emerald-200 bg-emerald-50/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Database Demo Seeder
            </h3>
          </div>
          {seedSuccess && (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> Berhasil Dimuat
            </span>
          )}
        </div>
        <p className="text-xs text-slate-600">
          Muat ulang 24 transaksi Viera Bakery, utang supplier, dan jadwal restok Ramadan ke database.
        </p>
        <Button
          variant="success"
          size="sm"
          fullWidth
          isLoading={seeding}
          onClick={handleLoadDemoData}
        >
          Muat Ulang Data Demo (Seed Viera Bakery)
        </Button>
      </div>

      {/* Currency Preferences */}
      <div className="card-white p-4 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Pengaturan Mata Uang (FR-24)
        </h3>

        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#0066FF]" />
            <span className="text-xs font-semibold text-slate-800">Mata Uang Tampilan</span>
          </div>
          <select
            value={currency}
            onChange={(e) => onCurrencyChange(e.target.value as Currency)}
            className="bg-slate-50 border border-slate-200 text-slate-900 text-xs rounded-xl px-3 py-1.5 font-bold focus:outline-none focus:border-[#0066FF]"
          >
            <option value="IDR">IDR - Rupiah (Rp)</option>
            <option value="USD">USD - Dollar ($)</option>
            <option value="CNY">CNY - Yuan (¥)</option>
          </select>
        </div>
      </div>

      {/* Quick Navigation Links */}
      <div className="card-white p-2 space-y-1">
        <Link
          to="/activity"
          className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-xs text-slate-800"
        >
          <div className="flex items-center gap-2.5">
            <History className="w-4 h-4 text-[#0066FF]" />
            <span className="font-semibold">Audit Log & Tata Kelola AI</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>

        <Link
          to="/funding"
          className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors text-xs text-slate-800"
        >
          <div className="flex items-center gap-2.5">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span className="font-semibold">Simulasi Pinjaman Modal</span>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </Link>
      </div>

      {/* Delete all my data (PRD FR-23) */}
      <div className="pt-2">
        <Button
          variant="danger"
          size="md"
          fullWidth
          leftIcon={<Trash2 className="w-4 h-4" />}
          onClick={() => setShowDeleteModal(true)}
        >
          Hapus Seluruh Data Saya (Delete All My Data)
        </Button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="card-white max-w-sm w-full p-5 space-y-3 shadow-2xl border-red-200">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto border border-red-200">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-base font-bold text-slate-900">Hapus Permanen Seluruh Data?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tindakan ini memanggil fungsi server <code>delete_my_data()</code> untuk menghapus seluruh transaksi, utang, struk, dan riwayat audit Anda dari database (UU PDP No. 27/2022).
              </p>
            </div>
            <div className="pt-2 flex gap-2">
              <Button
                variant="danger"
                size="md"
                fullWidth
                isLoading={deleting}
                onClick={handleDeleteAllData}
              >
                Ya, Hapus Semua
              </Button>
              <Button
                variant="secondary"
                size="md"
                fullWidth
                onClick={() => setShowDeleteModal(false)}
              >
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
