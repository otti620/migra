import { useState, FormEvent } from 'react';
import { X, Lock, KeyRound, ShieldCheck, AlertCircle } from 'lucide-react';
import { validatePassword } from '../utils/validators';

interface ChangePasswordModalProps {
  onClose: () => void;
  onUpdatePassword: (newPass: string) => Promise<{ success: boolean; message: string }>;
}

export function ChangePasswordModal({ onClose, onUpdatePassword }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!newPassword) {
      setErrorMsg('Please enter a new password.');
      return;
    }

    const passValidation = validatePassword(newPassword);
    if (!passValidation.isValid) {
      setErrorMsg(passValidation.error);
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await onUpdatePassword(newPassword);
      if (res.success) {
        setSuccessMsg('Password changed successfully!');
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setErrorMsg(res.message);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to update password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-[#18153b] border border-purple-800/60 rounded-3xl w-full max-w-sm p-6 shadow-2xl relative space-y-5 text-white">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-purple-900/60 flex items-center justify-center text-purple-200 hover:text-white transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/30 border border-purple-500/40 flex items-center justify-center text-amber-400">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-black tracking-wide">Change Password</h3>
            <p className="text-xs text-purple-200/80">Secure your account with a new login password</p>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-rose-950/80 border border-rose-500/50 p-3 rounded-xl flex items-center gap-2 text-xs text-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="bg-emerald-950/80 border border-emerald-500/50 p-3 rounded-xl flex items-center gap-2 text-xs text-emerald-200">
            <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-purple-200 uppercase tracking-wider">New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-purple-400" />
              <input
                type="password"
                placeholder="At least 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-[#120f2b] border border-purple-900/60 rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder-purple-400/50 focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-black text-purple-200 uppercase tracking-wider">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-purple-400" />
              <input
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full bg-[#120f2b] border border-purple-900/60 rounded-2xl py-3 pl-10 pr-4 text-sm text-white placeholder-purple-400/50 focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-2"
          >
            {loading ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
