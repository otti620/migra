import React, { useState } from 'react';
import { Gift, Plus, Trash2, Copy, Check, CheckCircle2, RefreshCw } from 'lucide-react';
import { RedemptionCode } from '../../types';

interface AdminCodesTabProps {
  redemptionCodes: RedemptionCode[];
  onAddCode?: (code: RedemptionCode) => void;
  onDeleteCode?: (codeId: string) => void;
  usdNairaRate?: number;
  onRefresh?: () => void;
}

export const AdminCodesTab: React.FC<AdminCodesTabProps> = ({
  redemptionCodes = [],
  onAddCode,
  onDeleteCode,
  usdNairaRate = 1500,
  onRefresh
}) => {
  const [codeName, setCodeName] = useState('');
  const [rewardAmount, setRewardAmount] = useState('5000');
  const [maxUses, setMaxUses] = useState('100');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCreateCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!onAddCode) return;
    const cleanCode = (codeName || `DANGOTE-${Math.random().toString(36).substring(2, 7).toUpperCase()}`).trim().toUpperCase();
    const newCode: RedemptionCode = {
      id: `code-${Date.now()}`,
      code: cleanCode,
      rewardAmount: parseFloat(rewardAmount) || 5000,
      maxUses: parseInt(maxUses) || 100,
      usedCount: 0,
      usedByPhones: [],
      createdAt: new Date().toLocaleString(),
      isActive: true
    };
    onAddCode(newCode);
    setCodeName('');
  };

  return (
    <div className="space-y-6">
      {/* Code Generation Card */}
      <div className="bg-[#07132e]/90 border border-purple-500/30 rounded-2xl p-5 shadow-xl space-y-4">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <Gift className="w-4 h-4 text-purple-400" />
          <span>Generate Promo / Rescue Reward Code</span>
        </h3>

        <form onSubmit={handleCreateCode} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Code Name (Optional)</label>
            <input
              type="text"
              value={codeName}
              onChange={(e) => setCodeName(e.target.value)}
              placeholder="e.g. VIPBONUS5K"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white uppercase font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Reward Value (₦)</label>
            <input
              type="number"
              value={rewardAmount}
              onChange={(e) => setRewardAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
            />
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Max Usages</label>
            <input
              type="number"
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
            />
          </div>

          <div className="flex items-end">
            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-black text-xs rounded-xl shadow-lg shadow-purple-900/30 transition active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Issue Code</span>
            </button>
          </div>
        </form>
      </div>

      {/* Active Codes List */}
      <div className="bg-[#07132e]/90 border border-blue-900/40 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-blue-900/50 flex items-center justify-between">
          <span className="text-xs font-black uppercase text-slate-300">Active Codes ({redemptionCodes.length})</span>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-2.5 py-1 rounded-lg bg-purple-900/40 hover:bg-purple-800/60 border border-purple-600/40 text-purple-300 hover:text-white text-[11px] font-bold flex items-center gap-1.5 transition active:scale-95"
              title="Fetch latest codes on request"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Refresh</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#040b1e] border-b border-blue-900/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Bonus (₦)</th>
                <th className="py-3 px-4">Usage Stats</th>
                <th className="py-3 px-4">Created Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {redemptionCodes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No promo codes active. Generate one above.
                  </td>
                </tr>
              ) : (
                redemptionCodes.map((c, cIdx) => (
                  <tr key={c.id ? `rc_${c.id}_${cIdx}` : `rc_${cIdx}`} className="hover:bg-slate-900/50 transition">
                    <td className="py-3 px-4 font-mono font-black text-amber-300">
                      <div className="flex items-center gap-2">
                        <span>{c.code}</span>
                        <button
                          onClick={() => handleCopy(c.code, c.id)}
                          className="text-slate-500 hover:text-white"
                        >
                          {copiedId === c.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      ₦{c.rewardAmount.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 font-mono text-slate-300">
                      {c.usedCount} of {c.maxUses} used
                    </td>

                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {c.createdAt}
                    </td>

                    <td className="py-3 px-4 text-right">
                      {onDeleteCode && (
                        <button
                          onClick={() => onDeleteCode(c.id)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
