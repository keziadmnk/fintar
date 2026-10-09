import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import { TierBadge } from '../components/common/TierBadge';
import { mockAuditActions } from '../mock/vieraBakeryData';
import { AgentAction } from '../types';
import {
  History,
  Download,
  Trash2,
} from 'lucide-react';

export const Activity: React.FC = () => {
  const [actions, setActions] = useState<AgentAction[]>(mockAuditActions);
  const [consentActive, setConsentActive] = useState<boolean>(true);

  const handleExportAudit = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(actions, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "fintar_audit_log.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleRevokeConsent = () => {
    if (confirm('Cabut izin pemrosesan AI? Seluruh analisis otomatis akan segera dihentikan.')) {
      setConsentActive(false);
      alert('Izin AI berhasil dicabut.');
    }
  };

  const handleDeleteData = () => {
    if (confirm('Apakah Anda yakin ingin menghapus permanen seluruh data pembukuan & riwayat aktivitas? (FR-23)')) {
      setActions([]);
      alert('Seluruh data pengguna berhasil dihapus (Right to Erasure).');
    }
  };

  return (
    <div className="space-y-4 pb-12">
      {/* Governance Banner */}
      <div className="card-white p-4 space-y-3 border-blue-100 bg-blue-50/40">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#0066FF]" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Audit Log & Tata Kelola AI
            </h2>
          </div>
          <span className="text-[10px] font-mono text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
            Append-Only
          </span>
        </div>
        <p className="text-xs text-slate-600 leading-relaxed">
          Setiap tindakan otonom, ekstraksi struk, perkiraan arus kas, dan persetujuan pengguna dicatat secara permanen dan tidak dapat diubah (immutable).
        </p>

        <div className="pt-1 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Download className="w-3.5 h-3.5" />}
            onClick={handleExportAudit}
            className="flex-1 bg-white"
          >
            Ekspor JSON
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRevokeConsent}
            className={`flex-1 ${!consentActive ? 'opacity-50 pointer-events-none' : ''}`}
          >
            {consentActive ? 'Cabut Izin AI' : 'Izin Dicabut'}
          </Button>
        </div>
      </div>

      {/* Action Logs */}
      <div className="space-y-2.5">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
          Riwayat Eksekusi AI ({actions.length})
        </h3>

        {actions.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-xs rounded-2xl bg-white border border-slate-200">
            Tidak ada data audit. Seluruh data telah dihapus.
          </div>
        ) : (
          actions.map((act) => (
            <div key={act.id} className="card-white p-3.5 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">{act.tool}()</span>
                  <TierBadge tier={act.tier} size="sm" />
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 font-mono text-[10px] space-y-1">
                <div className="text-slate-600 truncate">
                  <span className="text-[#0066FF] font-bold">Input:</span> {JSON.stringify(act.input)}
                </div>
                <div className="text-slate-600 truncate">
                  <span className="text-emerald-600 font-bold">Output:</span> {JSON.stringify(act.output)}
                </div>
              </div>

              <div className="flex items-center justify-between text-[10px] pt-0.5">
                <span className="text-slate-500">Status: <strong className="text-slate-900 capitalize">{act.status}</strong></span>
                {act.approvalId && (
                  <span className="text-amber-700 font-mono font-semibold">Approval ID: {act.approvalId}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <div className="pt-4 border-t border-slate-200">
        <Button
          variant="danger"
          size="md"
          fullWidth
          leftIcon={<Trash2 className="w-4 h-4" />}
          onClick={handleDeleteData}
        >
          Hapus Seluruh Data Saya (Hak PDP / GDPR)
        </Button>
      </div>
    </div>
  );
};
