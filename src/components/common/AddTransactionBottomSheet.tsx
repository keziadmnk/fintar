import React, { useState, useEffect } from 'react';
import { useTransactions } from '../../context/TransactionContext';
import { Button } from './Button';
import { predictCategory } from '../../lib/categorization';
import { Currency } from '../../types';
import { X, Sparkles, Plus, Minus, Calendar, Tag, FileText } from 'lucide-react';

interface AddTransactionBottomSheetProps {
  isOpen: boolean;
  initialType?: 'income' | 'expense';
  onClose: () => void;
  currency?: Currency;
}

export const AddTransactionBottomSheet: React.FC<AddTransactionBottomSheetProps> = ({
  isOpen,
  initialType = 'expense',
  onClose,
  currency = 'IDR',
}) => {
  const { addTransaction } = useTransactions();

  const [type, setType] = useState<'income' | 'expense'>(initialType);
  const [amount, setAmount] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [autoSuggested, setAutoSuggested] = useState(false);

  useEffect(() => {
    setType(initialType);
    setCategory(initialType === 'income' ? 'Bakery Sales' : 'Raw Materials');
  }, [initialType, isOpen]);

  // Auto-categorize as user types description (FR-06)
  useEffect(() => {
    if (description.trim().length >= 3) {
      const prediction = predictCategory(description, type);
      if (prediction.category) {
        setCategory(prediction.category);
        setAutoSuggested(true);
      }
    }
  }, [description, type]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseFloat(amount.replace(/[^0-9]/g, ''));
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      alert('Silakan masukkan nominal transaksi yang valid.');
      return;
    }

    setIsSubmitting(true);
    try {
      await addTransaction({
        type,
        amount: cleanAmount,
        category: category || (type === 'income' ? 'Bakery Sales' : 'Miscellaneous'),
        description: description || (type === 'income' ? 'Pemasukan Kasir' : 'Pengeluaran Operasional'),
        date,
        source: 'manual',
      });
      onClose();
      setAmount('');
      setDescription('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories =
    type === 'income'
      ? ['Bakery Sales', 'Catering', 'Online Orders', 'Wholesale', 'Other Income']
      : ['Raw Materials', 'Packaging', 'Logistics', 'Utilities', 'Maintenance', 'Marketing', 'Labor', 'Miscellaneous'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-end justify-center animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-[420px] rounded-t-[32px] p-5 space-y-4 shadow-2xl border-t border-slate-200 animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-white ${
                type === 'income' ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            >
              {type === 'income' ? <Plus className="w-4 h-4 stroke-[3px]" /> : <Minus className="w-4 h-4 stroke-[3px]" />}
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Catat {type === 'income' ? 'Pemasukan' : 'Pengeluaran'} Baru
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Type Toggle */}
        <div className="flex bg-slate-100 p-1 rounded-2xl text-xs font-bold">
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              type === 'income'
                ? 'bg-emerald-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            + Pemasukan (Income)
          </button>
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              type === 'expense'
                ? 'bg-rose-500 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            - Pengeluaran (Expense)
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Amount */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">
              Nominal ({currency})
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 font-bold text-slate-400 text-sm">Rp</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-3.5 py-2.5 text-base font-black text-slate-900 focus:outline-none focus:border-[#0066FF]"
                autoFocus
                required
              />
            </div>
          </div>

          {/* Description with Auto-Categorization Badge */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold uppercase text-slate-500 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> Keterangan / Barang
              </label>
              {autoSuggested && (
                <span className="text-[10px] font-bold text-[#0066FF] flex items-center gap-0.5 bg-blue-50 px-2 py-0.2 rounded-full">
                  <Sparkles className="w-2.5 h-2.5" /> Auto-kategori
                </span>
              )}
            </div>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Beli tepung terigu 25kg / Pesanan roti manis"
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
              required
            />
          </div>

          {/* Category Selector */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Kategori Transaksi
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setAutoSuggested(false);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0066FF]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Date */}
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" /> Tanggal Transaksi
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-3.5 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
              required
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <Button
              type="submit"
              variant={type === 'income' ? 'success' : 'danger'}
              size="lg"
              fullWidth
              isLoading={isSubmitting}
            >
              Simpan {type === 'income' ? 'Pemasukan' : 'Pengeluaran'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
