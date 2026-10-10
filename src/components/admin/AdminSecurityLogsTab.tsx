import React, { useState } from 'react';
import { ShieldCheck, Search, RefreshCw, CheckCircle2, XCircle, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { AdminActivityLog } from '../../types';

interface AdminSecurityLogsTabProps {
  securityLogs: AdminActivityLog[];
  onRefresh?: () => void;
}

export const AdminSecurityLogsTab: React.FC<AdminSecurityLogsTabProps> = ({ securityLogs = [], onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<'all' | 'approve' | 'reject'>('all');
  const [typeFilter, setTypeFilter] = useState<'all' | 'deposit' | 'withdrawal'>('all');

  const filteredLogs = securityLogs.filter((log) => {
    const matchesSearch =
      !searchTerm ||
      log.adminPhone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.recordId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.userPhone && log.userPhone.includes(searchTerm));

    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesType = typeFilter === 'all' || log.targetType === typeFilter;

    return matchesSearch && matchesAction && matchesType;
  });

  return (
    <div className="space-y-4">
      {/* Filters & Search */}
      <div className="bg-[#07132e]/90 border border-blue-900/40 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search admin phone, record ID, user..."
            className="w-full bg-slate-950/80 border border-slate-700/60 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <div className="flex items-center gap-2">
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value as any)}
              className="bg-slate-950/80 border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Actions</option>
              <option value="approve">Approved</option>
              <option value="reject">Rejected</option>
            </select>

            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="bg-slate-950/80 border border-slate-700/60 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="deposit">Deposits</option>
              <option value="withdrawal">Withdrawals</option>
            </select>
          </div>

          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-3 py-1.5 rounded-xl bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700/40 text-blue-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 shrink-0"
              title="Refresh security logs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#07132e]/90 border border-blue-900/40 rounded-2xl shadow-xl overflow-hidden">
        <div className="p-4 border-b border-blue-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" />
            <h3 className="font-black text-sm text-white tracking-wider">ADMIN SECURITY & ACTIVITY AUDIT</h3>
          </div>
          <div className="text-xs text-slate-400 font-mono">
            {filteredLogs.length} Security Events Recorded
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#040b1e] border-b border-blue-900/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Log / Event ID</th>
                <th className="py-3.5 px-4">Admin Phone</th>
                <th className="py-3.5 px-4">Action</th>
                <th className="py-3.5 px-4">Target Type</th>
                <th className="py-3.5 px-4">Record ID</th>
                <th className="py-3.5 px-4">User Phone / Amount</th>
                <th className="py-3.5 px-4">Timestamp</th>
                <th className="py-3.5 px-4 text-right">Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-sans">
                    No admin security logs match the current criteria.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, idx) => {
                  const isApprove = log.action === 'approve';
                  return (
                    <tr key={log.id || idx} className="hover:bg-slate-900/50 transition">
                      <td className="py-3.5 px-4 text-[11px] text-slate-400">
                        {log.id.slice(0, 14)}...
                      </td>

                      <td className="py-3.5 px-4 font-bold text-white">
                        {log.adminPhone || 'Admin'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                          isApprove
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        }`}>
                          {isApprove ? <CheckCircle2 className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {log.action.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                          {log.targetType === 'deposit' ? <ArrowDownRight className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {log.targetType.toUpperCase()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-slate-300 text-[11px]">
                        {log.recordId}
                      </td>

                      <td className="py-3.5 px-4 text-slate-300">
                        <div>{log.userPhone || 'N/A'}</div>
                        {log.amount !== undefined && log.amount > 0 && (
                          <div className="text-[10px] text-amber-400 font-bold">₦{log.amount.toLocaleString()}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                        {log.timestamp}
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          <ShieldCheck className="w-3 h-3" /> SECURE
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
