import React from 'react';
import { 
  Search, Bell, ShieldCheck, Zap, Plus, RefreshCw, 
  DollarSign, Gift, Megaphone, CheckCircle2, ChevronRight, Menu
} from 'lucide-react';
import { AdminTab } from './AdminSidebar';
import { User } from '../../types';

interface AdminHeaderProps {
  activeTab: AdminTab;
  user: User;
  onOpenQuickCredit: () => void;
  onOpenAddProduct: () => void;
  onOpenGenCode: () => void;
  onOpenBroadcast: () => void;
  onToggleMobileMenu?: () => void;
  statusMessage?: string;
  usdNairaRate?: number;
  onFetchData?: () => void;
  isFetching?: boolean;
  lastFetchedAt?: Date | null;
}

const TAB_TITLES: Record<AdminTab, { title: string; desc: string }> = {
  overview: { title: 'Executive Overview', desc: 'Real-time liquidity, deposit pipelines, withdrawal velocity, and system metrics.' },
  deposits: { title: 'Pending Deposits Approvals', desc: 'Direct verification of fiat transfers & Web3 USDT on-chain recharges.' },
  withdrawals: { title: 'Withdrawal Payout Dispatcher', desc: 'Immediate clearance and processing of investor capital withdrawals.' },
  users: { title: 'User Directory & Direct Control', desc: 'Instant balance crediting, VIP upgrading, downline mapping, and account security.' },
  orders: { title: 'Share Subscriptions & Orders', desc: 'Live property tranches, accrued daily yield tracking, and cycle management.' },
  products: { title: 'Investment Product Studio', desc: 'Create, modify, and publish Dangote equity and petrochemical tranches.' },
  codes: { title: 'Redemption & Gift Code Engine', desc: 'Generate multi-use promotional reward codes and monitor instant redemptions.' },
  announcements: { title: 'Live Broadcasts & Marquee', desc: 'Publish priority ticker banners and investor announcement popups.' },
  balance_audit: { title: 'Financial Audit Trail Ledger', desc: 'Immutable cryptographic and Firestore idempotency transaction logs.' },
  security_logs: { title: 'Admin Security & Activity Logs', desc: 'Immutable security log recording admin phone, timestamp, actions (approve/reject), and record ID.' },
  usdt_settings: { title: 'USDT & Gateway Configuration', desc: 'Set master settlement TRON (TRC20) address and live currency conversion rates.' }
};

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  user,
  onOpenQuickCredit,
  onOpenAddProduct,
  onOpenGenCode,
  onOpenBroadcast,
  onToggleMobileMenu,
  statusMessage,
  usdNairaRate = 1500,
  onFetchData,
  isFetching = false,
  lastFetchedAt
}) => {
  const currentInfo = TAB_TITLES[activeTab] || { title: 'Command Center', desc: '' };

  const formatFetchedTime = (date?: Date | null) => {
    if (!date) return 'On demand';
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <header className="bg-[#07132e]/95 backdrop-blur-xl border-b border-blue-900/40 px-6 py-4 sticky top-0 z-20 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      {/* Title & Breadcrumb */}
      <div className="flex items-center gap-3">
        {onToggleMobileMenu && (
          <button 
            onClick={onToggleMobileMenu}
            className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-200"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
            <span>Dangote HQ</span>
            <ChevronRight className="w-3 h-3 text-slate-600" />
            <span className="text-amber-400 capitalize">{activeTab.replace('_', ' ')}</span>
            <span className="hidden sm:inline-flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-blue-900/50 text-[10px] text-blue-300 border border-blue-700/40">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              Fetch on Request
            </span>
          </div>
          <h1 className="text-lg md:text-xl font-black text-white tracking-wide flex items-center gap-2">
            {currentInfo.title}
          </h1>
        </div>
      </div>

      {/* Quick Action Buttons & Status Banner */}
      <div className="flex items-center flex-wrap gap-2.5">
        {statusMessage && (
          <div className="px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5 animate-pulse">
            <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
            <span>{statusMessage}</span>
          </div>
        )}

        {/* Fetch on Request Button */}
        {onFetchData && (
          <button
            onClick={onFetchData}
            disabled={isFetching}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-700 hover:from-cyan-500 hover:to-blue-600 border border-cyan-400/30 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-cyan-950/40 transition active:scale-95 disabled:opacity-50"
            title="Fetch latest database snapshot on request"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin text-amber-300' : 'text-cyan-200'}`} />
            <span>{isFetching ? 'Fetching...' : 'Fetch on Request'}</span>
            {lastFetchedAt && (
              <span className="text-[10px] font-mono text-cyan-200/80 bg-blue-950/60 px-1.5 py-0.5 rounded ml-0.5">
                {formatFetchedTime(lastFetchedAt)}
              </span>
            )}
          </button>
        )}

        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-950/60 border border-blue-800/40 text-blue-300 text-xs font-mono">
          <span>1 USDT =</span>
          <span className="text-emerald-400 font-bold">₦{usdNairaRate.toLocaleString()}</span>
        </div>

        {/* Hot Actions */}
        <button
          onClick={onOpenQuickCredit}
          className="px-3 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-900/30 transition active:scale-95"
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Quick Credit</span>
        </button>

        <button
          onClick={onOpenAddProduct}
          className="px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-blue-900/30 transition active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Share Tranche</span>
        </button>

        <button
          onClick={onOpenGenCode}
          className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-purple-900/30 transition active:scale-95"
        >
          <Gift className="w-3.5 h-3.5" />
          <span>Promo Code</span>
        </button>

        <button
          onClick={onOpenBroadcast}
          className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-amber-300 font-bold text-xs flex items-center gap-1.5 transition active:scale-95"
        >
          <Megaphone className="w-3.5 h-3.5" />
          <span>Broadcast</span>
        </button>
      </div>
    </header>
  );
};
