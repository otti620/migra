import { useState, useMemo } from 'react';
import { ArrowLeft, Clock, CheckCircle2, XCircle, Building2, ShieldCheck, AlertCircle, ArrowUpRight } from 'lucide-react';
import { ActiveScreen, PendingWithdrawalReq, User } from '../types';

interface WithdrawalRecordsScreenProps {
  user: User;
  pendingWithdrawals: PendingWithdrawalReq[];
  onNavigate: (screen: ActiveScreen) => void;
}

export function WithdrawalRecordsScreen({ user, pendingWithdrawals, onNavigate }: WithdrawalRecordsScreenProps) {
  const userWithdrawals = useMemo(() => {
    const list: PendingWithdrawalReq[] = [];
    const seenIds = new Set<string>();
    const cleanUserPhone = (user.phone || '').replace(/[^0-9]/g, '');

    (pendingWithdrawals || []).forEach((w) => {
      const wp = (w.userPhone || '').replace(/[^0-9]/g, '');
      if (!wp || wp === cleanUserPhone || cleanUserPhone.endsWith(wp) || wp.endsWith(cleanUserPhone)) {
        if (!seenIds.has(w.id)) {
          seenIds.add(w.id);
          list.push(w);
        }
      }
    });

    (user.records || []).forEach((r) => {
      const rType = (r.type || '').toLowerCase();
      const rTitle = (r.title || '').toLowerCase();
      if (rType === 'withdraw' || rTitle.includes('withdraw')) {
        const id = r.id || `wth-${r.timestamp}`;
        if (!seenIds.has(id)) {
          seenIds.add(id);
          const isUsdt = (r.details || '').includes('USDT');
          list.push({
            id,
            reference: id,
            userPhone: user.phone,
            amount: r.amount || 0,
            payoutMethod: isUsdt ? 'usdt' : 'bank',
            status: (r.status as any) || 'pending',
            time: r.timestamp ? new Date(r.timestamp).toISOString() : new Date().toISOString(),
            bankName: r.bankAccount?.bankName || (isUsdt ? 'TRC20 USDT' : 'Nigerian Bank'),
            accountNumber: r.bankAccount?.accountNumber || '',
            accountName: r.bankAccount?.accountName || 'Account Holder',
          });
        }
      }
    });

    list.sort((a, b) => new Date(b.time || 0).getTime() - new Date(a.time || 0).getTime());
    return list;
  }, [pendingWithdrawals, user]);

  return (
    <div className="pb-28 pt-4 px-4 space-y-4 max-w-md mx-auto animate-fade-in text-white">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('my')}
          className="w-10 h-10 rounded-2xl bg-[#18153b] border border-purple-900/60 flex items-center justify-center text-purple-200 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-black tracking-wide">Live Withdrawal Records</h2>
        <div className="w-10" />
      </div>

      <div className="bg-[#18153b] border border-purple-900/40 rounded-3xl p-4 shadow-xl space-y-2">
        <div className="flex items-center gap-2 text-amber-400 text-xs font-black uppercase tracking-wider">
          <Clock className="w-4 h-4" /> Real-Time Payout Tracking
        </div>
        <p className="text-xs text-purple-200/80 leading-relaxed">
          Monitor the live stages of your withdrawal requests through bank verification, clearing, and final settlement.
        </p>
      </div>

      {userWithdrawals.length === 0 ? (
        <div className="bg-[#18153b]/60 border border-purple-900/40 rounded-3xl p-10 text-center space-y-3">
          <div className="w-14 h-14 rounded-full bg-purple-900/50 flex items-center justify-center mx-auto text-purple-300">
            <Building2 className="w-7 h-7" />
          </div>
          <h3 className="font-bold text-sm text-white">No Withdrawal Records Found</h3>
          <p className="text-xs text-purple-300/70 max-w-xs mx-auto">
            You haven't requested any withdrawals yet. Visit the withdraw page to initiate a payout.
          </p>
          <button
            onClick={() => onNavigate('withdraw')}
            className="mt-2 px-5 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-black text-xs rounded-xl shadow-lg"
          >
            Go to Withdraw
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {userWithdrawals.map((w, idx) => {
            const isSuccess = w.status === 'success';
            const isFailed = w.status === 'failed';
            const isPending = w.status === 'pending';

            const fee = Math.round(w.amount * 0.11);
            const netAmount = w.amount - fee;

            return (
              <div
                key={w.id ? `wd_rec_${w.id}_${idx}` : `wd_rec_${idx}`}
                className="bg-[#18153b] border border-purple-900/50 rounded-3xl p-4 shadow-xl space-y-4"
              >
                {/* Top Row: Ref & Status Badge */}
                <div className="flex items-center justify-between border-b border-purple-900/50 pb-3">
                  <div>
                    <span className="text-[10px] font-mono text-purple-300 uppercase tracking-wider block">Reference</span>
                    <span className="text-xs font-black font-mono text-amber-300">{w.reference || w.id}</span>
                  </div>

                  <div>
                    {isSuccess && (
                      <span className="bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Approved & Paid
                      </span>
                    )}
                    {isFailed && (
                      <span className="bg-rose-950/80 border border-rose-500/50 text-rose-300 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5 text-rose-400" /> Rejected / Refunded
                      </span>
                    )}
                    {isPending && (
                      <span className="bg-amber-950/80 border border-amber-500/50 text-amber-300 text-[10px] font-black px-2.5 py-1 rounded-full flex items-center gap-1 animate-pulse">
                        <Clock className="w-3.5 h-3.5 text-amber-400" /> Processing
                      </span>
                    )}
                  </div>
                </div>

                {/* Amount Details */}
                <div className="grid grid-cols-2 gap-2 bg-[#120f2b] p-3 rounded-2xl border border-purple-900/40">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-purple-300 block">Requested Amount</span>
                    <span className="text-base font-black text-white">₦{w.amount.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-purple-300 block">Net Payout (After 11%)</span>
                    <span className="text-base font-black text-emerald-400">
                      {w.payoutMethod === 'usdt' || w.bankName?.includes('USDT') 
                        ? `${w.usdtAmount || (netAmount / 1500).toFixed(2)} USDT` 
                        : `₦${netAmount.toLocaleString()}`}
                    </span>
                  </div>
                </div>

                {/* Destination Details */}
                <div className="space-y-1.5 text-xs text-purple-200 bg-[#0e0b24] p-3 rounded-2xl border border-purple-900/30">
                  <div className="flex justify-between items-center">
                    <span className="text-purple-400">Method:</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-900/50 text-cyan-300 border border-blue-700/50">
                      {w.payoutMethod === 'usdt' || w.bankName?.includes('USDT') ? 'USDT (TRC20)' : 'Nigerian Bank Transfer'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-400">{w.payoutMethod === 'usdt' || w.bankName?.includes('USDT') ? 'Network:' : 'Bank Name:'}</span>
                    <span className="font-bold text-white">{w.bankName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-purple-400">{w.payoutMethod === 'usdt' || w.bankName?.includes('USDT') ? 'USDT Address:' : 'Account Number:'}</span>
                    <span className="font-mono font-bold text-amber-300 break-all max-w-[200px] text-right">{w.accountNumber || w.usdtAddress || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-400">Beneficiary:</span>
                    <span className="font-bold text-white">{w.accountName || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-purple-400">Requested Time:</span>
                    <span className="text-[11px] text-purple-300">
                      {w.time || 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Live Payment Stages Timeline */}
                <div className="space-y-2 pt-2 border-t border-purple-900/50">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-300 block">
                    Payment Progress Stages
                  </span>

                  <div className="space-y-2 text-xs">
                    {/* Stage 1: Submitted */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center shrink-0">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 flex justify-between items-center">
                        <span className="font-bold text-slate-200">1. Submitted & Queued</span>
                        <span className="text-[10px] text-emerald-400 font-bold">Completed</span>
                      </div>
                    </div>

                    {/* Stage 2: Verification */}
                    <div className="flex items-center gap-2.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isPending ? 'bg-amber-500/20 border border-amber-500 text-amber-400 animate-pulse' : 'bg-emerald-500/20 border border-emerald-500 text-emerald-400'}`}>
                        {isPending ? <Clock className="w-3 h-3" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      </div>
                      <div className="flex-1 flex justify-between items-center">
                        <span className="font-bold text-slate-200">2. Risk & Compliance Audit</span>
                        <span className={`text-[10px] font-bold ${isPending ? 'text-amber-400' : 'text-emerald-400'}`}>
                          {isPending ? 'In Progress' : 'Passed'}
                        </span>
                      </div>
                    </div>

                    {/* Stage 3: Bank Routing */}
                    <div className="flex items-center gap-2.5">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${isSuccess ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-400' : isFailed ? 'bg-rose-500/20 border border-rose-500 text-rose-400' : 'bg-slate-800 border border-slate-700 text-slate-500'}`}>
                        {isSuccess ? <CheckCircle2 className="w-3.5 h-3.5" /> : isFailed ? <XCircle className="w-3.5 h-3.5" /> : <Clock className="w-3 h-3" />}
                      </div>
                      <div className="flex-1 flex justify-between items-center">
                        <span className="font-bold text-slate-200">3. Bank Clearing & Settlement</span>
                        <span className={`text-[10px] font-bold ${isSuccess ? 'text-emerald-400' : isFailed ? 'text-rose-400' : 'text-slate-400'}`}>
                          {isSuccess ? 'Settled' : isFailed ? 'Rejected' : 'Awaiting Clearing'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
