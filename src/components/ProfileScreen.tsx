import React, { useState } from 'react';
import { Crown, Wallet, ArrowUpRight, Gift, FileText, DollarSign, Receipt, Info, ChevronRight, UserPlus, ShieldAlert, Shield, KeyRound, Unlock, Coins, Send, Headphones, ExternalLink, Settings, LogOut, Building2, RefreshCw } from 'lucide-react';
import { ActiveScreen, User } from '../types';
import { isAdminUser } from '../utils/authUtils';
import { AdminUnlockModal } from './AdminUnlockModal';
import { formatUSD, formatNaira, nairaToUsd } from '../utils/currency';

interface ProfileScreenProps {
  user: User;
  onNavigate: (screen: ActiveScreen) => void;
  onOpenRescue: () => void;
  onOpenRedeemCode?: () => void;
  onOpenChangePassword: () => void;
  onLogout: () => void;
  usdNairaRate?: number;
  onRefreshProfile?: () => Promise<void> | void;
  isRefreshingProfile?: boolean;
}

export function ProfileScreen({ 
  user, 
  onNavigate, 
  onOpenRescue, 
  onOpenRedeemCode, 
  onOpenChangePassword, 
  onLogout, 
  usdNairaRate = 1500,
  onRefreshProfile,
  isRefreshingProfile = false,
}: ProfileScreenProps) {
  const [showAdminUnlock, setShowAdminUnlock] = useState(false);
  const [adminOverride, setAdminOverride] = useState(false);

  const menuItems = [
    { label: 'Security Log & Login Audit', icon: Shield, screen: 'security_log' as ActiveScreen },
    { label: 'Withdrawal Records & Live Payouts', icon: ArrowUpRight, screen: 'withdrawal_records' as ActiveScreen },
    { label: 'Funding details', icon: FileText, screen: 'bills' as ActiveScreen },
    { label: 'Commission Record', icon: DollarSign, screen: 'commission_record' as ActiveScreen },
    { label: 'Income Record', icon: Receipt, screen: 'income_record' as ActiveScreen },
    { label: 'Payout Method (Bank & USDT)', icon: Building2, screen: 'bank_account' as ActiveScreen },
    { label: 'About us', icon: Info, screen: 'about_us' as ActiveScreen },
  ];

  const hasAdminAccess = adminOverride || isAdminUser(user);
  const balanceUsd = nairaToUsd(user.balance, usdNairaRate);

  return (
    <div className="pb-24 pt-3 px-4 space-y-4 max-w-md mx-auto">
      {/* Admin Panel Access Banner - ALWAYS visible so administrators never lose their panel */}
      {hasAdminAccess ? (
        <div 
          onClick={() => onNavigate('admin')}
          className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-2xl p-3.5 text-slate-950 font-black shadow-lg cursor-pointer flex items-center justify-between hover:opacity-95 transition active:scale-[0.99] border border-amber-300/50"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-slate-950 text-amber-400 flex items-center justify-center shrink-0 shadow-md">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-slate-950">HQ Admin Control Panel</span>
                <span className="bg-slate-950 text-amber-400 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">Active</span>
              </div>
              <div className="text-[10px] text-slate-900 font-bold">Approve Deposits, Payouts, Users & Products</div>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-950 shrink-0" />
        </div>
      ) : (
        <div 
          onClick={() => setShowAdminUnlock(true)}
          className="bg-gradient-to-r from-[#1c184a] via-[#231b54] to-[#1a1442] border border-amber-500/40 rounded-2xl p-3.5 text-white font-black shadow-lg cursor-pointer flex items-center justify-between hover:border-amber-400 transition group"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-amber-300">HQ Admin Control Panel</span>
                <span className="bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[9px] font-bold px-1.5 py-0.5 rounded-full">Tap to Unlock</span>
              </div>
              <div className="text-[10px] text-slate-400 font-medium">Verify credentials or enter admin PIN to access HQ panel</div>
            </div>
          </div>
          <Unlock className="w-4 h-4 text-amber-400 shrink-0" />
        </div>
      )}
      {/* User Header Card */}
      <div className="bg-[#0a183d] border border-blue-900/50 rounded-3xl p-5 shadow-xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-blue-600 via-amber-500 to-emerald-500 p-0.5 shadow-lg shadow-blue-600/40 flex items-center justify-center shrink-0">
            <div className="w-full h-full bg-[#06112c] rounded-full flex items-center justify-center font-black text-amber-300 text-[10px] tracking-wider text-center">
              DANGOTE
            </div>
          </div>
          <div>
            <div className="text-sm font-black text-white tracking-wide">
              {user.phone ? user.phone : 'Dangote Shareholder'}
            </div>
            <div className="text-[11px] text-blue-200/80 font-semibold mt-0.5">
              Shareholder ID: {user.id || ('DAN-' + (user.phone || '').slice(-6))}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 text-[11px] font-black px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                <Crown className="w-3.5 h-3.5 fill-slate-950" /> VIP{user.vipLevel}
              </span>
              <span className="text-[10px] text-emerald-400 font-mono font-bold">NGX: DANGREFINERY</span>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => onNavigate('team')}
          className="flex flex-col items-center justify-center bg-blue-900/50 border border-blue-700/50 px-3 py-2 rounded-2xl text-blue-200 hover:text-white hover:bg-blue-800/60 transition"
        >
          <UserPlus className="w-5 h-5 text-amber-400 mb-0.5" />
          <span className="text-[10px] font-black tracking-wider uppercase">INVITE</span>
        </button>
      </div>

      {/* Account Balance Card */}
      <div className="bg-[#f7e359] rounded-3xl p-5 text-slate-950 shadow-xl space-y-4">
        <div>
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider font-extrabold text-slate-800 block">Shareholder Wallet Balance (NGN)</span>
            {onRefreshProfile && (
              <button
                onClick={() => onRefreshProfile()}
                disabled={isRefreshingProfile}
                className="px-2 py-0.5 rounded-full bg-slate-950/10 hover:bg-slate-950/20 text-slate-900 font-bold text-[10px] flex items-center gap-1 transition active:scale-95 disabled:opacity-50"
                title="Fetch latest balance on request"
              >
                <RefreshCw className={`w-3 h-3 ${isRefreshingProfile ? 'animate-spin text-slate-950' : ''}`} />
                <span>Sync</span>
              </button>
            )}
          </div>
          <div className="flex items-baseline gap-2.5 mt-0.5 flex-wrap">
            <h2 className="text-3xl font-black text-slate-950 font-mono tracking-tight">{formatNaira(user.balance, true)}</h2>
            <span className="text-xs font-bold text-slate-800 bg-amber-400/80 px-2 py-0.5 rounded-md border border-amber-500/60">
              ≈ {formatUSD(balanceUsd)}
            </span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => onNavigate('recharge')}
            className="py-3 bg-slate-950 text-white font-bold text-xs rounded-full shadow-md flex items-center justify-center gap-2 hover:bg-slate-900 transition"
          >
            <Wallet className="w-4 h-4 text-amber-400" /> Deposit Funds
          </button>
          <button
            onClick={() => onNavigate('withdraw')}
            className="py-3 bg-slate-950 text-white font-bold text-xs rounded-full shadow-md flex items-center justify-center gap-2 hover:bg-slate-900 transition"
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-400" /> Withdraw Yield
          </button>
        </div>
      </div>

      {/* Rescue Presents & Redemption Banner */}
      <div 
        onClick={onOpenRescue}
        className="relative rounded-3xl overflow-hidden p-5 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 border border-purple-500/40 shadow-xl cursor-pointer group flex items-center justify-between"
      >
        <div className="space-y-1">
          <h3 className="font-black text-white text-lg tracking-wider">RESCUE PRESENTS</h3>
          <span className="inline-block bg-pink-500/30 text-pink-200 text-[10px] font-bold px-3 py-1 rounded-full border border-pink-400/30">
            Cash gifts & Redemption codes 🧧
          </span>
        </div>
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-500 to-purple-600 flex items-center justify-center shadow-lg shadow-pink-500/50 shrink-0">
          <Gift className="w-6 h-6 text-white animate-pulse" />
        </div>
      </div>

      {/* Official Telegram Channel & Support Quick Access */}
      <div className="bg-[#18153b] border border-purple-900/40 rounded-3xl p-4 shadow-xl space-y-3">
        <div className="text-xs font-black uppercase text-purple-200 tracking-wider flex items-center gap-1.5">
          <Send className="w-3.5 h-3.5 text-cyan-400" /> Telegram Support & Community
        </div>
        
        <div className="grid grid-cols-2 gap-2">
          <a
            href="https://t.me/dangote_refinery_support"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-blue-950/60 hover:bg-blue-900/80 border border-blue-600/40 rounded-2xl flex flex-col gap-1 transition text-left shadow-md"
          >
            <div className="flex items-center justify-between">
              <Headphones className="w-4 h-4 text-amber-300" />
              <ExternalLink className="w-3 h-3 text-blue-300" />
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-300">Investor Support</span>
            <span className="text-xs font-extrabold text-amber-300 font-mono">@DANGOTE_SUPPORT</span>
          </a>

          <a
            href="https://t.me/dangote_refinery_plc"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 rounded-2xl flex flex-col gap-1 transition text-left shadow-md"
          >
            <div className="flex items-center justify-between">
              <Send className="w-4 h-4 text-emerald-300" />
              <ExternalLink className="w-3 h-3 text-emerald-300" />
            </div>
            <span className="text-[10px] uppercase font-bold text-slate-300">Official Syndicate</span>
            <span className="text-xs font-extrabold text-emerald-300 font-mono">t.me/dangote_ipo</span>
          </a>
        </div>
      </div>

      {/* Menu List - White Container */}
      <div className="bg-white text-slate-900 border border-slate-100 rounded-3xl p-2 shadow-xl space-y-1">
        {/* HQ Admin Menu Row for quick access */}
        <button
          onClick={() => {
            if (hasAdminAccess) {
              onNavigate('admin');
            } else {
              setShowAdminUnlock(true);
            }
          }}
          className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 transition text-left group shadow-sm"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-600 group-hover:scale-110 transition shadow-inner">
              <ShieldAlert className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <span className="font-black text-sm text-amber-950 block">HQ Admin Control Panel</span>
              <span className="text-[10px] text-amber-700 font-bold block">
                {hasAdminAccess ? 'Verified Administrator Access — Open Panel' : 'Tap to enter Admin Access Code & Manage System'}
              </span>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-amber-700 group-hover:text-amber-950 transition" />
        </button>

        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={idx}
              onClick={() => onNavigate(item.screen)}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl hover:bg-blue-50/60 transition text-left group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition">
                  <Icon className="w-4 h-4" />
                </div>
                <span className="font-bold text-sm text-slate-800">{item.label}</span>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition" />
            </button>
          );
        })}
      </div>

      {/* Change Password & Logout buttons */}
      <div className="space-y-2">
        <button
          onClick={onOpenChangePassword}
          className="w-full py-3.5 bg-blue-950/60 border border-blue-500/40 text-blue-200 font-bold text-xs rounded-2xl shadow-md hover:bg-blue-900/60 transition flex items-center justify-center gap-2"
        >
          <Settings className="w-4 h-4 text-amber-400" /> Change Security Password
        </button>

        <button
          onClick={onLogout}
          className="w-full py-3.5 bg-rose-950/40 border border-rose-500/30 text-rose-300 font-bold text-xs rounded-2xl shadow-md hover:bg-rose-900/40 transition flex items-center justify-center gap-2"
        >
          <LogOut className="w-4 h-4" /> Log Out
        </button>
      </div>

      <AdminUnlockModal
        isOpen={showAdminUnlock}
        onClose={() => setShowAdminUnlock(false)}
        onSuccess={() => {
          setAdminOverride(true);
          setShowAdminUnlock(false);
          onNavigate('admin');
        }}
      />
    </div>
  );
}
