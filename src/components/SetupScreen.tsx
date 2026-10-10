import { ArrowLeft, Lock, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { ActiveScreen } from '../types';
import React, { useState } from 'react';

interface SetupScreenProps {
  onNavigate: (screen: ActiveScreen) => void;
}

export function SetupScreen({ onNavigate }: SetupScreenProps) {
  const [oldPass, setOldPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccess(true);
    setTimeout(() => {
      onNavigate('my');
    }, 1500);
  };

  return (
    <div className="pb-24 pt-3 px-4 space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => onNavigate('my')} className="w-9 h-9 rounded-full bg-[#18153b] border border-purple-900 flex items-center justify-center text-slate-300">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-white">Security & Set Up</h2>
        <div className="w-9"></div>
      </div>

      {success && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500 rounded-2xl text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Security settings updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-[#18153b] border border-purple-900/40 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-purple-300">Current Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
            <input
              type="password"
              value={oldPass}
              onChange={(e) => setOldPass(e.target.value)}
              placeholder="Enter current password"
              className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-semibold text-purple-300">New Password</label>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400" />
            <input
              type="password"
              value={newPass}
              onChange={(e) => setNewPass(e.target.value)}
              placeholder="Enter new password"
              className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 transition"
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-purple-600/40 hover:opacity-95 transition flex items-center justify-center gap-2 mt-4"
        >
          <ShieldCheck className="w-5 h-5" /> Update Security Password
        </button>
      </form>

      {/* HQ Admin Link */}
      <button
        onClick={() => onNavigate('admin')}
        className="w-full py-3.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-2xl hover:bg-amber-500/30 transition flex items-center justify-center gap-2 shadow-md"
      >
        <ShieldCheck className="w-4 h-4 text-amber-400" /> Switch to Headquarters Admin Panel
      </button>
    </div>
  );
}
