import React, { useState } from 'react';
import { X, CheckCircle2, AlertCircle } from 'lucide-react';
import { soundService } from '../utils/audioService';

interface RescuePresentModalProps {
  onClose: () => void;
  onRedeem: (code: string) => Promise<{ success: boolean; message: string; amount?: number }> | { success: boolean; message: string; amount?: number };
}

export function RescuePresentModal({
  onClose,
  onRedeem,
}: RescuePresentModalProps) {
  const [redeemInput, setRedeemInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [redeemResult, setRedeemResult] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleConfirmCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = redeemInput.trim().toUpperCase();
    if (!clean) {
      setRedeemResult({ type: 'error', text: 'Please enter a redemption code' });
      soundService.playError();
      return;
    }

    soundService.playClick();
    setLoading(true);
    setRedeemResult(null);

    try {
      const res = await onRedeem(clean);
      if (res.success) {
        soundService.playCoin();
        setRedeemResult({ type: 'success', text: res.message });
        setRedeemInput('');
        setTimeout(() => {
          onClose();
        }, 2200);
      } else {
        soundService.playError();
        setRedeemResult({ type: 'error', text: res.message });
      }
    } catch (err: any) {
      soundService.playError();
      setRedeemResult({ type: 'error', text: err?.message || 'Invalid redemption code.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-rose-950 via-purple-950 to-indigo-950 border border-pink-500/50 rounded-[32px] p-6 w-full max-w-sm text-center relative shadow-2xl shadow-pink-900/50 text-white overflow-hidden">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-300 hover:text-white bg-slate-800/80 p-1.5 rounded-full z-20"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title Header */}
        <div className="py-2 space-y-4">
          <div className="w-16 h-16 bg-gradient-to-tr from-amber-400 via-rose-500 to-pink-600 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-rose-500/40 text-2xl animate-pulse">
            🧧
          </div>

          <div>
            <h3 className="text-2xl font-black text-white tracking-wide">RESCUE PRESENTS</h3>
            <p className="text-xs text-purple-200 mt-1">Enter your admin-generated redemption code to claim your cash reward.</p>
          </div>

          <div className="bg-gradient-to-b from-[#f24244] via-[#e53436] to-[#cd2426] rounded-3xl p-5 shadow-2xl border-2 border-red-400 relative space-y-4">
            <h4 className="text-lg font-extrabold text-white tracking-wide text-center drop-shadow-md">
              Redemption Code
            </h4>

            <form onSubmit={handleConfirmCode} className="space-y-3">
              {/* Curved Cream Input Box */}
              <div className="bg-[#fff8e3] rounded-2xl p-3 shadow-inner border-2 border-[#ffd375] relative">
                <input
                  type="text"
                  value={redeemInput}
                  onChange={(e) => {
                    setRedeemInput(e.target.value);
                    if (redeemResult) setRedeemResult(null);
                  }}
                  placeholder="Enter Code (e.g. DANGOTE5000)"
                  className="w-full bg-transparent text-center text-sm font-extrabold text-slate-900 placeholder-slate-400 focus:outline-none tracking-widest font-mono uppercase"
                  autoFocus
                />

                {/* Status Banner */}
                {redeemResult && (
                  <div
                    className={`mt-2 p-2 rounded-xl text-xs font-bold text-center flex items-center justify-center gap-1.5 shadow-sm ${
                      redeemResult.type === 'success'
                        ? 'bg-emerald-500/20 text-emerald-950 border border-emerald-400'
                        : 'bg-black/90 text-amber-200 border border-rose-400'
                    }`}
                  >
                    {redeemResult.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />
                    )}
                    <span>{redeemResult.text}</span>
                  </div>
                )}
              </div>

              {/* Confirm Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-gradient-to-r from-[#ffe478] via-[#ffd852] to-[#fec832] hover:from-[#ffe88a] hover:to-[#ffd145] text-[#8e191a] font-extrabold text-base rounded-full shadow-xl border border-amber-200 transition active:scale-95 tracking-wide disabled:opacity-50"
              >
                {loading ? 'Verifying Code...' : 'Confirm Redemption'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}


