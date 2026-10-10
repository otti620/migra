import React, { useState } from 'react';
import { ShieldAlert, KeyRound, ShieldCheck, CheckCircle2, AlertCircle, ArrowLeft, Sparkles } from 'lucide-react';
import { verifyAndAuthorizeAdmin, ADMIN_EMAILS } from '../utils/authUtils';
import { soundService } from '../utils/audioService';
import { ActiveScreen } from '../types';

interface AdminGateScreenProps {
  onUnlock: () => void;
  onNavigate: (screen: ActiveScreen) => void;
}

export function AdminGateScreen({ onUnlock, onNavigate }: AdminGateScreenProps) {
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleVerify = (codeToVerify?: string) => {
    const code = codeToVerify || passcode;
    setErrorMsg('');
    const isValid = verifyAndAuthorizeAdmin(code);
    if (isValid) {
      soundService.playSuccess();
      setSuccessMsg('Administrator credentials confirmed! Opening HQ Control Panel...');
      setTimeout(() => {
        onUnlock();
      }, 500);
    } else {
      soundService.playError();
      setErrorMsg('Invalid authorization code. Please enter authorized PIN or credentials.');
    }
  };

  return (
    <div className="p-6 max-w-md mx-auto space-y-6 pb-24 pt-4">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('my')}
          className="w-9 h-9 rounded-full bg-[#18153b] border border-purple-900 flex items-center justify-center text-slate-300 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Security Gate</span>
        <div className="w-9"></div>
      </div>

      {/* Security Gate Card */}
      <div className="bg-[#18153b] border border-amber-500/40 rounded-3xl p-6 shadow-2xl space-y-5 text-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto text-amber-400 shadow-lg shadow-amber-500/20">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-1">
          <h2 className="text-lg font-black text-white uppercase tracking-wider">HQ Admin Control Panel</h2>
          <p className="text-xs text-slate-400 font-medium max-w-xs mx-auto">
            Administrative credentials required to manage deposits, withdrawals, users, and store items.
          </p>
        </div>

        {/* Verification Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleVerify();
          }}
          className="space-y-3 text-left"
        >
          <div className="space-y-1">
            <label className="text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
              Admin Passcode / PIN
            </label>
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter PIN (e.g. 7077)"
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 transition font-mono"
                autoFocus
              />
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-center gap-2 text-rose-400 text-xs font-semibold px-1">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-semibold px-1">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black text-xs rounded-2xl shadow-lg hover:opacity-95 transition active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <ShieldCheck className="w-4 h-4" /> Unlock & Access Control Panel
          </button>
        </form>

        {/* 1-Click Fast Unlock */}
        <div className="pt-4 border-t border-slate-800 space-y-2 text-left">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block text-center">
            Instant Administrator Authorization
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleVerify('ottigospel')}
              className="p-3 bg-purple-950/70 hover:bg-purple-900 border border-purple-600/40 rounded-2xl transition flex flex-col gap-0.5 text-left"
            >
              <div className="flex items-center gap-1 text-[11px] text-amber-300 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" /> HQ Email
              </div>
              <span className="text-[9px] text-slate-400 font-mono truncate">{ADMIN_EMAILS[0]}</span>
            </button>

            <button
              type="button"
              onClick={() => handleVerify('7077')}
              className="p-3 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded-2xl transition flex flex-col gap-0.5 text-left"
            >
              <div className="flex items-center gap-1 text-[11px] text-emerald-300 font-bold">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> Master PIN
              </div>
              <span className="text-[9px] text-slate-400 font-mono">PIN: 7077</span>
            </button>
          </div>
        </div>
      </div>

      <button
        onClick={() => onNavigate('home')}
        className="w-full py-3 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white font-bold text-xs rounded-2xl transition text-center"
      >
        Return to Home Screen
      </button>
    </div>
  );
}
