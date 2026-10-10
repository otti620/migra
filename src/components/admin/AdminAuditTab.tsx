import React, { useState } from 'react';
import { FileCheck, Search, ShieldCheck, ArrowDownRight, ArrowUpRight, RefreshCw } from 'lucide-react';
import { BalanceAuditLog } from '../../types';

interface AdminAuditTabProps {
  balanceAuditLogs: BalanceAuditLog[];
  onRefresh?: () => void;
}

export const AdminAuditTab: React.FC<AdminAuditTabProps> = ({ balanceAuditLogs = [], onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = balanceAuditLogs.filter((log) => {
    return (
      !searchTerm ||
      log.phone.includes(searchTerm) ||
      log.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.referenceId && log.referenceId.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="bg-[#07132e]/90 border border-blue-900/40 rounded-2xl p-4 shadow-xl flex items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search phone, event type, ref..."
            className="w-full bg-slate-950/80 border border-slate-700/60 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-400 font-mono">
            {filteredLogs.length} Verified Ledger Events
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-2.5 py-1.5 rounded-xl bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700/40 text-blue-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
              title="Fetch latest audit logs on request"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="bg-[#07132e]/90 border border-blue-900/40 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#040b1e] border-b border-blue-900/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Event ID / Hash</th>
                <th className="py-3.5 px-4">User Phone</th>
                <th className="py-3.5 px-4">Event Type</th>
                <th className="py-3.5 px-4">Delta (₦)</th>
                <th className="py-3.5 px-4">Reference Key</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    No balance audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, lIdx) => {
                  const isPositive = (log.deltaAmount || 0) >= 0;
                  return (
                    <tr key={log.id ? `audit_${log.id}_${lIdx}` : `audit_${lIdx}`} className="hover:bg-slate-900/50 transition font-mono">
                      <td className="py-3.5 px-4 text-[11px] text-slate-400">
                        {log.id.slice(0, 12)}...
                      </td>

                      <td className="py-3.5 px-4 font-bold text-white">
                        {log.phone}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                          {log.eventType}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-bold">
                        <span className={isPositive ? 'text-emerald-400' : 'text-rose-400'}>
                          {isPositive ? '+' : ''}₦{log.deltaAmount.toLocaleString()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 text-[11px] truncate max-w-[150px]">
                        {log.referenceId || 'N/A'}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {log.verifiedAt}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3" /> VERIFIED
                        </span>
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
