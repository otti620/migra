import React, { useState } from 'react';
import { Search, ShoppingBag, CheckCircle2, Clock, Trash2, Edit3, DollarSign, Calendar, RefreshCw } from 'lucide-react';
import { Order } from '../../types';

interface AdminOrdersTabProps {
  allOrders: Order[];
  onUpdateOrder?: (orderId: string, updates: Partial<Order>) => void;
  onDeleteOrder?: (orderId: string) => void;
  usdNairaRate?: number;
  onRefresh?: () => void;
}

export const AdminOrdersTab: React.FC<AdminOrdersTabProps> = ({
  allOrders,
  onUpdateOrder,
  onDeleteOrder,
  usdNairaRate = 1500,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'expired'>('all');

  const filteredOrders = allOrders.filter((ord) => {
    const matchesStatus = statusFilter === 'all' || ord.status === statusFilter;
    const matchesSearch = 
      !searchTerm ||
      (ord.userPhone && ord.userPhone.includes(searchTerm)) ||
      ord.productTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.orderNumber.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-[#07132e]/90 border border-amber-500/30 rounded-2xl p-4 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search phone, tranche, contract #..."
            className="w-full bg-slate-950/80 border border-slate-700/60 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {(['all', 'active', 'completed', 'expired'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                statusFilter === st
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-900/40'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {st}
            </button>
          ))}
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="px-2.5 py-1.5 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 border border-amber-600/40 text-amber-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95 ml-1"
              title="Fetch latest orders on request"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-[#07132e]/90 border border-blue-900/40 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-blue-900/50 bg-[#040b1e] text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4">Contract #</th>
                <th className="py-3.5 px-4">Investor Phone</th>
                <th className="py-3.5 px-4">Share Tranche</th>
                <th className="py-3.5 px-4">Principal Value</th>
                <th className="py-3.5 px-4">Daily Yield</th>
                <th className="py-3.5 px-4">Earned / Cycle</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500 font-medium">
                    No investment subscription contracts found.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord, oIdx) => (
                  <tr key={ord.id ? `ord_${ord.id}_${oIdx}` : `ord_${oIdx}`} className="hover:bg-slate-900/50 transition">
                    <td className="py-3.5 px-4 font-mono text-[11px] text-slate-400">
                      {ord.orderNumber || ord.id.slice(0, 10)}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-white">
                      {ord.userPhone || 'Anonymous'}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>{ord.productTitle}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Subscribed: {ord.purchasedAt}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      ₦{ord.price.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 font-mono font-bold text-amber-300">
                      ₦{(ord.dailyIncome || 0).toLocaleString()} / day
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-300">
                      <div>₦{(ord.earnedSoFar || 0).toLocaleString()} claimed</div>
                      <div className="text-[10px] text-slate-400">
                        {ord.daysRemaining} of {ord.cycleDays} days left
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                          ord.status === 'active'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : ord.status === 'completed'
                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {ord.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {onDeleteOrder && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete subscription ${ord.orderNumber}?`)) {
                              onDeleteOrder(ord.id);
                            }
                          }}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 text-slate-400 hover:text-rose-300 transition"
                          title="Delete Order"
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
