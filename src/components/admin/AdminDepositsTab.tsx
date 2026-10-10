import React, { useState } from 'react';
import { 
  Search, ArrowDownToLine, CheckCircle2, XCircle, 
  ExternalLink, Copy, Check, Clock, Filter, AlertCircle, RefreshCw 
} from 'lucide-react';
import { PendingDeposit } from '../../types';

interface AdminDepositsTabProps {
  pendingDeposits: PendingDeposit[];
  onApproveDeposit: (dep: PendingDeposit) => void;
  onRejectDeposit: (depId: string) => void;
  usdNairaRate?: number;
  onRefresh?: () => void;
}

export const AdminDepositsTab: React.FC<AdminDepositsTabProps> = ({
  pendingDeposits,
  onApproveDeposit,
  onRejectDeposit,
  usdNairaRate = 1500,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'success' | 'failed'>('pending');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredDeposits = pendingDeposits.filter((dep) => {
    const matchesStatus = statusFilter === 'all' || dep.status === statusFilter;
    const matchesSearch = 
      !searchTerm ||
      dep.userPhone.includes(searchTerm) ||
      (dep.reference && dep.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (dep.senderAccountName && dep.senderAccountName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (dep.usdtTxHash && dep.usdtTxHash.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="bg-[#07132e]/90 border border-emerald-500/30 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search phone, reference, sender name..."
            className="w-full bg-slate-950/80 border border-slate-700/60 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(['pending', 'all', 'success', 'failed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                statusFilter === st
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-900/40'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-900/40 hover:bg-emerald-800/60 border border-emerald-600/40 text-emerald-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 ml-1"
              title="Fetch latest deposits on request"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Deposits Table */}
      <div className="bg-[#07132e]/90 border border-blue-900/40 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-blue-900/50 bg-[#040b1e] text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">User Phone</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Channel & Reference</th>
                <th className="py-3.5 px-4">Sender Details / Proof</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredDeposits.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                    No deposit records found for the selected filter.
                  </td>
                </tr>
              ) : (
                filteredDeposits.map((dep, dIdx) => (
                  <tr key={dep.id ? `dep_${dep.id}_${dIdx}` : `dep_${dIdx}`} className="hover:bg-slate-900/50 transition">
                    {/* User Phone */}
                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {dep.userPhone}
                    </td>

                    {/* Amount */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-black text-emerald-400 text-sm">
                        ₦{dep.amount.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        ≈ ${(dep.amount / usdNairaRate).toFixed(2)} USDT
                      </div>
                    </td>

                    {/* Channel & Reference */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2 py-0.5 rounded font-black text-[10px] uppercase flex items-center gap-1 ${
                          dep.currency === 'USDT' || dep.paymentMethod?.includes('USDT')
                            ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}>
                          <span>{dep.currency === 'USDT' || dep.paymentMethod?.includes('USDT') ? '🇺🇸' : '🇳🇬'}</span>
                          {dep.paymentMethod || (dep.currency === 'USDT' ? 'USDT Crypto' : 'Naira Bank Transfer')}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-1">
                        <span>Ref: {dep.reference || dep.id}</span>
                        <button
                          onClick={() => handleCopy(dep.reference || dep.id, dep.id)}
                          className="text-slate-500 hover:text-white"
                        >
                          {copiedId === dep.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        </button>
                      </div>
                    </td>

                    {/* Sender Details */}
                    <td className="py-3.5 px-4">
                      <div className="text-white font-medium">
                        {dep.senderAccountName || dep.assignedAccount || 'Direct Payment'}
                      </div>
                      {dep.senderBankName && (
                        <div className="text-[10px] text-slate-400">{dep.senderBankName}</div>
                      )}
                      {dep.usdtTxHash && (
                        <div className="text-[10px] text-cyan-400 font-mono truncate max-w-[150px]">
                          Tx: {dep.usdtTxHash}
                        </div>
                      )}
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-4 text-slate-400 text-[11px] font-mono whitespace-nowrap">
                      {dep.time}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          dep.status === 'success'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : dep.status === 'failed'
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                        }`}
                      >
                        {dep.status}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      {dep.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onApproveDeposit(dep)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1 shadow-md shadow-emerald-900/30 transition active:scale-95"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Approve</span>
                          </button>
                          <button
                            onClick={() => onRejectDeposit(dep.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 border border-slate-700 text-slate-400 hover:text-rose-300 font-bold text-xs transition"
                            title="Reject Deposit"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-500 font-mono">Processed</span>
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
