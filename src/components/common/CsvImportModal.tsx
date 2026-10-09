import React, { useState } from 'react';
import { useTransactions } from '../../context/TransactionContext';
import { parseTransactionsCsv, CsvValidationResult } from '../../lib/csvParser';
import { Button } from './Button';
import { formatCurrency } from '../../lib/formatters';
import { X, Upload, CheckCircle2, AlertTriangle, FileSpreadsheet, Download } from 'lucide-react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({ isOpen, onClose }) => {
  const { importTransactions } = useTransactions();

  const [csvText, setCsvText] = useState('');
  const [validationResult, setValidationResult] = useState<CsvValidationResult | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [importSuccessCount, setImportSuccessCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
      const res = parseTransactionsCsv(content);
      setValidationResult(res);
      setImportSuccessCount(null);
    };
    reader.readAsText(file);
  };

  const handleLoadSample = () => {
    const sample = `date,type,amount,category,description
2026-10-09,income,320000,Bakery Sales,Pesanan roti manis pagi 40 pcs
2026-10-09,expense,150000,Raw Materials,Pembelian margarin & ragi instan
2026-99-99,expense,85000,Utilities,Refill gas LPG (INVALID DATE ERROR ROW)
2026-10-10,income,480000,Catering,Snack box rapat kantor kelurahan
2026-10-10,expense,NOT_A_NUMBER,Packaging,Dus kemasan roti kraft (INVALID AMOUNT ERROR ROW)
2026-10-11,income,210000,Online Orders,Pesanan pastry via aplikasi delivery
2026-10-11,expense,45000,Logistics,Ongkos kirim kurir instan bahan baku`;

    setCsvText(sample);
    const res = parseTransactionsCsv(sample);
    setValidationResult(res);
    setImportSuccessCount(null);
  };

  const handleCommitImport = async () => {
    if (!validationResult || validationResult.validRows.length === 0) return;

    setIsImporting(true);
    try {
      const count = await importTransactions(validationResult.validRows);
      setImportSuccessCount(count);
      setValidationResult(null);
      setCsvText('');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="card-white max-w-md w-full p-5 space-y-4 shadow-2xl border-slate-200 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Impor Pembukuan CSV</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-slate-100 text-slate-400">
            <X className="w-5 h-5" />
          </button>
        </div>

        {importSuccessCount !== null ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-bold text-slate-900">
              {importSuccessCount} Transaksi Berhasil Diimpor!
            </h4>
            <p className="text-xs text-slate-500">
              Data transaksi telah ditambahkan ke buku kas dan langsung memperbarui dashboard.
            </p>
            <Button variant="primary" size="md" fullWidth onClick={onClose}>
              Selesai & Lihat Dashboard
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Upload Box */}
            <div className="border-2 border-dashed border-slate-200 rounded-2xl p-4 text-center space-y-2 bg-slate-50">
              <Upload className="w-6 h-6 text-slate-400 mx-auto" />
              <div>
                <label className="cursor-pointer text-xs font-bold text-[#0066FF] hover:underline">
                  Pilih File CSV
                  <input
                    type="file"
                    accept=".csv,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-slate-400 mt-0.5">atau gunakan sampel uji coba dengan 2 baris eror</p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleLoadSample}>
                Muat Sampel CSV (Ada 2 Baris Eror)
              </Button>
            </div>

            {/* Validation Feedback */}
            {validationResult && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                    <p className="text-base font-black">{validationResult.validRows.length}</p>
                    <p className="text-[10px] font-bold uppercase">Baris Valid (Siap Impor)</p>
                  </div>
                  <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800">
                    <p className="text-base font-black">{validationResult.invalidRows.length}</p>
                    <p className="text-[10px] font-bold uppercase">Baris Eror (Ditolak)</p>
                  </div>
                </div>

                {/* Error Report Table if any */}
                {validationResult.invalidRows.length > 0 && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5 text-xs text-rose-900">
                    <p className="font-bold flex items-center gap-1 text-[11px] text-rose-800">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                      Laporan Baris Tidak Valid ({validationResult.invalidRows.length}):
                    </p>
                    <div className="space-y-1 max-h-28 overflow-y-auto pr-1">
                      {validationResult.invalidRows.map((err, idx) => (
                        <div key={idx} className="p-1.5 rounded bg-white/80 border border-rose-200 text-[10px] space-y-0.5">
                          <span className="font-bold text-rose-700">Baris #{err.rowNumber}:</span> {err.reason}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Preview Valid Rows */}
                {validationResult.validRows.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[10px] font-bold uppercase text-slate-500">
                      Pratinjau Data Valid ({validationResult.validRows.length}):
                    </p>
                    <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                      {validationResult.validRows.slice(0, 5).map((row, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-xl bg-slate-50 border border-slate-100 flex justify-between items-center text-xs"
                        >
                          <div className="truncate max-w-[200px]">
                            <p className="font-semibold text-slate-900 truncate">{row.description}</p>
                            <span className="text-[10px] text-slate-400">{row.date} • {row.category}</span>
                          </div>
                          <span
                            className={`font-black ${
                              row.type === 'income' ? 'text-emerald-600' : 'text-slate-800'
                            }`}
                          >
                            {row.type === 'income' ? '+' : '-'} {formatCurrency(row.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <Button
                  variant="success"
                  size="md"
                  fullWidth
                  isLoading={isImporting}
                  disabled={validationResult.validRows.length === 0}
                  onClick={handleCommitImport}
                >
                  Impor {validationResult.validRows.length} Baris Valid ke Pembukuan
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
