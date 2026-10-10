import React, { useState } from 'react';
import { motion } from 'motion/react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { soundService } from '../utils/audioService';

interface RedeemCodeModalProps {
  onClose: () => void;
  onRedeem: (code: string) => Promise<{ success: boolean; message: string; amount?: number }> | { success: boolean; message: string; amount?: number };
}

export function RedeemCodeModal({ onClose, onRedeem }: RedeemCodeModalProps) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setResultMsg({ type: 'error', text: 'Please enter a redemption code' });
      soundService.playError();
      return;
    }

    soundService.playClick();
    setLoading(true);
    setResultMsg(null);

    try {
      const res = await onRedeem(code.trim());
      if (res.success) {
        soundService.playCoin();
        setResultMsg({ type: 'success', text: res.message });
        setCode('');
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        soundService.playError();
        setResultMsg({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      soundService.playError();
      setResultMsg({ type: 'error', text: err?.message || 'Invalid redemption code.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.85, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.85, opacity: 0, y: 15 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="w-full max-w-sm relative text-center"
      >
        {/* Floating Golden Coins Background Layer */}
        <div className="absolute -top-12 -left-6 w-12 h-12 bg-[#ffd700] rounded-full shadow-lg border-2 border-amber-200 flex items-center justify-center text-amber-900 font-black text-xs rotate-12 animate-bounce pointer-events-none z-10">
          ₦
        </div>
        <div className="absolute -bottom-6 -right-4 w-14 h-14 bg-[#ffd700] rounded-full shadow-lg border-2 border-amber-200 flex items-center justify-center text-amber-900 font-black text-sm -rotate-12 animate-pulse pointer-events-none z-10">
          ₦
        </div>
        <div className="absolute top-1/2 -left-8 w-10 h-10 bg-[#fcc011] rounded-full shadow-md border-2 border-amber-100 flex items-center justify-center text-amber-950 font-black text-xs rotate-45 pointer-events-none z-10">
          ₦
        </div>
        <div className="absolute bottom-8 -right-8 w-11 h-11 bg-[#fcc011] rounded-full shadow-md border-2 border-amber-100 flex items-center justify-center text-amber-950 font-black text-xs -rotate-45 pointer-events-none z-10">
          ₦
        </div>

        {/* Top Header Floating Decorative Red Envelopes */}
        <div className="flex justify-center gap-3 mb-[-24px] relative z-0">
          <div className="w-14 h-20 bg-gradient-to-b from-rose-500 to-red-600 rounded-xl shadow-md transform -rotate-12 border border-rose-300 flex flex-col items-center justify-center text-amber-300 font-black text-xs">
            <span>🎁</span>
            <span className="text-[9px] mt-1 text-white">CODE</span>
          </div>
          <div className="w-16 h-22 bg-gradient-to-b from-red-500 to-rose-700 rounded-2xl shadow-xl border border-rose-200 flex flex-col items-center justify-center text-amber-200 font-black text-sm">
            <span>🧧</span>
            <span className="text-[10px] mt-1 text-amber-300">REWARD</span>
          </div>
          <div className="w-14 h-20 bg-gradient-to-b from-rose-500 to-red-600 rounded-xl shadow-md transform rotate-12 border border-rose-300 flex flex-col items-center justify-center text-amber-300 font-black text-xs">
            <span>💰</span>
            <span className="text-[9px] mt-1 text-white">BONUS</span>
          </div>
        </div>

        {/* Red Envelope Container Card */}
        <div className="bg-gradient-to-b from-[#f24244] via-[#e53436] to-[#cd2426] rounded-[32px] p-6 pt-8 shadow-2xl border-2 border-red-400 relative z-10 space-y-5">
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-3.5 right-3.5 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 w-8 h-8 rounded-full flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Title Header */}
          <h3 className="text-2xl font-extrabold text-white tracking-wide text-center drop-shadow-md">
            Redemption Code
          </h3>

          <form onSubmit={handleConfirm} className="space-y-4">
            {/* Curved Cream Input Box */}
            <div className="bg-[#fff8e3] rounded-3xl p-4 shadow-inner border-2 border-[#ffd375] relative">
              <input
                type="text"
                value={code}
                onChange={(e) => {
                  setCode(e.target.value);
                  if (resultMsg) setResultMsg(null);
                }}
                placeholder="Enter Redemption Code..."
                className="w-full bg-transparent text-center text-base font-extrabold text-slate-900 placeholder-slate-400 focus:outline-none tracking-widest font-mono"
                autoFocus
              />

              {/* Status or Error Banner inside Input Container */}
              {resultMsg && (
                <div
                  className={`mt-2 p-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-sm ${
                    resultMsg.type === 'success'
                      ? 'bg-emerald-500/20 text-emerald-800 border border-emerald-400'
                      : 'bg-black/70 text-white border border-rose-400'
                  }`}
                >
                  {resultMsg.type === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />
                  )}
                  <span>{resultMsg.text}</span>
                </div>
              )}
            </div>

            {/* Confirm Yellow Button */}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-[#ffe478] via-[#ffd852] to-[#fec832] hover:from-[#ffe88a] hover:to-[#ffd145] text-[#8e191a] font-extrabold text-lg rounded-full shadow-xl border border-amber-200 transition active:scale-95 tracking-wide"
            >
              Confirm
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}
