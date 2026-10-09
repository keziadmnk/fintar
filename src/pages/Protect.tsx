import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import { TierBadge } from '../components/common/TierBadge';
import { SimulatedDataBadge } from '../components/common/SimulatedDataBadge';
import { mockInsuranceProducts } from '../mock/vieraBakeryData';
import { useAuth } from '../context/AuthContext';
import { scoreInsuranceProduct } from '../lib/scoring';
import { formatCurrency } from '../lib/formatters';
import { Currency } from '../types';
import { Shield, Check, Flame, Waves, Zap, ShoppingBag, ShieldCheck } from 'lucide-react';

interface ProtectProps {
  currency?: Currency;
}

export const Protect: React.FC<ProtectProps> = ({ currency = 'IDR' }) => {
  const { business } = useAuth();
  const [selectedRisks, setSelectedRisks] = useState<string[]>([
    'Fire & Oven Explosion',
    'Raw Material Spoilage',
  ]);
  const [assetValue, setAssetValue] = useState<number>(25_000_000);

  const avgMonthlyProfit = business?.avgMonthlyProfit || 1_100_000;

  const availableRisks = [
    { id: 'Fire & Oven Explosion', label: 'Kebakaran & Oven', icon: <Flame className="w-3.5 h-3.5 text-rose-500" /> },
    { id: 'Raw Material Spoilage', label: 'Bahan Baku Rusak', icon: <ShoppingBag className="w-3.5 h-3.5 text-amber-500" /> },
    { id: 'Electrical Surge / Oven', label: 'Konslet / Mesin Oven', icon: <Zap className="w-3.5 h-3.5 text-yellow-500" /> },
    { id: 'Natural Disaster', label: 'Banjir & Bencana', icon: <Waves className="w-3.5 h-3.5 text-blue-500" /> },
  ];

  const toggleRisk = (riskId: string) => {
    setSelectedRisks((prev) =>
      prev.includes(riskId) ? prev.filter((r) => r !== riskId) : [...prev, riskId]
    );
  };

  const rankedPlans = mockInsuranceProducts
    .map((product) => scoreInsuranceProduct(product, selectedRisks, assetValue, avgMonthlyProfit))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="space-y-4 pb-12">
      <SimulatedDataBadge variant="banner" />

      {/* Risk Selection */}
      <div className="card-white p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#0066FF]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Pilih Risiko Toko Bakery
            </h3>
          </div>
          <TierBadge tier="T1" size="sm" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          {availableRisks.map((risk) => {
            const isSelected = selectedRisks.includes(risk.id);
            return (
              <button
                key={risk.id}
                onClick={() => toggleRisk(risk.id)}
                className={`p-2.5 rounded-2xl text-left border flex items-center gap-2 transition-all ${
                  isSelected
                    ? 'bg-blue-50 border-[#0066FF] text-[#0066FF] font-bold shadow-sm'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                {risk.icon}
                <span className="text-xs">{risk.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#0066FF] ml-auto" />}
              </button>
            );
          })}
        </div>

        <div className="pt-2">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-600">Estimasi Nilai Aset Bakery</span>
            <span className="font-bold text-slate-900">{formatCurrency(assetValue, currency)}</span>
          </div>
          <input
            type="range"
            min={5_000_000}
            max={50_000_000}
            step={5_000_000}
            value={assetValue}
            onChange={(e) => setAssetValue(Number(e.target.value))}
            className="w-full accent-[#0066FF] bg-slate-200 rounded-lg cursor-pointer h-2"
          />
        </div>
      </div>

      {/* Ranked Plans */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Paket Asuransi Mikro ({rankedPlans.length})
        </h3>

        {rankedPlans.map((item) => {
          const { product, score, premiumBurdenPct, reasons } = item;

          return (
            <div
              key={product.id}
              className={`card-white p-4 space-y-3 ${
                score >= 80 ? 'border-blue-300 shadow-md' : 'border-slate-100'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-sm font-bold text-slate-900">{product.name}</h4>
                  <p className="text-[11px] text-slate-500">{product.provider}</p>
                </div>
                <div className="text-right">
                  <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800">
                    {score}/100
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 p-2.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs">
                <div>
                  <p className="text-[10px] text-slate-500">Premi Bulanan</p>
                  <p className="font-bold text-emerald-600">
                    {formatCurrency(product.monthlyPremium, currency)}/bln
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-slate-500">Beban dari Laba</p>
                  <p className="font-bold text-slate-800">{(premiumBurdenPct * 100).toFixed(2)}% laba</p>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold text-slate-500 uppercase mb-1">Cakupan Proteksi:</p>
                <div className="flex flex-wrap gap-1">
                  {product.covers.map((c, i) => (
                    <span
                      key={i}
                      className="text-[10px] px-2 py-0.5 rounded-lg bg-slate-100 text-slate-700 font-medium"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1 pt-1">
                {reasons.map((r, idx) => (
                  <div key={idx} className="flex items-center gap-1.5 text-[11px] text-slate-600">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0066FF] shrink-0" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>

              <Button
                variant={score >= 80 ? 'primary' : 'outline'}
                size="sm"
                fullWidth
                onClick={() => alert(`Memilih paket ${product.name} (Simulasi)`)}
              >
                Pilih Proteksi
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
