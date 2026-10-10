import React, { useState } from 'react';
import { Settings, QrCode, Save, CheckCircle2, Megaphone, Trash2, Plus, Building2, Coins } from 'lucide-react';
import { PaymentConfig, AnnouncementItem } from '../../types';

interface AdminSettingsTabProps {
  paymentConfig?: PaymentConfig;
  onUpdatePaymentConfig?: (cfg: Partial<PaymentConfig>) => void;
  announcements: AnnouncementItem[];
  onAddAnnouncement: (text: string) => void;
  onDeleteAnnouncement: (id: string) => void;
}

export const AdminSettingsTab: React.FC<AdminSettingsTabProps> = ({
  paymentConfig,
  onUpdatePaymentConfig,
  announcements,
  onAddAnnouncement,
  onDeleteAnnouncement
}) => {
  // USDT Gateway state
  const [usdtAddress, setUsdtAddress] = useState(paymentConfig?.usdtAddress || 'TMfHpAqnR5VGDhy2u96QtFwA6GvCD9L23f');
  const usdtNetwork = 'TRC20';
  const [usdtRate, setUsdtRate] = useState((paymentConfig?.usdtNairaRate || 1500).toString());
  const [minDepositUsdt, setMinDepositUsdt] = useState((paymentConfig?.minDepositUsdt || 5).toString());
  const [paymentNotice, setPaymentNotice] = useState(paymentConfig?.paymentNotice || 'Send USDT ONLY via TRON (TRC20) network. No other chain is allowed.');

  // Naira Bank Gateway state
  const [nairaBankName, setNairaBankName] = useState(paymentConfig?.nairaBankName || 'CARBON');
  const [nairaAccountNumber, setNairaAccountNumber] = useState(paymentConfig?.nairaAccountNumber || '1581957640');
  const [nairaAccountName, setNairaAccountName] = useState(paymentConfig?.nairaAccountName || 'LEVIATHAN HYPERMARKET');
  const [minDepositNaira, setMinDepositNaira] = useState((paymentConfig?.minDepositNaira || 5000).toString());
  const [nairaPaymentNotice, setNairaPaymentNotice] = useState(paymentConfig?.nairaPaymentNotice || '');

  const [saveMsg, setSaveMsg] = useState('');

  // Announcement state
  const [newAnnounceText, setNewAnnounceText] = useState('');

  const handleSavePaymentConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onUpdatePaymentConfig) return;
    onUpdatePaymentConfig({
      usdtAddress: usdtAddress.trim(),
      usdtNetwork,
      usdtNairaRate: parseFloat(usdtRate) || 1500,
      minDepositUsdt: parseFloat(minDepositUsdt) || 5,
      paymentNotice: paymentNotice.trim(),
      nairaBankName: nairaBankName.trim(),
      nairaAccountNumber: nairaAccountNumber.trim(),
      nairaAccountName: nairaAccountName.trim(),
      minDepositNaira: parseFloat(minDepositNaira) || 5000,
      nairaPaymentNotice: nairaPaymentNotice.trim()
    });
    setSaveMsg('Payment gateways & parameters saved successfully to Firebase!');
    setTimeout(() => setSaveMsg(''), 4000);
  };

  const handleAddAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnounceText.trim()) return;
    onAddAnnouncement(newAnnounceText.trim());
    setNewAnnounceText('');
  };

  return (
    <div className="space-y-6">
      {/* Dual Payment Gateway Settings Form */}
      <form onSubmit={handleSavePaymentConfig} className="space-y-6">
        {/* Top Header Card */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Settings className="w-4 h-4 text-blue-400" />
              <span>Multi-Currency Payment Channels (Naira & Dollars-USDT)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Configure live deposit parameters, rates, and bank/crypto accounts</p>
          </div>
          {saveMsg && (
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-500/40">
              <CheckCircle2 className="w-3.5 h-3.5" /> {saveMsg}
            </span>
          )}
        </div>

        {/* 1. Official Naira Bank Account Settings */}
        <div className="bg-[#07132e]/90 border border-emerald-500/30 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-emerald-300 font-black text-xs uppercase tracking-wider">
            <Building2 className="w-4 h-4 text-emerald-400" />
            <span>🇳🇬 Naira (NGN) Bank Gateway Configuration</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Official Bank Name
              </label>
              <input
                type="text"
                value={nairaBankName}
                onChange={(e) => setNairaBankName(e.target.value)}
                placeholder="e.g. CARBON"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-bold text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Official Account Number
              </label>
              <input
                type="text"
                value={nairaAccountNumber}
                onChange={(e) => setNairaAccountNumber(e.target.value)}
                placeholder="e.g. 1581957640"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono font-bold text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Beneficiary / Account Name
              </label>
              <input
                type="text"
                value={nairaAccountName}
                onChange={(e) => setNairaAccountName(e.target.value)}
                placeholder="e.g. LEVIATHAN HYPERMARKET"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-bold text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Minimum Naira Deposit Threshold (₦)
              </label>
              <input
                type="number"
                value={minDepositNaira}
                onChange={(e) => setMinDepositNaira(e.target.value)}
                placeholder="5000"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* 2. USDT Crypto Gateway Settings */}
        <div className="bg-[#07132e]/90 border border-blue-500/30 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex items-center gap-2 text-blue-300 font-black text-xs uppercase tracking-wider">
            <Coins className="w-4 h-4 text-blue-400" />
            <span>🇺🇸 US Dollars (₮ USDT) Crypto Gateway Configuration</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="col-span-1 sm:col-span-2">
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Master Settlement USDT Wallet Address (TRON TRC20 ONLY)
              </label>
              <input
                type="text"
                value={usdtAddress}
                onChange={(e) => setUsdtAddress(e.target.value)}
                placeholder="e.g. TMfHpAqnR5VGDhy2u96QtFwA6GvCD9L23f"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono text-xs focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">Blockchain Network Standard</label>
              <div className="bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono flex items-center justify-between">
                <span className="font-bold text-emerald-400">TRON (TRC20)</span>
                <span className="text-[10px] bg-amber-950 text-amber-300 px-2 py-0.5 rounded border border-amber-700 font-sans font-bold">
                  Exclusive Network
                </span>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                USDT to Naira Live Exchange Rate (₦ / 1 USDT)
              </label>
              <input
                type="number"
                value={usdtRate}
                onChange={(e) => setUsdtRate(e.target.value)}
                placeholder="1500"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Minimum USDT Deposit Threshold ($)
              </label>
              <input
                type="number"
                value={minDepositUsdt}
                onChange={(e) => setMinDepositUsdt(e.target.value)}
                placeholder="5"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-300 block mb-1">
                Crypto Safety & Network Notice
              </label>
              <input
                type="text"
                value={paymentNotice}
                onChange={(e) => setPaymentNotice(e.target.value)}
                placeholder="Send USDT ONLY via selected network..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white"
              />
            </div>
          </div>
        </div>

        {/* Submit Save Button */}
        <div>
          <button
            type="submit"
            className="w-full py-3.5 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-900/30 transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save All Multi-Currency Gateway Settings</span>
          </button>
        </div>
      </form>

      {/* Announcements Studio */}
      <div className="bg-[#07132e]/90 border border-amber-500/30 rounded-2xl p-6 shadow-xl space-y-4">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <Megaphone className="w-4 h-4 text-amber-400" />
          <span>Live Broadcasts & Marquee Announcements</span>
        </h3>

        <form onSubmit={handleAddAnnouncementSubmit} className="flex gap-2">
          <input
            type="text"
            value={newAnnounceText}
            onChange={(e) => setNewAnnounceText(e.target.value)}
            placeholder="Type marquee news (e.g. Dangote Dividend Payouts Dispatched!)..."
            className="flex-1 bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
          />
          <button
            type="submit"
            className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition active:scale-95 flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Broadcast</span>
          </button>
        </form>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {announcements.length === 0 ? (
            <div className="text-xs text-slate-500 py-4 text-center">No active announcements.</div>
          ) : (
            announcements.map((ann, aIdx) => (
              <div
                key={ann.id ? `ann_${ann.id}_${aIdx}` : `ann_${aIdx}`}
                className="p-3 bg-slate-950/70 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-center gap-2">
                  <Megaphone className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span className="text-slate-200">{ann.text}</span>
                </div>
                <button
                  onClick={() => onDeleteAnnouncement(ann.id)}
                  className="p-1 rounded bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
