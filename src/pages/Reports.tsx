import React, { useState } from 'react';
import { useTransactions } from '../context/TransactionContext';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/common/Button';
import { EditTransactionModal } from '../components/common/EditTransactionModal';
import { CsvImportModal } from '../components/common/CsvImportModal';
import { formatCurrency, formatDate } from '../lib/formatters';
import { Transaction, Currency } from '../types';
import {
  generateFullReport,
  exportReportToPdf,
  exportReportToExcel,
  ReportPeriod,
} from '../lib/reports';
import {
  FileSpreadsheet,
  FileText,
  Upload,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Edit3,
  BarChart3,
} from 'lucide-react';

interface ReportsProps {
  currency?: Currency;
}

const PERIOD_LABELS: Record<ReportPeriod, string> = {
  '7d': '7 Hari',
  month: 'Bulan Ini',
  '3m': '3 Bulan',
  year: '1 Tahun',
  all: 'Semua',
};

export const Reports: React.FC<ReportsProps> = ({ currency = 'IDR' }) => {
  const { transactions } = useTransactions();
  const { business } = useAuth();
  const businessName = business?.name || 'Viera Bakery';

  const [period, setPeriod] = useState<ReportPeriod>('month');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [tab, setTab] = useState<'pnl' | 'cashflow' | 'list'>('pnl');
  const [isExporting, setIsExporting] = useState<'pdf' | 'xlsx' | null>(null);
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isCsvOpen, setIsCsvOpen] = useState(false);

  // Compute full report using pure lib (ensures totals match dashboard)
  const report = generateFullReport(transactions, period);

  // Filtered transactions for the list tab
  const filteredTransactions = transactions.filter((tx) => {
    if (period !== 'all') {
      const txDate = new Date(tx.date);
      const now = new Date('2026-10-08T12:00:00');
      if (period === '7d') {
        const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (txDate < d7) return false;
      } else if (period === 'month') {
        if (!tx.date.startsWith('2026-10')) return false;
      } else if (period === '3m') {
        const d90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        if (txDate < d90) return false;
      }
    }
    if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
    return true;
  });

  const handleExportPdf = () => {
    setIsExporting('pdf');
    try {
      exportReportToPdf(report, businessName, currency);
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportExcel = () => {
    setIsExporting('xlsx');
    try {
      exportReportToExcel(report, businessName, currency);
    } finally {
      setIsExporting(null);
    }
  };

  const { pnl, cashFlow } = report;

  return (
    <div className="space-y-4 pb-12">
      {/* Period Filter */}
      <div className="flex bg-slate-200/70 p-1 rounded-2xl text-xs">
        {(Object.keys(PERIOD_LABELS) as ReportPeriod[]).map((p) => (
          <button
            key={p}
            id={`period-tab-${p}`}
            onClick={() => setPeriod(p)}
            className={`flex-1 py-2 font-bold rounded-xl transition-all ${
              period === p ? 'bg-white text-[#0066FF] shadow-sm' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {PERIOD_LABELS[p]}
          </button>
        ))}
      </div>

      {/* Report summary badge */}
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] text-slate-400 font-medium">
          {report.transactionCount} transaksi &bull; {report.periodLabel}
        </span>
        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
          <BarChart3 className="w-3 h-3" />
          Data aktual
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200">
        {([
          { key: 'pnl', label: 'Laba Rugi (P&L)' },
          { key: 'cashflow', label: 'Arus Kas' },
          { key: 'list', label: `Transaksi (${filteredTransactions.length})` },
        ] as const).map(({ key, label }) => (
          <button
            key={key}
            id={`report-tab-${key}`}
            onClick={() => setTab(key)}
            className={`pb-2.5 px-3 text-xs font-bold border-b-2 transition-colors ${
              tab === key
                ? 'border-[#0066FF] text-[#0066FF]'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* P&L Tab */}
      {tab === 'pnl' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="card-white p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500">Pendapatan Bruto</span>
              <p className="text-base font-black text-emerald-600">{formatCurrency(pnl.revenue, currency)}</p>
              <p className="text-[10px] text-slate-400">Gross Revenue</p>
            </div>
            <div className="card-white p-3.5 space-y-1">
              <span className="text-[10px] font-bold uppercase text-slate-500">Laba Bersih</span>
              <p className={`text-base font-black ${pnl.netProfit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrency(pnl.netProfit, currency)}
              </p>
              <p className="text-[10px] text-slate-400">Net Profit</p>
            </div>
          </div>

          {/* P&L Waterfall */}
          <div className="card-white p-4 space-y-0">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">Laporan Laba Rugi</h3>
            <div className="flex justify-between items-center py-2.5 border-b border-slate-50">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span className="text-xs text-slate-700">Pendapatan (Revenue)</span>
              </div>
              <span className="text-xs font-black text-emerald-600">+{formatCurrency(pnl.revenue, currency)}</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-slate-50 pl-4">
              <span className="text-xs text-slate-500">Harga Pokok Penjualan (COGS)</span>
              <span className="text-xs font-semibold text-rose-500">-{formatCurrency(pnl.cogs, currency)}</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-slate-200 bg-slate-50 -mx-4 px-4">
              <span className="text-xs font-bold text-slate-900">Laba Kotor (Gross Profit)</span>
              <span className={`text-xs font-black ${pnl.grossProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatCurrency(pnl.grossProfit, currency)}
              </span>
            </div>
            <div className="flex justify-between items-center py-1.5 border-b border-slate-50 pl-4">
              <span className="text-[10px] text-slate-400">Gross Margin</span>
              <span className="text-[10px] font-semibold text-slate-600">{pnl.grossMarginPct.toFixed(1)}%</span>
            </div>
            <div className="flex justify-between items-center py-2.5 border-b border-slate-50 pl-4">
              <span className="text-xs text-slate-500">Beban Operasional (OpEx)</span>
              <span className="text-xs font-semibold text-rose-500">-{formatCurrency(pnl.operatingExpenses, currency)}</span>
            </div>
            <div className="flex justify-between items-center py-3 bg-slate-900 -mx-4 px-4 rounded-b-2xl mt-1">
              <span className="text-xs font-bold text-white">LABA BERSIH (Net Profit)</span>
              <span className={`text-sm font-black ${pnl.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {formatCurrency(pnl.netProfit, currency)}
              </span>
            </div>
          </div>

          {/* Net Margin bar */}
          <div className="card-white p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">Net Margin</span>
              <span className={`text-sm font-black ${pnl.netMarginPct >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {pnl.netMarginPct.toFixed(1)}%
              </span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${pnl.netMarginPct >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
                style={{ width: `${Math.min(Math.abs(pnl.netMarginPct), 100)}%` }}
              />
            </div>
            <p className="text-[10px] text-slate-400 mt-1.5">
              Dari setiap Rp100 pendapatan, Rp{Math.abs(pnl.netMarginPct).toFixed(0)} adalah laba bersih.
            </p>
          </div>

          {/* COGS Breakdown */}
          {Object.keys(pnl.cogsBreakdown).length > 0 && (
            <div className="card-white p-4 space-y-2.5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Rincian HPP (COGS)</h4>
              {Object.entries(pnl.cogsBreakdown).map(([cat, amount]) => (
                <div key={cat} className="flex justify-between text-xs">
                  <span className="text-slate-600">{cat}</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(amount as number, currency)}</span>
                </div>
              ))}
            </div>
          )}

          {/* OpEx Breakdown */}
          {Object.keys(pnl.opexBreakdown).length > 0 && (
            <div className="card-white p-4 space-y-2.5">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Rincian Beban Operasional</h4>
              {Object.entries(pnl.opexBreakdown).map(([cat, amount]) => {
                const pct = pnl.operatingExpenses > 0 ? ((amount as number) / pnl.operatingExpenses) * 100 : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-600">{cat}</span>
                      <span className="font-semibold text-slate-900">
                        {formatCurrency(amount as number, currency)} ({pct.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#0066FF] rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Cash Flow Tab */}
      {tab === 'cashflow' && (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-2">
            <div className="card-white p-3 space-y-0.5 text-center">
              <p className="text-[10px] font-bold uppercase text-slate-500">Kas Masuk</p>
              <p className="text-sm font-black text-emerald-600">{formatCurrency(cashFlow.cashIn, currency)}</p>
            </div>
            <div className="card-white p-3 space-y-0.5 text-center">
              <p className="text-[10px] font-bold uppercase text-slate-500">Kas Keluar</p>
              <p className="text-sm font-black text-rose-600">{formatCurrency(cashFlow.cashOut, currency)}</p>
            </div>
            <div className="card-white p-3 space-y-0.5 text-center">
              <p className="text-[10px] font-bold uppercase text-slate-500">Net</p>
              <p className={`text-sm font-black ${cashFlow.netCashFlow >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrency(cashFlow.netCashFlow, currency)}
              </p>
            </div>
          </div>

          {/* Operating */}
          <div className="card-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">Aktivitas Operasional</h3>
              <span className={`text-xs font-black ${cashFlow.operatingNet >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrency(cashFlow.operatingNet, currency)}
              </span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1"><ArrowDownLeft className="w-3 h-3 text-emerald-500" /> Penerimaan Operasional</span>
                <span className="font-semibold text-emerald-600">+{formatCurrency(cashFlow.operatingInflow, currency)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span className="flex items-center gap-1"><ArrowUpRight className="w-3 h-3 text-rose-500" /> Pengeluaran Operasional</span>
                <span className="font-semibold text-rose-600">-{formatCurrency(cashFlow.operatingOutflow, currency)}</span>
              </div>
            </div>
          </div>

          {/* Investing */}
          <div className="card-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">Aktivitas Investasi</h3>
              <span className={`text-xs font-black ${cashFlow.investingNet >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrency(cashFlow.investingNet, currency)}
              </span>
            </div>
            {cashFlow.investingInflow === 0 && cashFlow.investingOutflow === 0 ? (
              <p className="text-[10px] text-slate-400">Tidak ada aktivitas investasi pada periode ini.</p>
            ) : (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Pembelian Aset / Peralatan</span>
                  <span className="font-semibold text-rose-600">-{formatCurrency(cashFlow.investingOutflow, currency)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Financing */}
          <div className="card-white p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900">Aktivitas Pendanaan</h3>
              <span className={`text-xs font-black ${cashFlow.financingNet >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {formatCurrency(cashFlow.financingNet, currency)}
              </span>
            </div>
            {cashFlow.financingInflow === 0 && cashFlow.financingOutflow === 0 ? (
              <p className="text-[10px] text-slate-400">Tidak ada aktivitas pendanaan pada periode ini.</p>
            ) : (
              <div className="space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Penerimaan Pinjaman / Modal</span>
                  <span className="font-semibold text-emerald-600">+{formatCurrency(cashFlow.financingInflow, currency)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Pembayaran Pinjaman / Utang</span>
                  <span className="font-semibold text-rose-600">-{formatCurrency(cashFlow.financingOutflow, currency)}</span>
                </div>
              </div>
            )}
          </div>

          {/* Net summary bar */}
          <div className={`p-4 rounded-2xl flex items-center justify-between ${
            cashFlow.netCashFlow >= 0 ? 'bg-emerald-50 border border-emerald-100' : 'bg-rose-50 border border-rose-100'
          }`}>
            <div>
              <p className="text-[10px] font-bold uppercase text-slate-500">Net Arus Kas Periode Ini</p>
              <p className={`text-base font-black mt-0.5 ${cashFlow.netCashFlow >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                {formatCurrency(cashFlow.netCashFlow, currency)}
              </p>
            </div>
            {cashFlow.netCashFlow >= 0 ? (
              <TrendingUp className="w-8 h-8 text-emerald-400" />
            ) : (
              <TrendingDown className="w-8 h-8 text-rose-400" />
            )}
          </div>
        </div>
      )}

      {/* Transaction List Tab */}
      {tab === 'list' && (
        <div className="space-y-3">
          <div className="flex gap-2 text-xs font-semibold">
            {(['all', 'income', 'expense'] as const).map((t) => (
              <button
                key={t}
                id={`type-filter-${t}`}
                onClick={() => setTypeFilter(t)}
                className={`py-1.5 px-3 rounded-xl border transition-all ${
                  typeFilter === t
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {t === 'all' ? 'Semua Tipe' : t === 'income' ? '+ Pemasukan' : '- Pengeluaran'}
              </button>
            ))}
          </div>

          <div className="space-y-2">
            {filteredTransactions.length === 0 ? (
              <div className="card-white p-6 text-center">
                <p className="text-xs text-slate-400">Tidak ada transaksi pada periode ini.</p>
              </div>
            ) : (
              filteredTransactions.map((tx) => (
                <div
                  key={tx.id}
                  onClick={() => { setSelectedTx(tx); setIsEditOpen(true); }}
                  className="card-white p-3 flex items-center justify-between hover:border-slate-300 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                        tx.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                      }`}
                    >
                      {tx.type === 'income' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate max-w-[170px]">{tx.description}</h4>
                      <p className="text-[10px] text-slate-400">{tx.category} &bull; {formatDate(tx.date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-black ${tx.type === 'income' ? 'text-emerald-600' : 'text-slate-900'}`}>
                      {tx.type === 'income' ? '+' : '-'} {formatCurrency(tx.amount, currency)}
                    </span>
                    <Edit3 className="w-3.5 h-3.5 text-slate-300 group-hover:text-[#0066FF]" />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Export & Import Buttons */}
      <div className="pt-2 grid grid-cols-3 gap-2">
        <Button
          id="export-pdf-btn"
          variant="secondary"
          size="sm"
          leftIcon={<FileText className="w-3.5 h-3.5 text-[#0066FF]" />}
          onClick={handleExportPdf}
          disabled={isExporting === 'pdf'}
        >
          {isExporting === 'pdf' ? '...' : 'PDF'}
        </Button>
        <Button
          id="export-excel-btn"
          variant="secondary"
          size="sm"
          leftIcon={<FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />}
          onClick={handleExportExcel}
          disabled={isExporting === 'xlsx'}
        >
          {isExporting === 'xlsx' ? '...' : 'Excel'}
        </Button>
        <Button
          id="import-csv-btn"
          variant="primary"
          size="sm"
          leftIcon={<Upload className="w-3.5 h-3.5" />}
          onClick={() => setIsCsvOpen(true)}
        >
          Impor CSV
        </Button>
      </div>

      <p className="text-[10px] text-slate-400 text-center px-4">
        File ekspor mencakup nama usaha, periode, dan tanggal generate.
      </p>

      <EditTransactionModal transaction={selectedTx} isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} />
      <CsvImportModal isOpen={isCsvOpen} onClose={() => setIsCsvOpen(false)} />
    </div>
  );
};
