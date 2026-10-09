import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import { ConfirmBar } from '../components/common/ConfirmBar';
import { TierBadge } from '../components/common/TierBadge';
import { ConsentGate } from '../components/common/ConsentGate';
import { formatCurrency } from '../lib/formatters';
import { Currency } from '../types';
import {
  Camera,
  AlertTriangle,
  CheckCircle2,
  Receipt,
} from 'lucide-react';

interface ScanProps {
  currency?: Currency;
}

export const Scan: React.FC<ScanProps> = ({ currency = 'IDR' }) => {
  const [step, setStep] = useState<'upload' | 'scanning' | 'confirm' | 'saved'>('upload');
  const [merchant, setMerchant] = useState('PT Toko Bahan Kue Sejahtera');
  const [receiptDate, setReceiptDate] = useState('2026-10-08');
  const [category, setCategory] = useState('Raw Materials');
  const [items] = useState([
    { id: '1', name: 'Tepung Terigu Protein Tinggi 25kg', qty: 2, price: 160000, confidence: 0.98 },
    { id: '2', name: 'Anchor Unsalted Butter 2kg', qty: 1, price: 95000, confidence: 0.95 },
    { id: '3', name: 'Ragi Instan Active Yeast 500g', qty: 1, price: 35000, confidence: 0.72 },
  ]);

  const subtotal = items.reduce((sum, item) => sum + item.qty * item.price, 0);
  const tax = 0;
  const computedTotal = subtotal + tax;

  const handleSimulateScan = () => {
    setStep('scanning');
    setTimeout(() => {
      setStep('confirm');
    }, 1200);
  };

  const handleSaveTransaction = () => {
    setStep('saved');
    setTimeout(() => {
      setStep('upload');
    }, 2200);
  };

  return (
    <ConsentGate featureName="Pindai Struk AI (OCR)">
      <div className="space-y-4 pb-20">
        {step === 'upload' && (
          <div className="space-y-4">
            <div className="text-center space-y-1 py-1">
              <h2 className="text-base font-bold text-slate-900">Foto Struk atau Faktur Belanja</h2>
              <p className="text-xs text-slate-500">
                AI otomatis mencatat toko, rincian barang, dan total pengeluaran.
              </p>
            </div>

            <div
              onClick={handleSimulateScan}
              className="border-2 border-dashed border-blue-200 hover:border-[#0066FF] bg-white rounded-3xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all active:scale-[0.99] group text-center space-y-3 shadow-sm"
            >
              <div className="w-16 h-16 rounded-2xl bg-blue-50 text-[#0066FF] flex items-center justify-center border border-blue-100 group-hover:scale-105 transition-transform">
                <Camera className="w-8 h-8" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Ambil Foto / Unggah Struk</p>
                <p className="text-xs text-slate-400 mt-1">Mendukung format JPG, PNG, PDF</p>
              </div>
              <Button variant="primary" size="sm" className="mt-2">
                Uji Coba Pindai Struk Demo
              </Button>
            </div>

            <div className="card-white p-3.5 space-y-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500">
                  Keamanan & Privasi AI
                </span>
                <TierBadge tier="T0" size="sm" />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Teks dalam struk diproses murni sebagai data numerik (Prompt Injection Defense). Data pribadi disamarkan sebelum diproses AI.
              </p>
            </div>
          </div>
        )}

        {step === 'scanning' && (
          <div className="py-16 text-center space-y-4">
            <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-50 text-[#0066FF] border border-blue-100">
              <Receipt className="w-10 h-10 animate-bounce" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Mengekstrak Rincian Struk...</h3>
              <p className="text-xs text-slate-500 mt-1">Membaca toko, nama barang, dan harga otomatis</p>
            </div>
          </div>
        )}

        {step === 'confirm' && (
          <div className="space-y-4 animate-in fade-in duration-300">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Konfirmasi Rincian Belanja</h3>
                <p className="text-[11px] text-slate-500">Periksa sebelum dicatat ke pembukuan</p>
              </div>
              <TierBadge tier="T2" size="sm" />
            </div>

            <div className="card-white p-4 space-y-3">
              <div>
                <label className="text-[10px] uppercase font-bold text-slate-500">Toko / Supplier</label>
                <input
                  type="text"
                  value={merchant}
                  onChange={(e) => setMerchant(e.target.value)}
                  className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:border-[#0066FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500">Tanggal</label>
                  <input
                    type="date"
                    value={receiptDate}
                    onChange={(e) => setReceiptDate(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
                  />
                </div>
                <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500">Kategori</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full mt-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-[#0066FF]"
                  >
                    <option value="Raw Materials">Bahan Baku (Raw Materials)</option>
                    <option value="Packaging">Kemasan (Packaging)</option>
                    <option value="Utilities">Utilitas</option>
                    <option value="Logistics">Logistik / Ongkir</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                Barang yang Terdeteksi ({items.length})
              </h4>

              {items.map((item) => {
                const isLowConfidence = (item.confidence || 1) < 0.85;

                return (
                  <div
                    key={item.id}
                    className={`card-white p-3 space-y-1.5 ${
                      isLowConfidence ? 'border-amber-300 bg-amber-50/40' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-900">{item.name}</span>
                          {isLowConfidence && (
                            <span className="inline-flex items-center gap-0.5 text-[9px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.2 rounded">
                              <AlertTriangle className="w-2.5 h-2.5 text-amber-600" /> Cek Harga
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {item.qty} pcs × {formatCurrency(item.price, currency)}
                        </p>
                      </div>
                      <span className="text-xs font-black text-slate-900">
                        {formatCurrency(item.qty * item.price, currency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="card-white p-4">
              <div className="flex justify-between items-center text-xs text-slate-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal, currency)}</span>
              </div>
              <div className="flex justify-between items-center text-sm font-black text-slate-900 mt-2 pt-2 border-t border-slate-100">
                <span>Total Dihitung Ulang</span>
                <span className="text-[#0066FF]">{formatCurrency(computedTotal, currency)}</span>
              </div>
            </div>

            <ConfirmBar
              primaryLabel="Simpan ke Buku Kas (T2 Act)"
              secondaryLabel="Foto Ulang"
              primaryVariant="primary"
              onPrimary={handleSaveTransaction}
              onSecondary={() => setStep('upload')}
              infoText="Aksi Tier-2: Konfirmasi Anda akan mencatat transaksi ke audit log."
            />
          </div>
        )}

        {step === 'saved' && (
          <div className="py-16 text-center space-y-4 animate-in zoom-in-95 duration-200">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 border border-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Transaksi Berhasil Dicatat!</h3>
              <p className="text-xs text-slate-500 mt-1">
                Pengeluaran ditambahkan • Audit log diperbarui (T2)
              </p>
            </div>
          </div>
        )}
      </div>
    </ConsentGate>
  );
};
