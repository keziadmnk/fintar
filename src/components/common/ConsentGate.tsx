import React from 'react';
import { useConsent } from '../../context/ConsentContext';
import { Button } from './Button';
import { Lock, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';

interface ConsentGateProps {
  children: React.ReactNode;
  featureName?: string;
}

export const ConsentGate: React.FC<ConsentGateProps> = ({
  children,
  featureName = 'Fitur AI Copilot',
}) => {
  const { hasConsent, grantConsent } = useConsent();
  const isAiAllowed = hasConsent('ai_processing');

  if (isAiAllowed) {
    return <>{children}</>;
  }

  return (
    <div className="card-white p-6 my-4 text-center space-y-4 border-amber-200 bg-amber-50/40 shadow-sm animate-in fade-in duration-200">
      <div className="w-14 h-14 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto border border-amber-200">
        <ShieldAlert className="w-7 h-7" />
      </div>

      <div className="space-y-1.5">
        <h3 className="text-base font-bold text-slate-900">
          Izin AI Diperlukan untuk {featureName}
        </h3>
        <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
          Sesuai standar privasi & PDP Law No. 27/2022, FinTar hanya memproses data transaksi dan analisis otomatis setelah mendapatkan persetujuan eksplisit Anda.
        </p>
      </div>

      <div className="p-3 rounded-2xl bg-white border border-amber-200/80 text-left text-xs text-slate-700 space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <Lock className="w-3.5 h-3.5 text-[#0066FF]" />
          <span>Keamanan Data Anda:</span>
        </div>
        <ul className="text-[11px] text-slate-600 space-y-1 pl-5 list-disc">
          <li>Data pribadi disamarkan (*masked*) sebelum dianalisis AI.</li>
          <li>Teks struk murni dibaca sebagai angka, bukan instruksi.</li>
          <li>Izin dapat dicabut kapan saja melalui halaman Profil.</li>
        </ul>
      </div>

      <Button
        variant="primary"
        size="md"
        fullWidth
        leftIcon={<Sparkles className="w-4 h-4" />}
        onClick={() => grantConsent('ai_processing')}
      >
        Aktifkan Izin AI Sekarang (Grant Consent)
      </Button>
    </div>
  );
};
