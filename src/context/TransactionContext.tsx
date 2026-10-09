import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Transaction } from '../types';
import { mockTransactions } from '../mock/vieraBakeryData';
import { useAuth } from './AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';
import { seedDemoDataForUser } from '../lib/supabase';

export interface FinancialSummary {
  income: number;
  expense: number;
  profit: number;
  marginPct: number;
  healthyCap: number;
  transactionCount: number;
}

interface TransactionContextType {
  transactions: Transaction[];
  summary: FinancialSummary;
  loading: boolean;
  error: string | null;
  addTransaction: (data: Omit<Transaction, 'id' | 'businessId'>) => Promise<Transaction>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  importTransactions: (newRows: Omit<Transaction, 'id' | 'businessId'>[]) => Promise<number>;
  resetToDemoSeed: () => Promise<void>;
  refreshTransactions: () => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

const TX_STORAGE_KEY = 'fintar_transactions_data';

// Helper to map DB row to client Transaction model
function mapDbRowToTransaction(row: any): Transaction {
  return {
    id: row.id,
    businessId: row.business_id,
    type: row.type,
    amount: Number(row.amount),
    category: row.category,
    description: row.description,
    date: row.date,
    source: row.source || 'manual',
    receiptId: row.receipt_id || undefined,
  };
}

export const TransactionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, business } = useAuth();
  const businessId = business?.id || 'biz_viera_001';

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(TX_STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      } catch {
        // fallback
      }
    }
    return mockTransactions;
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sync to localStorage as client cache / fallback
  useEffect(() => {
    localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(transactions));
  }, [transactions]);

  // Load transactions from Supabase if configured
  const fetchTransactions = useCallback(async () => {
    if (!isSupabaseConfigured) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch transactions for the current business
      const { data, error: fetchErr } = await supabase
        .from('transactions')
        .select('*')
        .eq('business_id', businessId)
        .order('date', { ascending: false });

      if (fetchErr) {
        throw fetchErr;
      }

      if (data && data.length > 0) {
        const mapped = data.map(mapDbRowToTransaction);
        setTransactions(mapped);
      } else if (data && data.length === 0) {
        // No transactions found in Supabase for this business yet
        setTransactions([]);
      }
    } catch (err: any) {
      console.error('[TransactionContext] Error fetching from Supabase:', err);
      setError(err?.message || 'Gagal memuat data transaksi dari Supabase');
    } finally {
      setLoading(false);
    }
  }, [businessId]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Compute dynamic summary metrics in real-time (FR-07)
  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const profit = income - expense;
  const marginPct = income > 0 ? (profit / income) * 100 : 0;
  const healthyCap = Math.max(0, Math.round(profit * 0.3));

  const summary: FinancialSummary = {
    income,
    expense,
    profit,
    marginPct,
    healthyCap,
    transactionCount: transactions.length,
  };

  const addTransaction = async (
    data: Omit<Transaction, 'id' | 'businessId'>
  ): Promise<Transaction> => {
    setError(null);
    let newTx: Transaction;

    if (isSupabaseConfigured) {
      try {
        const dbPayload = {
          business_id: businessId,
          type: data.type,
          amount: data.amount,
          category: data.category,
          description: data.description,
          date: data.date,
          source: data.source,
          receipt_id: data.receiptId || null,
        };

        const { data: inserted, error: insertErr } = await supabase
          .from('transactions')
          .insert(dbPayload as any)
          .select()
          .single();

        if (insertErr) throw insertErr;

        newTx = mapDbRowToTransaction(inserted);
        setTransactions((prev) => [newTx, ...prev]);
        return newTx;
      } catch (err: any) {
        console.error('[TransactionContext] Error adding to Supabase:', err);
        setError(err?.message || 'Gagal menyimpan transaksi ke Supabase');
        // Fallback to local state so user does not lose input
        newTx = {
          id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          businessId,
          ...data,
        };
        setTransactions((prev) => [newTx, ...prev]);
        return newTx;
      }
    } else {
      newTx = {
        id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        businessId,
        ...data,
      };
      setTransactions((prev) => [newTx, ...prev]);
      return newTx;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    setError(null);
    if (isSupabaseConfigured) {
      try {
        const dbUpdates: Record<string, any> = {};
        if (updates.type !== undefined) dbUpdates.type = updates.type;
        if (updates.amount !== undefined) dbUpdates.amount = updates.amount;
        if (updates.category !== undefined) dbUpdates.category = updates.category;
        if (updates.description !== undefined) dbUpdates.description = updates.description;
        if (updates.date !== undefined) dbUpdates.date = updates.date;
        if (updates.source !== undefined) dbUpdates.source = updates.source;

        const { error: updateErr } = await supabase
          .from('transactions')
          .update(dbUpdates as any)
          .eq('id', id);

        if (updateErr) throw updateErr;

        setTransactions((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
        );
      } catch (err: any) {
        console.error('[TransactionContext] Error updating in Supabase:', err);
        setError(err?.message || 'Gagal mengubah transaksi di Supabase');
        setTransactions((prev) =>
          prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
        );
      }
    } else {
      setTransactions((prev) =>
        prev.map((t) => (t.id === id ? { ...t, ...updates } : t))
      );
    }
  };

  const deleteTransaction = async (id: string) => {
    setError(null);
    if (isSupabaseConfigured) {
      try {
        const { error: delErr } = await supabase
          .from('transactions')
          .delete()
          .eq('id', id);

        if (delErr) throw delErr;

        setTransactions((prev) => prev.filter((t) => t.id !== id));
      } catch (err: any) {
        console.error('[TransactionContext] Error deleting in Supabase:', err);
        setError(err?.message || 'Gagal menghapus transaksi dari Supabase');
        setTransactions((prev) => prev.filter((t) => t.id !== id));
      }
    } else {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
    }
  };

  const importTransactions = async (
    newRows: Omit<Transaction, 'id' | 'businessId'>[]
  ): Promise<number> => {
    setError(null);
    if (isSupabaseConfigured) {
      try {
        const dbPayloads = newRows.map((r) => ({
          business_id: businessId,
          type: r.type,
          amount: r.amount,
          category: r.category,
          description: r.description,
          date: r.date,
          source: r.source,
          receipt_id: r.receiptId || null,
        }));

        const { data: inserted, error: insertErr } = await supabase
          .from('transactions')
          .insert(dbPayloads as any)
          .select();

        if (insertErr) throw insertErr;

        if (inserted) {
          const mapped = inserted.map(mapDbRowToTransaction);
          setTransactions((prev) => [...mapped, ...prev]);
          return mapped.length;
        }
      } catch (err: any) {
        console.error('[TransactionContext] Error bulk inserting to Supabase:', err);
        setError(err?.message || 'Gagal mengimpor transaksi ke Supabase');
      }
    }

    const prepared: Transaction[] = newRows.map((r, idx) => ({
      id: `tx_csv_${Date.now()}_${idx}`,
      businessId,
      ...r,
    }));

    setTransactions((prev) => [...prepared, ...prev]);
    return prepared.length;
  };

  const resetToDemoSeed = async () => {
    setError(null);
    setLoading(true);
    try {
      await seedDemoDataForUser(user?.id || 'user_viera_owner');
      if (isSupabaseConfigured) {
        await fetchTransactions();
      } else {
        setTransactions(mockTransactions);
        localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(mockTransactions));
      }
    } catch (err: any) {
      console.error('[TransactionContext] Error resetting demo data:', err);
      setError(err?.message || 'Gagal memuat ulang data demo');
      setTransactions(mockTransactions);
    } finally {
      setLoading(false);
    }
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        summary,
        loading,
        error,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        importTransactions,
        resetToDemoSeed,
        refreshTransactions: fetchTransactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
