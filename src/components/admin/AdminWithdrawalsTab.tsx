import React, { useState } from 'react';
import { 
  Search, ArrowUpFromLine, CheckCircle2, XCircle, 
  Copy, Check, Building2, AlertCircle, RefreshCw 
} from 'lucide-react';
import { PendingWithdrawalReq } from '../../types';

interface AdminWithdrawalsTabProps {
  pendingWithdrawals: PendingWithdrawalReq[];
  onApproveWithdrawal: (wd: PendingWithdrawalReq) => void;
  onOpenRejectModal: (wd: PendingWithdrawalReq) => void;
  usdNairaRate?: number;
  onRefresh?: () => void;
}

export const AdminWithdrawalsTab: React.FC<AdminWithdrawalsTabProps> = ({
  pendingWithdrawals,
  onApproveWithdrawal,
  onOpenRejectModal,
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

  const filteredWithdrawals = pendingWithdrawals.filter((wd) => {
    const matchesStatus = statusFilter === 'all' || wd.status === statusFilter;
    const matchesSearch = 
      !searchTerm ||
      wd.userPhone.includes(searchTerm) ||
      (wd.reference && wd.reference.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (wd.accountNumber && wd.accountNumber.includes(searchTerm)) ||
      (wd.accountName && wd.accountName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (wd.bankName && wd.bankName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Top Search & Filter Bar */}
      <div className="bg-[#07132e]/90 border border-rose-500/30 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search phone, account, bank..."
            className="w-full bg-slate-950/80 border border-slate-700/60 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(['pending', 'all', 'success', 'failed'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                statusFilter === st
                  ? 'bg-rose-600 text-white shadow-md shadow-rose-900/40'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-2.5 py-1.5 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 border border-rose-600/40 text-rose-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 ml-1"
              title="Fetch latest payouts on request"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-[#07132e]/90 border border-blue-900/40 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-blue-900/50 bg-[#040b1e] text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">User Phone</th>
                <th className="py-3.5 px-4">Gross Request</th>
                <th className="py-3.5 px-4">Fee (11%)</th>
                <th className="py-3.5 px-4">Net Payout (₦)</th>
                <th className="py-3.5 px-4">Payout Destination</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredWithdrawals.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-medium">
                    No withdrawal records found for the selected filter.
                  </td>
                </tr>
              ) : (
                filteredWithdrawals.map((wd, wIdx) => {
                  const fee = wd.amount * 0.11;
                  const netPayout = Math.floor(wd.amount * 0.89);

                  return (
                    <tr key={wd.id ? `wd_${wd.id}_${wIdx}` : `wd_${wIdx}`} className="hover:bg-slate-900/50 transition">
                      {/* User Phone */}
                      <td className="py-3.5 px-4 font-mono font-bold text-white">
                        {wd.userPhone}
                      </td>

                      {/* Gross Request */}
                      <td className="py-3.5 px-4 font-mono font-bold text-slate-300">
                        ₦{wd.amount.toLocaleString()}
                      </td>

                      {/* Fee */}
                      <td className="py-3.5 px-4 font-mono text-slate-400">
                        -₦{Math.round(fee).toLocaleString()}
                      </td>

                      {/* Net Payout */}
                      <td className="py-3.5 px-4 font-mono">
                        <div className="font-black text-rose-400 text-sm">
                          ₦{netPayout.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          ≈ ${(netPayout / usdNairaRate).toFixed(2)} USDT
                        </div>
                      </td>

                      {/* Destination Bank / Account */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 font-bold text-white">
                          <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                          <span>{wd.bankName || 'USDT TRC20'}</span>
                          <span className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                            wd.payoutMethod === 'usdt' || wd.bankName?.includes('USDT')
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          }`}>
                            {wd.payoutMethod === 'usdt' || wd.bankName?.includes('USDT') ? 'USDT' : 'Bank'}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-300 font-mono mt-0.5 flex items-center gap-1">
                          <span>{wd.accountNumber}</span>
                          <button
                            onClick={() => handleCopy(wd.accountNumber || '', wd.id)}
                            className="text-slate-500 hover:text-white"
                          >
                            {copiedId === wd.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                        <div className="text-[10px] text-slate-400">{wd.accountName || 'Beneficiary'}</div>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 text-slate-400 text-[11px] font-mono whitespace-nowrap">
                        {wd.time}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                            wd.status === 'success'
                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                              : wd.status === 'failed'
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                          }`}
                        >
                          {wd.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {wd.status === 'pending' ? (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => onApproveWithdrawal(wd)}
                              className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1 shadow-md shadow-rose-900/30 transition active:scale-95"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Dispatch</span>
                            </button>
                            <button
                              onClick={() => onOpenRejectModal(wd)}
                              className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-white font-bold text-xs transition"
                              title="Reject & Refund"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 font-mono">Completed</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
