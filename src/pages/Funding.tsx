import React, { useState } from 'react';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { TierBadge } from '../components/common/TierBadge';
import { SimulatedDataBadge } from '../components/common/SimulatedDataBadge';
import { mockFinancingProducts } from '../mock/vieraBakeryData';
import { useAuth } from '../context/AuthContext';
import { scoreFinancingProduct } from '../lib/scoring';
import { formatCurrency } from '../lib/formatters';
import { Currency } from '../types';
import {
  TrendingUp,
  ShieldAlert,
  CheckCircle,
  FileCheck2,
} from 'lucide-react';

interface FundingProps {
  currency?: Currency;
}

export const Funding: React.FC<FundingProps> = ({ currency = 'IDR' }) => {
  const { business } = useAuth();
  const [amount, setAmount] = useState<number>(5_000_000);
  const [tenor, setTenor] = useState<number>(24);
  const [purpose, setPurpose] = useState<string>('Ramadan Restock & Working Capital');
  const [proposalDrafted, setProposalDrafted] = useState<string | null>(null);

  const businessName = business?.name || 'Viera Bakery';
  const avgMonthlyProfit = business?.avgMonthlyProfit || 1_100_000;
  const healthyCap = Math.round(0.3 * avgMonthlyProfit); // 330,000 IDR

  const rankedProducts = mockFinancingProducts
    .map((product) => scoreFinancingProduct(product, amount, tenor, avgMonthlyProfit))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-4 pb-12">
      <SimulatedDataBadge variant="banner" />

      {/* SME Capacity Card */}
      <div className="card-white p-4 space-y-2 border-blue-100 bg-blue-50/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Kapasitas Cicilan Sehat
            </h2>
          </div>
          <TierBadge tier="T1" size="sm" />
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
          <div>
            <p className="text-[10px] text-slate-500">Rata-rata Laba Bulanan</p>
            <p className="font-bold text-slate-900">{formatCurrency(avgMonthlyProfit, currency)}</p>
          </div>
          <div>
            <p className="text-[10px] text-slate-500">Batas Cicilan Aman (30%)</p>
            <p className="font-bold text-emerald-600">{formatCurrency(healthyCap, currency)}/bln</p>
          </div>
        </div>
      </div>

      {/* Calculator Controls */}
      <div className="card-white p-4 space-y-3.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Kalkulator Simulasi Modal
        </h3>

        <div>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-slate-600 font-medium">Target Pinjaman</span>
            <span className="font-black text-[#0066FF]">{formatCurrency(amount, currency)}</span>
          </div>
          <input
            type="range"
            min={1_000_000}
            max={20_000_000}
            step={500_000}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full accent-[#0066FF] bg-slate-200 rounded-lg cursor-pointer h-2"
          />
          <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-mono">
            <span>1Jt</span>
            <span>5Jt</span>
            <span>10Jt</span>
            <span>20Jt</span>
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-600 font-medium mb-1.5">Tenor (Jangka Waktu)</label>
          <div className="grid grid-cols-4 gap-2 text-xs">
            {[3, 6, 12, 24].map((t) => (
              <button
                key={t}
                onClick={() => setTenor(t)}
                className={`py-2 rounded-2xl font-bold transition-all ${
                  tenor === t
                    ? 'bg-[#0066FF] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {t} Bln
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs text-slate-600 font-medium mb-1.5">Tujuan Modal</label>
          <input
            type="text"
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
          />
        </div>
      </div>

      {/* Ranked Financing Options */}
      <div className="space-y-3 pt-1">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
            Rekomendasi Pembiayaan ({rankedProducts.length})
          </h3>
          <span className="text-[10px] text-slate-500 font-medium">Berdasarkan Skor Kecocokan</span>
        </div>

        {rankedProducts.map((match) => {
          const { product, score, monthlyInstallment, riskWarning, reasons } = match;

          return (
            <div
              key={product.id}
              className={`card-white p-4 space-y-3 transition-all ${
                riskWarning
                  ? 'border-red-200 bg-red-50/20'
                  : score >= 80
                  ? 'border-blue-300 shadow-md'
                  : 'border-slate-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{product.name}</h4>
                  <p className="text-[11px] text-slate-500">{product.provider}</p>
                </div>

                <div className="text-right">
                  <div
                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-black ${
                      score >= 70
                        ? 'bg-emerald-100 text-emerald-800'
                        : score >= 40
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    <span>{score}/100</span>
                  </div>
                  <p className="text-[9px] text-slate-400 mt-0.5">Match Score</p>
                </div>
              </div>

              {/* Installment & Terms */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <p className="text-[10px] text-slate-500">Estimasi / Bln</p>
                  <p className="font-black text-slate-900">
                    {formatCurrency(monthlyInstallment, currency)}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Bunga (Flat/Thn)</p>
                  <p className="font-bold text-[#0066FF]">{(product.annualRate * 100).toFixed(1)}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Pencairan</p>
                  <p className="font-bold text-slate-700">~{product.speedDays} hari</p>
                </div>
              </div>

              {riskWarning && (
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2 text-[11px] text-red-700">
                  <ShieldAlert className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
                  <span>
                    <strong>Beban Cicilan Tinggi:</strong> Melebihi batas aman 30% laba ({formatCurrency(healthyCap, currency)}).
                  </span>
                </div>
              )}

              <div className="space-y-1">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Faktor Penilaian:</p>
                {reasons.slice(0, 3).map((r, idx) => (
                  <div key={idx} className="flex items-start gap-1.5 text-[11px] text-slate-600">
                    <CheckCircle className="w-3.5 h-3.5 text-[#0066FF] shrink-0 mt-0.5" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>

              <div className="pt-1">
                <Button
                  variant={score >= 70 ? 'primary' : 'outline'}
                  size="sm"
                  fullWidth
                  leftIcon={<FileCheck2 className="w-4 h-4" />}
                  onClick={() => setProposalDrafted(product.name)}
                >
                  Ajukan Proposal PDF (T2)
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {proposalDrafted && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="card-white max-w-sm w-full space-y-3 p-5 shadow-2xl">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#0066FF]">Proposal Siap</span>
              <TierBadge tier="T2" size="sm" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Draf Pengajuan: {proposalDrafted}</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Berkas pengajuan modal otomatis dirangkum dari data laba rugi {businessName}. Nominal: {formatCurrency(amount, currency)}, Tenor: {tenor} bulan.
            </p>
            <div className="pt-2 flex gap-2">
              <Button
                variant="primary"
                size="md"
                fullWidth
                onClick={() => {
                  alert('Proposal PDF berhasil diunduh & diajukan ke sandbox simulasi!');
                  setProposalDrafted(null);
                }}
              >
                Setujui & Unduh PDF
              </Button>
              <Button variant="secondary" size="md" onClick={() => setProposalDrafted(null)}>
                Batal
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
