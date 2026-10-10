import React, { useState } from 'react';
import { ShieldAlert, KeyRound, CheckCircle2, AlertCircle, X, ShieldCheck, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { verifyAndAuthorizeAdmin, ADMIN_EMAILS } from '../utils/authUtils';
import { soundService } from '../utils/audioService';

interface AdminUnlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AdminUnlockModal({ isOpen, onClose, onSuccess }: AdminUnlockModalProps) {
  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleUnlock = (codeToVerify?: string) => {
    const code = codeToVerify || passcode;
    setErrorMsg('');
    const isValid = verifyAndAuthorizeAdmin(code);
    if (isValid) {
      soundService.playSuccess();
      setSuccessMsg('Administrator credentials confirmed! Unlocking HQ Control Panel...');
      setTimeout(() => {
        setSuccessMsg('');
        setPasscode('');
        onSuccess();
      }, 700);
    } else {
      soundService.playError();
      setErrorMsg('Invalid authorization code. Please enter authorized admin PIN or email.');
    }
  };

  const handleQuickUnlockAsGospel = () => {
    handleUnlock('ottigospel');
  };

  const handleQuickUnlockPrimaryPhone = () => {
    handleUnlock('7077');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="relative w-full max-w-sm bg-[#0e112d] border border-amber-500/40 rounded-3xl p-6 text-white shadow-2xl space-y-5"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 transition"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-black text-amber-300 tracking-wide uppercase">HQ Admin Unlock</h3>
              <p className="text-[11px] text-slate-400 font-medium">Authorize device for platform control</p>
            </div>
          </div>

          {/* Prompt description */}
          <div className="bg-[#161a40] border border-purple-900/50 rounded-2xl p-3.5 space-y-2 text-xs text-slate-300 leading-relaxed">
            <p className="flex items-center gap-1.5 font-bold text-amber-200">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              Administrator Verification
            </p>
            <p className="text-[11px] text-slate-400">
              Enter your master administrative PIN or unlock directly using your registered HQ credentials ({ADMIN_EMAILS[0]}).
            </p>
          </div>

          {/* Passcode Input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleUnlock();
            }}
            className="space-y-3"
          >
            <div className="relative">
              <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400" />
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Enter Admin PIN (e.g. 7077)"
                className="w-full bg-slate-950 border border-slate-700 focus:border-amber-400 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-amber-400 transition font-mono tracking-wider"
                autoFocus
              />
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
              className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black text-xs rounded-2xl shadow-lg hover:opacity-95 transition active:scale-[0.99] flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" /> Verify & Access Admin Panel
            </button>
          </form>

          {/* 1-Click Fast Unlock for Verified Admin Email */}
          <div className="pt-2 border-t border-slate-800 space-y-2">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block text-center">
              Quick Admin Session Auth
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleQuickUnlockAsGospel}
                className="p-2.5 bg-purple-950/70 hover:bg-purple-900 border border-purple-600/40 rounded-xl text-left transition flex flex-col gap-0.5"
              >
                <span className="text-[10px] text-amber-300 font-bold">HQ Email Owner</span>
                <span className="text-[9px] text-slate-400 font-mono truncate">ottigospel@gmail.com</span>
              </button>
              <button
                type="button"
                onClick={handleQuickUnlockPrimaryPhone}
                className="p-2.5 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl text-left transition flex flex-col gap-0.5"
              >
                <span className="text-[10px] text-emerald-300 font-bold">Admin Master PIN</span>
                <span className="text-[9px] text-slate-400 font-mono">PIN: 7077</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
