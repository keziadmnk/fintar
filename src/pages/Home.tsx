import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTransactions } from '../context/TransactionContext';
import { AlertCard } from '../components/common/AlertCard';
import { AddTransactionBottomSheet } from '../components/common/AddTransactionBottomSheet';
import { EditTransactionModal } from '../components/common/EditTransactionModal';
import { CsvImportModal } from '../components/common/CsvImportModal';
import { mockAlerts } from '../mock/vieraBakeryData';
import { formatCurrency, formatCompactNumber, formatDate } from '../lib/formatters';
import { Transaction, Currency } from '../types';
import {
  Landmark,
  ShieldCheck,
  ChevronRight,
  Send,
  MessageSquare,
  Plus,
  Minus,
  FileSpreadsheet,
  ArrowUpRight,
  ArrowDownLeft,
  Edit3,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface HomeProps {
  currency?: Currency;
}

export const Home: React.FC<HomeProps> = ({ currency = 'IDR' }) => {
  const { transactions, summary, loading, error, resetToDemoSeed } = useTransactions();

  // Bottom sheet & modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [addType, setAddType] = useState<'income' | 'expense'>('income');
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCsvOpen, setIsCsvOpen] = useState(false);

  // Dynamic calculations from reactive ledger (FR-07)
  const { income, expense, profit, marginPct } = summary;

  const handleOpenAdd = (type: 'income' | 'expense') => {
    setAddType(type);
    setIsAddOpen(true);
  };

  const handleSelectTx = (tx: Transaction) => {
    setSelectedTx(tx);
    setIsEditOpen(true);
  };

  const topCriticalAlert = mockAlerts.find((a) => a.level === 'critical');
  const recentTransactions = transactions.slice(0, 5);

  return (
    <div className="space-y-4">
      {/* 1. Hero Blue Gradient Card (Matching Reference Design) */}
      <div className="card-hero-blue p-5 text-white relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-blue-100">Profit Bulan Ini</span>
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-white/20 text-white tracking-wider backdrop-blur-sm">
            LITE PLAN
          </span>
        </div>

        {/* Dynamic Profit Value (Sum of source transactions) */}
        <div className="mt-2 text-3xl font-black tracking-tight text-white">
          {formatCurrency(profit, currency)}
        </div>

        <p className="mt-1 text-xs text-blue-100/90 font-medium">
          Margin {marginPct.toFixed(1)}% • {transactions.length} transaksi tercatat
        </p>

        {/* Income & Expense Breakdown Boxes */}
        <div className="mt-4 grid grid-cols-2 gap-2.5">
          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-blue-100 tracking-wider">
              PEMASUKAN
            </span>
            <p className="text-sm font-black text-white mt-0.5">
              +{currency === 'IDR' ? `Rp${(income / 1000).toLocaleString('id-ID')}k` : formatCompactNumber(income)}
            </p>
          </div>

          <div className="bg-white/15 backdrop-blur-md rounded-2xl p-3 border border-white/10">
            <span className="text-[10px] uppercase font-bold text-blue-100 tracking-wider">
              PENGELUARAN
            </span>
            <p className="text-sm font-black text-white mt-0.5">
              -{currency === 'IDR' ? `Rp${(expense / 1000).toLocaleString('id-ID')}k` : formatCompactNumber(expense)}
            </p>
          </div>
        </div>

        {/* Quick Add Buttons: + Pemasukan and - Pengeluaran */}
        <div className="mt-3.5 grid grid-cols-2 gap-2.5">
          <button
            type="button"
            onClick={() => handleOpenAdd('income')}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-white text-[#0066FF] rounded-2xl font-bold text-xs shadow-sm hover:bg-blue-50 active:scale-95 transition-all text-center"
          >
            <Plus className="w-4 h-4 stroke-[3px]" />
            <span>+ Pemasukan</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAdd('expense')}
            className="flex items-center justify-center gap-1.5 py-2.5 px-4 bg-blue-700/60 text-white rounded-2xl font-bold text-xs border border-white/20 hover:bg-blue-700/80 active:scale-95 transition-all text-center"
          >
            <Minus className="w-4 h-4 stroke-[3px]" />
            <span>- Pengeluaran</span>
          </button>
        </div>
      </div>

      {/* 2. Quick Action Cards (Side-by-side) + CSV Import Banner */}
      <div className="grid grid-cols-2 gap-3">
        <Link
          to="/funding"
          className="card-white p-3.5 flex items-center gap-3 hover:border-slate-300 active:scale-[0.98] transition-all"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <Landmark className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-900 leading-snug">Ajukan Modal</h3>
            <p className="text-[10px] text-slate-500 truncate">Cocokkan pembiayaan</p>
          </div>
        </Link>

        <Link
          to="/protect"
          className="card-white p-3.5 flex items-center gap-3 hover:border-slate-300 active:scale-[0.98] transition-all"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-100">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-slate-900 leading-snug">Asuransi Toko</h3>
            <p className="text-[10px] text-slate-500 truncate">Cari perlindungan</p>
          </div>
        </Link>
      </div>

      {/* CSV Import Shortcut Card (FR-05) */}
      <div
        onClick={() => setIsCsvOpen(true)}
        className="card-white p-3 flex items-center justify-between border-emerald-100 bg-emerald-50/40 cursor-pointer hover:border-emerald-300 transition-all"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">Impor Pembukuan CSV</h4>
            <p className="text-[10px] text-slate-500">Validasi otomatis & laporan baris eror</p>
          </div>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400" />
      </div>

      {/* 3. Cash Flow Alerts Section */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Peringatan Arus Kas</h2>
          <Link to="/alerts" className="text-xs font-bold text-[#0066FF] hover:underline">
            Lihat {mockAlerts.length}
          </Link>
        </div>

        {topCriticalAlert && (
          <AlertCard
            level={topCriticalAlert.level}
            title="Kas diperkirakan menipis dalam 9 hari"
            detail="Restok Ramadan sekitar Rp1,4 jt melebihi saldo kas Rp1,1 jt. Siapkan modal atau tunda sebagian belanja."
            suggestedAction="Siapkan modal mikro (KUR 6%)"
            actionRoute="/funding"
          />
        )}
      </div>

      {/* 4. Finix AI Analysis Dark Card */}
      <div className="card-dark-ai p-4 text-white space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-emerald-400 text-slate-900 flex items-center justify-center text-xs font-black">
              🤖
            </div>
            <h3 className="text-xs font-bold text-white">Finix AI Analysis</h3>
          </div>
          <Link to="/assistant">
            <ChevronRight className="w-4 h-4 text-slate-400 hover:text-white" />
          </Link>
        </div>

        <p className="text-xs text-slate-200 leading-relaxed">
          Bulan depan adalah Ramadan. Tambah stok <strong className="text-white font-bold">tepung terigu 20%</strong> berdasarkan tren penjualanmu.
        </p>

        <div className="pt-2 border-t border-slate-800/80 flex items-center gap-2">
          <Link
            to="/assistant"
            className="flex-1 py-2 px-3 rounded-full bg-[#0066FF] text-white text-xs font-bold flex items-center justify-center gap-1.5 active:scale-95 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Browse</span>
          </Link>

          <Link
            to="/assistant"
            className="flex-1 py-2 px-3 rounded-full bg-slate-800 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-slate-700 active:scale-95 transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Comment</span>
          </Link>
        </div>
      </div>

      {/* Supabase Error Notice (if any) */}
      {error && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-2xl flex items-center gap-2.5 text-xs">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span className="flex-1 font-medium">{error}</span>
        </div>
      )}

      {/* 5. Recent Transactions List (FR-07) with edit & delete access */}
      <div className="space-y-2 pt-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Transaksi Terakhir ({transactions.length})
            </h3>
            {loading && <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0066FF]" />}
          </div>
          <Link
            to="/reports"
            className="text-xs font-bold text-[#0066FF] hover:underline flex items-center gap-0.5"
          >
            Lihat Semua <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {transactions.length === 0 ? (
          <div className="card-white p-6 text-center space-y-3">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-[#0066FF] mx-auto flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-900">Belum Ada Transaksi</p>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Mulai catat transaksi manual atau muat paket data demo Viera Bakery
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => resetToDemoSeed()}
                disabled={loading}
                className="px-3.5 py-1.5 rounded-full bg-[#0066FF] text-white text-xs font-bold hover:bg-blue-700 active:scale-95 transition-all shadow-sm flex items-center gap-1.5"
              >
                {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                <span>Muat Data Demo</span>
              </button>
              <button
                type="button"
                onClick={() => handleOpenAdd('income')}
                className="px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 active:scale-95 transition-all"
              >
                + Catat Baru
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((tx) => (
              <div
                key={tx.id}
                onClick={() => handleSelectTx(tx)}
                className="card-white p-3 flex items-center justify-between hover:border-slate-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-2xl flex items-center justify-center shrink-0 ${
                      tx.type === 'income'
                        ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                        : 'bg-rose-50 text-rose-600 border border-rose-100'
                    }`}
                  >
                    {tx.type === 'income' ? (
                      <ArrowDownLeft className="w-4 h-4" />
                    ) : (
                      <ArrowUpRight className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 truncate max-w-[180px]">
                      {tx.description}
                    </h4>
                    <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                      <span className="font-semibold text-slate-600">{tx.category}</span>
                      <span>•</span>
                      <span>{formatDate(tx.date)}</span>
                      <span>•</span>
                      <span className="uppercase text-[8px] font-mono px-1 py-0.2 rounded bg-slate-100 text-slate-600 font-bold">
                        {tx.source}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-black ${
                      tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount, currency)}
                  </span>
                  <Edit3 className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#0066FF] transition-colors" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Add Bottom Sheet */}
      <AddTransactionBottomSheet
        isOpen={isAddOpen}
        initialType={addType}
        onClose={() => setIsAddOpen(false)}
        currency={currency}
      />

      {/* Edit/Delete Transaction Modal */}
      <EditTransactionModal
        transaction={selectedTx}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
      />

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={isCsvOpen}
        onClose={() => setIsCsvOpen(false)}
      />
    </div>
  );
};
