import React from 'react';
import { 
  LayoutDashboard, Users, ArrowDownToLine, ArrowUpFromLine, 
  Package, ShoppingBag, Gift, Megaphone, Settings, FileCheck, 
  ShieldCheck, LogOut, RefreshCw, Zap
} from 'lucide-react';
import { motion } from 'motion/react';
import { ActiveScreen } from '../../types';
import firebaseConfig from '../../../firebase-applet-config.json';

export type AdminTab = 
  | 'overview' 
  | 'users' 
  | 'deposits' 
  | 'withdrawals' 
  | 'orders' 
  | 'products' 
  | 'codes' 
  | 'announcements' 
  | 'balance_audit' 
  | 'security_logs'
  | 'usdt_settings';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onSelectTab: (tab: AdminTab) => void;
  pendingDepositsCount: number;
  pendingWithdrawalsCount: number;
  totalUsersCount: number;
  onNavigate: (screen: ActiveScreen) => void;
  onSync?: () => void;
  isSyncing?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingDepositsCount,
  pendingWithdrawalsCount,
  totalUsersCount,
  onNavigate,
  onSync,
  isSyncing
}) => {
  const navSections = [
    {
      title: 'COMMAND CENTER',
      items: [
        { id: 'overview' as AdminTab, label: 'Executive Overview', icon: LayoutDashboard, badge: null },
        { id: 'deposits' as AdminTab, label: 'Pending Deposits', icon: ArrowDownToLine, badge: pendingDepositsCount > 0 ? pendingDepositsCount : null, badgeColor: 'bg-emerald-500 text-black' },
        { id: 'withdrawals' as AdminTab, label: 'Payout Requests', icon: ArrowUpFromLine, badge: pendingWithdrawalsCount > 0 ? pendingWithdrawalsCount : null, badgeColor: 'bg-rose-500 text-white' },
      ]
    },
    {
      title: 'USER & CAPITAL OPS',
      items: [
        { id: 'users' as AdminTab, label: 'User Directory & Credit', icon: Users, badge: totalUsersCount > 0 ? totalUsersCount : null, badgeColor: 'bg-blue-500/30 text-blue-300' },
        { id: 'orders' as AdminTab, label: 'Active Shares / Orders', icon: ShoppingBag, badge: null },
        { id: 'products' as AdminTab, label: 'Product Catalog Studio', icon: Package, badge: null },
      ]
    },
    {
      title: 'MARKETING & PROMO',
      items: [
        { id: 'codes' as AdminTab, label: 'Redemption Codes', icon: Gift, badge: null },
        { id: 'announcements' as AdminTab, label: 'Live Broadcasts', icon: Megaphone, badge: null },
      ]
    },
    {
      title: 'SYSTEM & SECURITY',
      items: [
        { id: 'usdt_settings' as AdminTab, label: 'USDT & Gateway Config', icon: Settings, badge: null },
        { id: 'balance_audit' as AdminTab, label: 'Audit Trail Ledger', icon: FileCheck, badge: null },
        { id: 'security_logs' as AdminTab, label: 'Security Logs', icon: ShieldCheck, badge: null },
      ]
    }
  ];

  return (
    <aside className="w-72 bg-[#060e24]/95 border-r border-blue-900/40 flex flex-col h-screen sticky top-0 shrink-0 select-none z-30">
      {/* Brand Header */}
      <div className="p-5 border-b border-blue-900/40 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-blue-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-blue-500/20 border border-amber-300/40 font-black text-amber-200">
            <Zap className="w-5 h-5 fill-amber-300 text-amber-200" />
          </div>
          <div>
            <div className="font-black tracking-widest text-sm text-white flex items-center gap-1.5">
              DANGOTE <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">HQ</span>
            </div>
            <div className="text-[9px] font-extrabold uppercase tracking-widest text-blue-400 mt-0.5 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {firebaseConfig.projectId || 'tesla-90'}
            </div>
          </div>
        </div>
      </div>

      {/* Nav Items */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5 scrollbar-thin scrollbar-thumb-blue-900">
        {navSections.map((sec, idx) => (
          <div key={idx} className="space-y-1">
            <div className="px-3 text-[10px] font-extrabold tracking-wider text-slate-400 uppercase">
              {sec.title}
            </div>
            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all relative ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/30 border border-blue-400/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-blue-900/40 space-y-2 bg-[#04091a]">
        {onSync && (
          <button
            onClick={onSync}
            disabled={isSyncing}
            className="w-full py-2 px-3 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-emerald-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing Firebase...' : 'Force Sync DB'}</span>
          </button>
        )}
        <button
          onClick={() => onNavigate('home')}
          className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 border border-amber-500/30 text-amber-300 text-xs font-black flex items-center justify-center gap-2 transition"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit to User Portal</span>
        </button>
      </div>
    </aside>
  );
};
