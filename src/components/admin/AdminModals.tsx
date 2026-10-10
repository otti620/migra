import React, { useState } from 'react';
import { DollarSign, XCircle, Gift, Megaphone, Package, ShieldCheck } from 'lucide-react';
import { User, Product, PendingWithdrawalReq } from '../../types';

interface QuickCreditModalProps {
  isOpen: boolean;
  onClose: () => void;
  allUsers: User[];
  onCreditUser: (phone: string, amount: number) => void;
}

export const QuickCreditModal: React.FC<QuickCreditModalProps> = ({
  isOpen,
  onClose,
  allUsers,
  onCreditUser
}) => {
  const [targetPhone, setTargetPhone] = useState(allUsers[0]?.phone || '');
  const [amount, setAmount] = useState('20000');
  const [isDeduct, setIsDeduct] = useState(false);

  const uniqueUsersList = React.useMemo(() => {
    const map = new Map<string, User>();
    for (const u of allUsers) {
      if (!u) continue;
      const key = (u.phone || u.id || '').replace(/[^0-9]/g, '');
      if (!key) continue;
      if (!map.has(key)) {
        map.set(key, u);
      }
    }
    return Array.from(map.values());
  }, [allUsers]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0 || !targetPhone) return;
    const finalAmount = isDeduct ? -val : val;
    onCreditUser(targetPhone, finalAmount);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-emerald-400" />
          <span>Quick Balance Adjustment</span>
        </h3>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Select User</label>
            <input
              type="text"
              list="user-list"
              value={targetPhone}
              onChange={(e) => setTargetPhone(e.target.value)}
              placeholder="Enter or select phone number"
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono text-xs"
            />
            <datalist id="user-list">
              {uniqueUsersList.map((u, idx) => (
                <option key={u.id ? `qc_u_${u.phone}_${u.id}_${idx}` : `qc_u_${u.phone}_${idx}`} value={u.phone}>
                  {u.phone} (Bal: ₦{(u.balance || 0).toLocaleString()})
                </option>
              ))}
            </datalist>
          </div>

          <div>
            <label className="text-[11px] font-bold text-slate-400 block mb-1">Amount (₦)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-white font-mono text-xs"
            />
          </div>

          <div className="flex items-center gap-4 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="creditType"
                checked={!isDeduct}
                onChange={() => setIsDeduct(false)}
                className="text-emerald-500"
              />
              <span className="font-bold text-emerald-400">+ Credit User</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="creditType"
                checked={isDeduct}
                onChange={() => setIsDeduct(true)}
                className="text-rose-500"
              />
              <span className="font-bold text-rose-400">- Deduct User</span>
            </label>
          </div>

          <div className="flex items-center justify-end gap-2 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-5 py-2 rounded-xl text-white font-black shadow-md ${
                isDeduct ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              {isDeduct ? 'Deduct Balance' : 'Credit Balance'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface RejectWithdrawalModalProps {
  target: PendingWithdrawalReq | null;
  onClose: () => void;
  onConfirmReject: (target: PendingWithdrawalReq, reason: string) => void;
}

export const RejectWithdrawalModal: React.FC<RejectWithdrawalModalProps> = ({
  target,
  onClose,
  onConfirmReject
}) => {
  const [reason, setReason] = useState('');

  if (!target) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <XCircle className="w-5 h-5 text-rose-400" />
          <span>Reject & Refund Withdrawal</span>
        </h3>

        <p className="text-xs text-slate-300">
          Rejecting this request will immediately refund ₦{target.amount.toLocaleString()} back to{' '}
          <b className="text-white">{target.userPhone}</b>'s balance.
        </p>

        <div>
          <label className="text-[11px] font-bold text-slate-400 block mb-1">Rejection Reason</label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Account name mismatch, invalid bank"
            className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirmReject(target, reason || 'Account details could not be verified')}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-black"
          >
            Confirm & Refund
          </button>
        </div>
      </div>
    </div>
  );
};
