import React, { useState } from 'react';
import { Button } from '../components/common/Button';
import { TierBadge } from '../components/common/TierBadge';
import { SimulatedDataBadge } from '../components/common/SimulatedDataBadge';
import { ConsentGate } from '../components/common/ConsentGate';
import { Currency, PermissionTier } from '../types';
import {
  Send,
  ShieldCheck,
  Check,
  X,
  Wrench,
} from 'lucide-react';

interface AssistantProps {
  currency?: Currency;
}

interface Message {
  id: string;
  sender: 'user' | 'agent';
  text: string;
  timestamp: string;
  toolsUsed?: {
    tool: string;
    tier: PermissionTier;
    input: Record<string, any>;
    output: Record<string, any>;
  }[];
  sources?: string[];
  approvalRequest?: {
    id: string;
    actionTitle: string;
    description: string;
    payload: Record<string, any>;
    status: 'pending' | 'approved' | 'rejected';
  };
}

export const Assistant: React.FC<AssistantProps> = () => {
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'm1',
      sender: 'user',
      text: 'Bagaimana perkiraan arus kas toko saya untuk 30 hari ke depan?',
      timestamp: '10:15 AM',
    },
    {
      id: 'm2',
      sender: 'agent',
      text: 'Berdasarkan proyeksi 30 hari, kas Viera Bakery diperkirakan mengalami defisit dalam 9 hari karena rencana restok Ramadan (Rp1.400.000) dan utang bahan baku (Rp750.000) dalam 5 hari ke depan. Saldo kas saat ini adalah Rp1.100.000.',
      timestamp: '10:15 AM',
      toolsUsed: [
        {
          tool: 'forecast_cash',
          tier: 'T0',
          input: { currentBalance: 1100000, days: 30 },
          output: { daysUntilDeficit: 9, shortageAmount: 630000 },
        },
      ],
      sources: ['24 Transaksi Viera Bakery', 'Utang PT Pangan (Rp750rb)', 'Jadwal Restok Ramadan'],
    },
    {
      id: 'm3',
      sender: 'agent',
      text: 'Apakah Anda ingin saya siapkan draf pengajuan KUR Mikro 6% sebesar Rp5.000.000 (cicilan Rp233.333/bln)?',
      timestamp: '10:16 AM',
      approvalRequest: {
        id: 'appr_01',
        actionTitle: 'Draf Proposal Modal Usaha (Tier 2)',
        description: 'Buat berkas pengajuan pinjaman Rp5.000.000 tenor 24 bulan menggunakan laporan laba rugi Viera Bakery.',
        payload: { amount: 5000000, tenor: 24, rate: 0.06 },
        status: 'pending',
      },
    },
  ]);

  const suggestionChips = [
    'Kenapa biaya ongkir naik?',
    'Berapa batas cicilan aman?',
    'Simulasi KUR 10 Juta 6%',
    'Cek utang jatuh tempo',
  ];

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: Message = {
      id: `u_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: 'Baru saja',
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');

    setTimeout(() => {
      let agentResponse: Message;

      if (query.includes('ongkir') || query.includes('biaya')) {
        agentResponse = {
          id: `a_${Date.now()}`,
          sender: 'agent',
          text: 'Biaya logistik naik 18% bulan ini mencapai Rp470.000 (26% dari total pengeluaran). Penyebab utamanya adalah 3 kali pesanan kilat bahan baku pada tanggal 3, 5, dan 6 Oktober.',
          timestamp: 'Baru saja',
          toolsUsed: [
            {
              tool: 'detect_anomaly',
              tier: 'T0',
              input: { category: 'Logistics' },
              output: { increasePct: 18, shareOfExpense: 0.26 },
            },
          ],
          sources: ['tx_15 (Rp160rb)', 'tx_18 (Rp180rb)', 'tx_19 (Rp130rb)'],
        };
      } else if (query.includes('cicilan') || query.includes('aman') || query.includes('batas')) {
        agentResponse = {
          id: `a_${Date.now()}`,
          sender: 'agent',
          text: 'Rata-rata laba bulanan Anda adalah Rp1.100.000. Batas cicilan bulanan yang sehat dan aman adalah 30% dari laba, yaitu maksimal Rp330.000/bulan.',
          timestamp: 'Baru saja',
          toolsUsed: [
            {
              tool: 'get_summary',
              tier: 'T0',
              input: { businessId: 'biz_viera_001' },
              output: { avgMonthlyProfit: 1100000, healthyCap: 330000 },
            },
          ],
          sources: ['Laporan Laba Rugi Viera Bakery'],
        };
      } else {
        agentResponse = {
          id: `a_${Date.now()}`,
          sender: 'agent',
          text: `Berdasarkan catatan pembukuan, Viera Bakery mencatatkan pendapatan Rp2.907.000 dengan margin laba 37.8%. Seluruh angka dihitung langsung dari data transaksi Anda.`,
          timestamp: 'Baru saja',
          toolsUsed: [
            {
              tool: 'get_summary',
              tier: 'T0',
              input: { businessId: 'biz_viera_001' },
              output: { income: 2907000, profit: 1100000 },
            },
          ],
          sources: ['Ledger Summary Oct 2026'],
        };
      }

      setMessages((prev) => [...prev, agentResponse]);
    }, 600);
  };

  const handleApproval = (msgId: string, decision: 'approved' | 'rejected') => {
    setMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId && m.approvalRequest) {
          return {
            ...m,
            approvalRequest: {
              ...m.approvalRequest,
              status: decision,
            },
          };
        }
        return m;
      })
    );
  };

  return (
    <ConsentGate featureName="Asisten AI Copilot (Finix AI)">
      <div className="flex flex-col h-[calc(100vh-145px)] pb-1">
        <div className="mb-2">
          <SimulatedDataBadge variant="banner" />
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-3.5 pr-1">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
            >
              <div className="flex items-center gap-1.5 mb-1 px-1">
                {msg.sender === 'agent' ? (
                  <>
                    <div className="w-4 h-4 rounded-full bg-[#0066FF] text-white flex items-center justify-center text-[9px] font-bold">
                      🤖
                    </div>
                    <span className="text-[11px] font-bold text-slate-800">Finix AI</span>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] font-bold text-slate-500">Anda</span>
                  </>
                )}
                <span className="text-[9px] text-slate-400">• {msg.timestamp}</span>
              </div>

              <div
                className={`rounded-2xl p-3.5 text-xs max-w-[90%] leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-[#0066FF] text-white rounded-tr-sm shadow-sm'
                    : 'card-white text-slate-800 rounded-tl-sm'
                }`}
              >
                <p>{msg.text}</p>

                {/* Tools Inspector */}
                {msg.toolsUsed && msg.toolsUsed.length > 0 && (
                  <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-1.5">
                    <div className="flex items-center gap-1 text-[10px] font-mono text-[#0066FF] font-semibold">
                      <Wrench className="w-3 h-3" />
                      <span>Tools Digunakan:</span>
                    </div>
                    {msg.toolsUsed.map((t, idx) => (
                      <div
                        key={idx}
                        className="p-1.5 rounded-lg bg-slate-50 border border-slate-200 text-[10px] font-mono flex items-center justify-between text-slate-700"
                      >
                        <span>{t.tool}()</span>
                        <TierBadge tier={t.tier} size="sm" />
                      </div>
                    ))}
                  </div>
                )}

                {/* Approval Card */}
                {msg.approvalRequest && (
                  <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-2.5 text-slate-900">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-bold text-amber-900 flex items-center gap-1">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-600" /> {msg.approvalRequest.actionTitle}
                      </span>
                      <TierBadge tier="T2" size="sm" />
                    </div>
                    <p className="text-[11px] text-slate-700">{msg.approvalRequest.description}</p>

                    {msg.approvalRequest.status === 'pending' ? (
                      <div className="flex gap-2 pt-1">
                        <Button
                          variant="success"
                          size="sm"
                          className="flex-1"
                          leftIcon={<Check className="w-3.5 h-3.5" />}
                          onClick={() => handleApproval(msg.id, 'approved')}
                        >
                          Setujui Aksi
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="flex-1"
                          leftIcon={<X className="w-3.5 h-3.5" />}
                          onClick={() => handleApproval(msg.id, 'rejected')}
                        >
                          Tolak
                        </Button>
                      </div>
                    ) : (
                      <div
                        className={`p-2 rounded-xl text-center font-bold text-[11px] ${
                          msg.approvalRequest.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {msg.approvalRequest.status === 'approved'
                          ? '✓ Aksi Disetujui & Masuk Audit Log'
                          : '✗ Aksi Ditolak oleh Pengguna'}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Suggestion Chips */}
        <div className="py-2 overflow-x-auto no-scrollbar flex gap-1.5">
          {suggestionChips.map((chip, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(chip)}
              className="shrink-0 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 shadow-sm transition-colors"
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="pt-1 flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Tanya Finix (contoh: Bisakah ambil pinjaman 5 Juta?)"
            className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#0066FF] shadow-sm"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim()}
            className="w-10 h-10 rounded-2xl bg-[#0066FF] text-white flex items-center justify-center disabled:opacity-50 shadow-md shadow-blue-500/20 active:scale-95 transition-all"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </ConsentGate>
  );
};
