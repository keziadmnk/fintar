import React, { useState, useEffect } from 'react';
import { Transaction } from '../../types';
import { useTransactions } from '../../context/TransactionContext';
import { Button } from './Button';
import { X, Trash2, Edit2 } from 'lucide-react';

interface EditTransactionModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const EditTransactionModal: React.FC<EditTransactionModalProps> = ({
  transaction,
  isOpen,
  onClose,
}) => {
  const { updateTransaction, deleteTransaction } = useTransactions();

  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');

  useEffect(() => {
    if (transaction) {
      setCategory(transaction.category);
      setDescription(transaction.description);
      setAmount(transaction.amount);
      setDate(transaction.date);
      setType(transaction.type);
    }
  }, [transaction]);

  if (!isOpen || !transaction) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateTransaction(transaction.id, {
      category,
      description,
      amount,
      date,
      type,
    });
    onClose();
  };

  const handleDelete = async () => {
    if (confirm('Hapus transaksi ini dari buku kas?')) {
      await deleteTransaction(transaction.id);
      onClose();
    }
  };

  const categories =
    type === 'income'
      ? ['Bakery Sales', 'Catering', 'Online Orders', 'Wholesale', 'Other Income']
      : ['Raw Materials', 'Packaging', 'Logistics', 'Utilities', 'Maintenance', 'Marketing', 'Labor', 'Miscellaneous'];

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="card-white max-w-sm w-full p-5 space-y-4 shadow-2xl border-slate-200">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Edit2 className="w-4 h-4 text-[#0066FF]" />
            <h3 className="text-sm font-bold text-slate-900">Ubah Transaksi</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="space-y-3">
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Keterangan</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0066FF]"
              required
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Kategori (Koreksi Disimpan)</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0066FF]"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Nominal (Rp)</label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-900 focus:outline-none focus:border-[#0066FF]"
                required
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Tanggal</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
                required
              />
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button type="submit" variant="primary" size="md" fullWidth>
              Simpan Perubahan
            </Button>
            <Button
              type="button"
              variant="danger"
              size="md"
              leftIcon={<Trash2 className="w-4 h-4" />}
              onClick={handleDelete}
            >
              Hapus
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
