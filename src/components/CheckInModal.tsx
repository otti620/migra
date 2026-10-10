import { useState } from 'react';
import { X, CheckCircle2, Gift, Sparkles } from 'lucide-react';
import { soundService } from '../utils/audioService';

interface CheckInModalProps {
  onClose: () => void;
  onClaim: (amount: number) => void;
  lastCheckInDate?: string;
}

export function CheckInModal({ onClose, onClaim, lastCheckInDate }: CheckInModalProps) {
  const isAlreadyCheckedInToday = !!(
    lastCheckInDate && new Date(lastCheckInDate).toDateString() === new Date().toDateString()
  );

  const [checked, setChecked] = useState(isAlreadyCheckedInToday);
  const [claimedAmount, setClaimedAmount] = useState(0);

  const handleCheckIn = () => {
    if (checked || isAlreadyCheckedInToday) return;
    soundService.playClick();
    // Guaranteed daily check-in attendance dividend of ₦50 once per day
    const reward = 50;
    setClaimedAmount(reward);
    setChecked(true);
    soundService.playCoin();
    onClaim(reward);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-b from-indigo-950 via-purple-950 to-slate-950 border border-purple-500/40 rounded-3xl p-6 w-full max-w-sm text-center relative shadow-2xl shadow-purple-900/50">
        <button 
          onClick={() => { soundService.playClick(); onClose(); }}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800/60 p-1.5 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-16 h-16 bg-gradient-to-tr from-purple-600 to-pink-500 rounded-2xl mx-auto flex items-center justify-center shadow-lg shadow-purple-500/50 mb-4">
          <Gift className="w-8 h-8 text-white animate-bounce" />
        </div>

        <h3 className="text-xl font-bold text-white mb-1">Daily Attendance Check-In</h3>
        <p className="text-xs text-purple-200 mb-5">Check in daily once per calendar day to claim your guaranteed ₦50 dividend!</p>

        <div className="grid grid-cols-4 gap-2 mb-6">
          {[1, 2, 3, 4, 5, 6, 7].map((day) => (
            <div 
              key={day}
              className={`p-2.5 rounded-xl border flex flex-col items-center justify-center ${
                day === 1 && checked 
                  ? 'bg-emerald-900/40 border-emerald-500 text-emerald-300' 
                  : 'bg-purple-900/20 border-purple-800/50 text-purple-300'
              }`}
            >
              <span className="text-[9px] uppercase font-semibold text-purple-300/70">Day {day}</span>
              <span className="text-[10px] font-bold mt-1 text-amber-300">₦50</span>
              {day === 1 && checked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-1" />}
            </div>
          ))}
        </div>

        {!checked ? (
          <button
            onClick={handleCheckIn}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-bold text-xs rounded-2xl shadow-lg shadow-purple-600/40 hover:opacity-95 transition flex items-center justify-center gap-2 active:scale-98"
          >
            <Sparkles className="w-4 h-4" /> Check In Now (Claim ₦50 Daily Dividend)
          </button>
        ) : (
          <div className="p-3.5 bg-emerald-950/70 border border-emerald-500/40 rounded-2xl text-emerald-300 text-xs font-bold flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>
              {claimedAmount > 0
                ? `Successfully claimed ₦${claimedAmount} daily dividend!`
                : 'Already Checked In Today (Come back tomorrow)'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
