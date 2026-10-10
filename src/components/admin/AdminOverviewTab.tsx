import React from 'react';
import { 
  TrendingUp, ArrowDownToLine, ArrowUpFromLine, Users, 
  Wallet, ShieldCheck, CheckCircle2, XCircle, Clock, 
  ArrowUpRight, AlertCircle, ShoppingBag, Coins, Sparkles, RefreshCw
} from 'lucide-react';
import { User, PendingDeposit, PendingWithdrawalReq, Transaction, Order } from '../../types';

interface AdminOverviewTabProps {
  allUsers: User[];
  allOrders: Order[];
  pendingDeposits: PendingDeposit[];
  pendingWithdrawals: PendingWithdrawalReq[];
  allTransactions: Transaction[];
  onApproveDeposit: (dep: PendingDeposit) => void;
  onRejectDeposit: (depId: string) => void;
  onApproveWithdrawal: (wd: PendingWithdrawalReq) => void;
  onOpenRejectWdModal: (wd: PendingWithdrawalReq) => void;
  onSelectTab: (tab: any) => void;
  usdNairaRate?: number;
  onRefresh?: () => void;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  allUsers,
  allOrders,
  pendingDeposits,
  pendingWithdrawals,
  allTransactions,
  onApproveDeposit,
  onRejectDeposit,
  onApproveWithdrawal,
  onOpenRejectWdModal,
  onSelectTab,
  usdNairaRate = 1500,
  onRefresh
}) => {
  // Aggregate stats
  const totalUsersCount = allUsers.length;
  const activeOrdersCount = allOrders.filter(o => o.status === 'active').length;
  
  const totalDepositsVolume = allTransactions
    .filter(t => (t.type === 'Recharge' || t.type === 'Purchase') && t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalWithdrawalsVolume = allTransactions
    .filter(t => t.type === 'Withdrawal' && t.status === 'success')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalUserBalanceLiability = allUsers.reduce((sum, u) => sum + (u.balance || 0), 0);
  const totalAccruedDailyLiability = allUsers.reduce((sum, u) => sum + (u.accruedIncome || 0), 0);

  const activePendingDeps = pendingDeposits.filter(d => d.status === 'pending');
  const activePendingWds = pendingWithdrawals.filter(w => w.status === 'pending');

  const pendingDepsVal = activePendingDeps.reduce((sum, d) => sum + d.amount, 0);
  const pendingWdsVal = activePendingWds.reduce((sum, w) => sum + w.amount, 0);

  return (
    <div className="space-y-6">
      {/* Overview Top Bar */}
      {onRefresh && (
        <div className="flex items-center justify-between bg-[#07132e]/80 border border-blue-900/40 rounded-2xl px-4 py-2.5 shadow-md">
          <div className="text-xs text-slate-400 font-mono flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Live System Aggregates (Fetch on Request)</span>
          </div>
          <button
            onClick={onRefresh}
            className="px-3 py-1.5 rounded-xl bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700/40 text-blue-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition active:scale-95"
            title="Fetch latest platform metrics on request"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Refresh Metrics</span>
          </button>
        </div>
      )}

      {/* 4-Metric Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Deposit Inflows */}
        <div className="bg-gradient-to-br from-[#0b1a3e] to-[#07132e] border border-emerald-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
            <ArrowDownToLine className="w-16 h-16 text-emerald-400" />
          </div>
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            Total Deposits Volume
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">
            ₦{totalDepositsVolume.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            ≈ ${(totalDepositsVolume / usdNairaRate).toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT
          </div>
        </div>

        {/* Total Withdrawals Outflows */}
        <div className="bg-gradient-to-br from-[#0b1a3e] to-[#07132e] border border-rose-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
            <ArrowUpFromLine className="w-16 h-16 text-rose-400" />
          </div>
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            Total Paid Withdrawals
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">
            ₦{totalWithdrawalsVolume.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            ≈ ${(totalWithdrawalsVolume / usdNairaRate).toLocaleString(undefined, { maximumFractionDigits: 2 })} USDT
          </div>
        </div>

        {/* User Balance Pool */}
        <div className="bg-gradient-to-br from-[#0b1a3e] to-[#07132e] border border-blue-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
            <Wallet className="w-16 h-16 text-blue-400" />
          </div>
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            Total Investor Balances
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">
            ₦{totalUserBalanceLiability.toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-1 flex items-center justify-between">
            <span>{totalUsersCount} Registered Users</span>
          </div>
        </div>

        {/* Active Share Subscriptions */}
        <div className="bg-gradient-to-br from-[#0b1a3e] to-[#07132e] border border-amber-500/30 rounded-2xl p-5 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition">
            <ShoppingBag className="w-16 h-16 text-amber-400" />
          </div>
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            Active Subscriptions
          </div>
          <div className="text-2xl font-black text-white mt-2 font-mono">
            {activeOrdersCount} Tranches
          </div>
          <div className="text-xs text-slate-400 mt-1 font-mono">
            Daily Yield: ₦{totalAccruedDailyLiability.toLocaleString()}
          </div>
        </div>
      </div>

      {/* Hot Direct Pending Approvals Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Deposits Hot Queue */}
        <div className="bg-[#07132e]/90 border border-emerald-500/30 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <ArrowDownToLine className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Hot Pending Deposits</h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  {activePendingDeps.length} Pending (₦{pendingDepsVal.toLocaleString()})
                </span>
              </div>
            </div>
            <button
              onClick={() => onSelectTab('deposits')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activePendingDeps.length === 0 ? (
            <div className="py-8 text-center bg-slate-950/40 rounded-xl border border-slate-800/60">
              <CheckCircle2 className="w-8 h-8 text-emerald-400/60 mx-auto mb-1.5" />
              <div className="text-xs font-bold text-slate-300">All Deposits Processed</div>
              <div className="text-[11px] text-slate-500">No pending recharge requests awaiting approval.</div>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {activePendingDeps.slice(0, 5).map((dep, dIdx) => (
                <div 
                  key={dep.id ? `overview_dep_${dep.id}` : `overview_dep_${dep.reference || dIdx}`} 
                  className="bg-slate-950/70 hover:bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 transition"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-xs">{dep.userPhone}</span>
                      <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-bold">
                        {dep.paymentMethod}
                      </span>
                    </div>
                    <div className="text-xs font-black text-emerald-400 font-mono mt-0.5">
                      +₦{dep.amount.toLocaleString()}
                    </div>
                    <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                      Ref: {dep.reference || dep.id}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => onApproveDeposit(dep)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs flex items-center gap-1 shadow-md shadow-emerald-900/40 transition active:scale-95"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      onClick={() => onRejectDeposit(dep.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/40 hover:border-rose-700/60 border border-slate-700 text-slate-400 hover:text-rose-300 font-bold text-xs transition"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pending Withdrawals Hot Queue */}
        <div className="bg-[#07132e]/90 border border-rose-500/30 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
                <ArrowUpFromLine className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white">Hot Pending Withdrawals</h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  {activePendingWds.length} Pending (₦{pendingWdsVal.toLocaleString()})
                </span>
              </div>
            </div>
            <button
              onClick={() => onSelectTab('withdrawals')}
              className="text-xs font-bold text-rose-400 hover:text-rose-300 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {activePendingWds.length === 0 ? (
            <div className="py-8 text-center bg-slate-950/40 rounded-xl border border-slate-800/60">
              <CheckCircle2 className="w-8 h-8 text-rose-400/60 mx-auto mb-1.5" />
              <div className="text-xs font-bold text-slate-300">All Payouts Dispatched</div>
              <div className="text-[11px] text-slate-500">No investor withdrawal requests in queue.</div>
            </div>
          ) : (
            <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
              {activePendingWds.slice(0, 5).map((wd, wIdx) => {
                const netPayout = Math.floor(wd.amount * 0.89);
                return (
                  <div 
                    key={wd.id ? `overview_wd_${wd.id}` : `overview_wd_${wd.userPhone || wIdx}`} 
                    className="bg-slate-950/70 hover:bg-slate-950 border border-slate-800 rounded-xl p-3 flex items-center justify-between gap-3 transition"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-white text-xs">{wd.userPhone}</span>
                        <span className="text-[10px] text-slate-400 font-mono">{wd.bankName || 'USDT'}</span>
                      </div>
                      <div className="text-xs font-black text-rose-400 font-mono mt-0.5 flex items-center gap-2">
                        <span>Net: ₦{netPayout.toLocaleString()}</span>
                        <span className="text-[10px] text-slate-500 line-through">₦{wd.amount.toLocaleString()}</span>
                      </div>
                      <div className="text-[10px] text-slate-400 truncate max-w-[200px]">
                        {wd.accountNumber} ({wd.accountName || 'Holder'})
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onApproveWithdrawal(wd)}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-black text-xs flex items-center gap-1 shadow-md shadow-rose-900/40 transition active:scale-95"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Pay Out</span>
                      </button>
                      <button
                        onClick={() => onOpenRejectWdModal(wd)}
                        className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 font-bold text-xs transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
