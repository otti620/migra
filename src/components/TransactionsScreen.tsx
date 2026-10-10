import { useState } from 'react';
import { ArrowLeft, Receipt, ShieldCheck, X, CheckCircle2, Clock, XCircle, RefreshCw } from 'lucide-react';
import { ActiveScreen, Transaction, BalanceAuditLog } from '../types';
import { formatUSD, formatNaira, nairaToUsd } from '../utils/currency';

interface TransactionsScreenProps {
  title: string;
  transactions: Transaction[];
  balanceAuditLogs?: BalanceAuditLog[];
  userPhone?: string;
  onNavigate: (screen: ActiveScreen) => void;
  usdNairaRate?: number;
  onRefreshTransactions?: () => Promise<void> | void;
  isRefreshingTransactions?: boolean;
}

export function TransactionsScreen({ 
  title, 
  transactions, 
  balanceAuditLogs = [], 
  userPhone, 
  onNavigate, 
  usdNairaRate = 1500,
  onRefreshTransactions,
  isRefreshingTransactions = false
}: TransactionsScreenProps) {
  const [selectedTx, setSelectedTx] = useState<Transaction | null>(null);
  const [activeTab, setActiveTab] = useState<'tx' | 'audit'>('tx');

  const userLogs = balanceAuditLogs.filter(log => !userPhone || log.phone === userPhone);

  return (
    <div className="pb-24 pt-3 px-4 space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => onNavigate('my')} className="w-9 h-9 rounded-full bg-[#18153b] border border-purple-900 flex items-center justify-center text-slate-300">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-white">{title}</h2>
        {onRefreshTransactions ? (
          <button 
            onClick={() => onRefreshTransactions()} 
            disabled={isRefreshingTransactions}
            className="w-9 h-9 rounded-full bg-[#18153b] border border-purple-900 flex items-center justify-center text-purple-300 hover:text-white transition active:scale-95 disabled:opacity-50"
            title="Fetch transactions on request"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshingTransactions ? 'animate-spin text-amber-400' : ''}`} />
          </button>
        ) : (
          <div className="w-9"></div>
        )}
      </div>

      {/* Main Tab Switcher */}
      <div className="grid grid-cols-2 bg-[#18153b] p-1.5 rounded-2xl border border-purple-900/50 shadow-md">
        <button
          onClick={() => setActiveTab('tx')}
          className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'tx'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" /> Records ({transactions.length})
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'audit'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5" /> Server Ledger ({userLogs.length})
        </button>
      </div>

      {activeTab === 'tx' ? (
        <>
          {/* Filter bar */}
          <div className="flex gap-3">
            <button className="flex-1 bg-white text-slate-900 border border-slate-100 shadow-sm rounded-2xl py-3 px-4 flex items-center justify-between text-xs font-bold">
              <span>2026</span>
              <span className="text-slate-400 text-xs">▼</span>
            </button>
            <button className="flex-1 bg-white text-slate-900 border border-slate-100 shadow-sm rounded-2xl py-3 px-4 flex items-center justify-between text-xs font-bold">
              <span>All Months</span>
              <span className="text-slate-400 text-xs">▼</span>
            </button>
          </div>

          {/* Transaction list */}
          <div className="space-y-3">
            {transactions.map((tx, idx) => (
              <div 
                key={tx.id ? `tx_${tx.id}_${idx}` : `tx_${idx}`} 
                onClick={() => setSelectedTx(tx)}
                className="bg-white text-slate-900 border border-slate-100 rounded-2xl p-4 shadow-md flex items-center justify-between cursor-pointer hover:border-purple-300 transition"
              >
                <div className="space-y-1">
                  <span className="font-mono text-xs font-bold text-slate-900 block flex items-center gap-1.5">
                    <Receipt className="w-3.5 h-3.5 text-purple-600" />
                    {tx.reference || tx.id}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">{tx.date}</span>
                </div>
                <div className="text-right">
                  <div className="text-base font-black text-slate-900 font-mono">
                    +{formatNaira(tx.amount, true)}
                  </div>
                  <div className="text-[11px] font-bold text-slate-500">
                    (≈ +{formatUSD(nairaToUsd(tx.amount, usdNairaRate))})
                  </div>
                  <div className="flex items-center justify-end gap-1 mt-0.5">
                    <span className="text-[11px] font-extrabold text-amber-600">{tx.type}</span>
                    <span className={`text-[9px] font-black px-1.5 py-0.2 rounded uppercase ${
                      tx.status === 'success' ? 'bg-emerald-100 text-emerald-700' :
                      tx.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                    }`}>
                      {tx.status || 'success'}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {transactions.length === 0 && (
              <div className="text-center py-16 text-slate-400 text-sm bg-white/5 rounded-3xl border border-white/5 p-6">
                No transaction records found.
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="space-y-3">
          <div className="bg-purple-950/40 border border-purple-500/30 p-3.5 rounded-2xl text-xs text-purple-200 leading-relaxed">
            <span className="font-bold block text-purple-300 mb-0.5">🛡️ Transparent Balance Ledger</span>
            Every verified credit, recharge, earnings claim, and administrative adjustment is securely recorded below with server-side validation to guarantee zero balance discrepancies.
          </div>

          {userLogs.map((log, idx) => (
            <div 
              key={log.id ? `log_${log.id}_${idx}` : `log_${idx}`} 
              className="bg-white text-slate-900 border border-slate-100 rounded-2xl p-4 shadow-md flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="font-mono text-[11px] font-bold text-purple-700 block flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                  Ref: {log.referenceId || log.id}
                </span>
                <span className="text-[10px] text-slate-400 block font-medium">{log.verifiedAt ? new Date(log.verifiedAt).toLocaleString() : 'Just now'}</span>
              </div>
              <div className="text-right">
                <div className={`text-base font-black ${log.deltaAmount >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {log.deltaAmount >= 0 ? `+₦${log.deltaAmount.toLocaleString()}` : `-₦${Math.abs(log.deltaAmount).toLocaleString()}`}
                </div>
                <div className="flex items-center justify-end gap-1 mt-0.5">
                  <span className="text-[11px] font-extrabold text-slate-700">{log.eventType}</span>
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded uppercase bg-emerald-100 text-emerald-800">
                    {log.status || 'Verified'}
                  </span>
                </div>
              </div>
            </div>
          ))}

          {userLogs.length === 0 && (
            <div className="text-center py-16 text-slate-400 text-sm bg-white/5 rounded-3xl border border-white/5 p-6">
              No balance audit records found for this account.
            </div>
          )}
        </div>
      )}

      {/* Transaction Receipt Modal */}
      {selectedTx && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white text-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden border border-slate-100 relative">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white p-6 text-center relative">
              <button 
                onClick={() => setSelectedTx(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-12 h-12 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center mx-auto mb-3 shadow-inner">
                {selectedTx.status === 'success' || !selectedTx.status ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                ) : selectedTx.status === 'pending' ? (
                  <Clock className="w-6 h-6 text-amber-400" />
                ) : (
                  <XCircle className="w-6 h-6 text-rose-400" />
                )}
              </div>
              <h3 className="text-xs uppercase tracking-widest text-purple-200 font-extrabold">Official Transaction Receipt</h3>
              <div className="text-2xl font-black mt-1">₦{selectedTx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              <div className="mt-2 inline-flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-[11px] font-bold text-white uppercase tracking-wider">
                {selectedTx.type}
              </div>
            </div>

            {/* Receipt Details Body */}
            <div className="p-6 space-y-4">
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Transaction ID</span>
                  <span className="font-mono font-bold text-slate-900">{selectedTx.id}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Reference Code</span>
                  <span className="font-mono font-bold text-purple-700">{selectedTx.reference || 'N/A'}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Date & Time</span>
                  <span className="font-bold text-slate-900">{selectedTx.date}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Transaction Type</span>
                  <span className="font-bold text-slate-900">{selectedTx.type}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-400 font-medium">Status</span>
                  <span className={`font-black uppercase text-[11px] px-2 py-0.5 rounded ${
                    selectedTx.status === 'success' || !selectedTx.status ? 'bg-emerald-100 text-emerald-800' :
                    selectedTx.status === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {selectedTx.status || 'success'}
                  </span>
                </div>
                {selectedTx.description && (
                  <div className="py-2 border-b border-slate-100">
                    <span className="text-slate-400 font-medium block mb-1">Description</span>
                    <span className="text-slate-700 text-[11px] font-medium leading-relaxed block">{selectedTx.description}</span>
                  </div>
                )}
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 flex items-center gap-2.5 text-[11px] text-slate-600">
                <ShieldCheck className="w-5 h-5 text-purple-600 shrink-0" />
                <span>Verified by Titan Digital Systems secure ledger. Secured with 256-bit encryption.</span>
              </div>

              <button
                onClick={() => setSelectedTx(null)}
                className="w-full py-3 bg-purple-900 hover:bg-purple-800 text-white font-bold text-xs rounded-2xl shadow-md transition"
              >
                Close Receipt
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

