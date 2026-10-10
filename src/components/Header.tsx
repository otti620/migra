import React from 'react';
import { Headphones, ArrowLeft, ShieldAlert, Sparkles, Send, Bell, RefreshCw } from 'lucide-react';
import { ActiveScreen, User } from '../types';
import { isAdminUser } from '../utils/authUtils';
import { DangoteLogo } from './DangoteLogo';

interface HeaderProps {
  currentScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
  title?: string;
  showBack?: boolean;
  onSync?: () => Promise<void> | void;
  isSyncing?: boolean;
  user?: User;
}

export function Header({ currentScreen, onNavigate, title, showBack, onSync, isSyncing, user }: HeaderProps) {
  const hasAdmin = isAdminUser(user);

  const openTelegramCS = () => {
    window.open('https://t.me/dangote_refinery_support', '_blank', 'noopener,noreferrer');
  };

  const isMainTab = ['home', 'products', 'roadmap', 'order', 'my'].includes(currentScreen);

  // Screen title lookup for secondary screens
  const getScreenTitle = () => {
    if (title) return title;
    switch (currentScreen) {
      case 'recharge': return 'Deposit Capital';
      case 'withdraw': return 'Withdraw Funds';
      case 'vip': return 'VIP Privileges';
      case 'team': return 'My Team Network';
      case 'bills': return 'Financial Bills';
      case 'income_record': return 'Income History';
      case 'commission_record': return 'Team Commissions';
      case 'bank_account': return 'Bank Account Binding';
      case 'about_us': return 'About Dangote PLC';
      case 'support': return 'Investor Support Desk';
      case 'setup': return 'Account Settings';
      case 'withdrawal_records': return 'Withdrawal History';
      case 'security_log': return 'Security & Audit Logs';
      case 'task': return 'Daily Tasks & Rewards';
      default: return currentScreen.replace('_', ' ');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#040b1e]/95 backdrop-blur-xl border-b border-blue-900/40 px-4 py-2.5 transition-all shadow-lg">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Left Side: Brand or Back Button */}
        {isMainTab ? (
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
            <DangoteLogo size="sm" showSubtitle={true} />
            <span className="hidden sm:inline-block text-[9px] font-black bg-blue-950 text-blue-300 border border-blue-700/60 px-2 py-0.5 rounded-full uppercase tracking-wider">
              650k BPD
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate(currentScreen === 'task' || currentScreen === 'vip' || currentScreen === 'team' ? 'home' : 'my')}
              className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white transition active:scale-95"
              aria-label="Go Back"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 className="font-bold text-sm text-white capitalize tracking-wide">
              {getScreenTitle()}
            </h1>
          </div>
        )}

        {/* Right Side: Clean Sleek Quick Actions */}
        <div className="flex items-center gap-2">
          {/* On-Demand Fetch / Refresh Button */}
          {onSync && (
            <button
              onClick={() => onSync()}
              disabled={isSyncing}
              className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white transition active:scale-95 disabled:opacity-50"
              title="Fetch fresh data on request"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-amber-400' : 'text-slate-300'}`} />
            </button>
          )}

          {/* Admin shortcut if authenticated */}
          {hasAdmin && (
            <button
              onClick={() => onNavigate('admin')}
              className="px-2.5 py-1 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold flex items-center gap-1 transition active:scale-95"
              title="Admin HQ Control"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-mono">HQ</span>
            </button>
          )}

          {/* Support Desk Icon */}
          <button
            onClick={openTelegramCS}
            className="w-8 h-8 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.08] flex items-center justify-center text-slate-300 hover:text-white transition active:scale-95 relative"
            title="Customer Support"
          >
            <Headphones className="w-4 h-4 text-slate-300" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
          </button>
        </div>
      </div>
    </header>
  );
}
