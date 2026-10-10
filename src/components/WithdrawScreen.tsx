import { useState } from 'react';
import { 
  ArrowLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  ShieldCheck, 
  X, 
  AlertCircle, 
  Calendar, 
  Percent, 
  CreditCard, 
  PlusCircle, 
  Clock, 
  ShoppingBag, 
  Coins, 
  Building2,
  ChevronDown,
  ShieldAlert,
  XCircle
} from 'lucide-react';
import { ActiveScreen, Order, PaymentConfig, Transaction, User } from '../types';
import { soundService } from '../utils/audioService';
import { validateWithdrawal, isWithdrawalScheduleValid, validateBankAccount, validateUsdtWallet, isFreeGiftProduct } from '../utils/validators';
import { NIGERIAN_BANKS } from '../utils/currency';

interface WithdrawScreenProps {
  userBalance: number;
  userBank?: { 
    bankName: string; 
    accountNumber: string; 
    accountName: string; 
    usdtAddress?: string; 
    usdtNetwork?: string;
  };
  userOrders?: Order[];
  transactions?: Transaction[];
  user?: User;
  isFrozen?: boolean;
  paymentConfig?: PaymentConfig;
  onNavigate: (screen: ActiveScreen) => void;
  onWithdraw: (
    amount: number, 
    payoutDestination?: string, 
    network?: string, 
    payoutMethod?: 'bank' | 'usdt',
    bankDetails?: { bankName: string; accountNumber: string; accountName: string }
  ) => void;
  onSaveBank?: (bank: { bankName: string; accountNumber: string; accountName: string; usdtAddress?: string; usdtNetwork?: string }) => void;
}

export function WithdrawScreen({ 
  userBalance, 
  userBank, 
  userOrders = [], 
  transactions = [],
  user,
  isFrozen, 
  paymentConfig, 
  onNavigate, 
  onWithdraw,
  onSaveBank
}: WithdrawScreenProps) {
  // Method selection: 'bank' (Nigerian Bank) or 'usdt' (Crypto TRC20)
  const [payoutMethod, setPayoutMethod] = useState<'bank' | 'usdt'>('bank');
  const [amount, setAmount] = useState('');
  const [showTips, setShowTips] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Inline bank binding states if not already bound
  const [showBankForm, setShowBankForm] = useState(false);
  const [selectedBank, setSelectedBank] = useState(userBank?.bankName || NIGERIAN_BANKS[0]);
  const [accountNum, setAccountNum] = useState(
    userBank?.accountNumber && userBank.accountNumber.length === 10 ? userBank.accountNumber : ''
  );
  const [accountHolder, setAccountHolder] = useState(userBank?.accountName || '');

  // Inline USDT binding states
  const [showUsdtForm, setShowUsdtForm] = useState(false);
  const [inputUsdtAddress, setInputUsdtAddress] = useState(
    userBank?.usdtAddress || (userBank?.accountNumber && userBank.accountNumber.startsWith('T') ? userBank.accountNumber : '')
  );

  const val = Number(amount) || 0;
  const fee = val > 0 ? val * 0.11 : 0;
  const netReceiveNaira = Math.max(0, val - fee);

  const exchangeRate = paymentConfig?.usdtNairaRate || 1500;
  const netUsdtReceive = (netReceiveNaira / exchangeRate).toFixed(2);

  // Mandatory withdrawal requirements: deposit made AND paid product purchased
  const hasDeposited = Boolean(
    user?.hasDeposited ||
    (user?.totalDeposits && user.totalDeposits > 0) ||
    user?.hasReferralDeposit ||
    transactions.some((t) => t.type === 'Recharge' && t.status === 'success')
  );

  const hasPurchasedPaidProduct = userOrders.some(
    (o) => (o.price > 0 || !isFreeGiftProduct(o)) && (o.status === 'active' || o.status === 'completed')
  );

  const hasMetWithdrawalRequirements = hasDeposited && hasPurchasedPaidProduct;

  // Check if current user has Nigerian bank bound
  const hasBoundBank = !!(
    userBank?.bankName && 
    !userBank.bankName.includes('USDT') && 
    userBank?.accountNumber && 
    userBank.accountNumber.length === 10
  );

  // Check if current user has USDT wallet bound
  const hasBoundUsdt = !!(
    userBank?.usdtAddress || 
    (userBank?.accountNumber && userBank.accountNumber.length > 20 && userBank.accountNumber.startsWith('T'))
  );

  const activeUsdtAddress = inputUsdtAddress || userBank?.usdtAddress || (userBank?.accountNumber?.startsWith('T') ? userBank.accountNumber : '');
  const activeBankName = userBank?.bankName || selectedBank || '';
  const activeAccountNum = accountNum || userBank?.accountNumber || '';
  const activeAccountHolder = accountHolder || userBank?.accountName || '';

  const triggerError = (msg: string) => {
    setErrorMsg(msg);
    soundService.playError();
  };

  const handleSaveInlineBank = () => {
    const valRes = validateBankAccount({
      bankName: activeBankName,
      accountNumber: activeAccountNum,
      accountName: activeAccountHolder
    });
    if (!valRes.isValid) {
      triggerError(valRes.error || 'Please provide valid 10-digit account details');
      return false;
    }
    if (onSaveBank) {
      onSaveBank({
        bankName: activeBankName,
        accountNumber: activeAccountNum,
        accountName: activeAccountHolder,
        usdtAddress: userBank?.usdtAddress,
        usdtNetwork: userBank?.usdtNetwork,
      });
    }
    setShowBankForm(false);
    return true;
  };

  const handleSaveInlineUsdt = () => {
    const valRes = validateUsdtWallet({
      network: 'TRC20',
      address: activeUsdtAddress,
      walletName: 'USDT TRC20 Wallet'
    });
    if (!valRes.isValid) {
      triggerError(valRes.error || 'Please provide a valid TRC20 address (starts with T)');
      return false;
    }
    if (onSaveBank) {
      onSaveBank({
        bankName: userBank?.bankName || 'USDT (TRC20)',
        accountNumber: userBank?.accountNumber || activeUsdtAddress,
        accountName: userBank?.accountName || 'USDT Wallet',
        usdtAddress: activeUsdtAddress,
        usdtNetwork: 'TRC20',
      });
    }
    setShowUsdtForm(false);
    return true;
  };

  const handleWithdrawSubmit = () => {
    setErrorMsg('');
    soundService.playClick();

    if (isFrozen) {
      triggerError('Account Frozen: Your withdrawal requests are temporarily frozen for security investigation.');
      return;
    }

    if (!hasDeposited) {
      triggerError('Mandatory Withdrawal Rule: You must make a deposit into your account before making a withdrawal.');
      return;
    }

    if (!hasPurchasedPaidProduct) {
      triggerError('Mandatory Withdrawal Rule: You must purchase an active share tranche before making a withdrawal.');
      return;
    }

    if (userBalance < 0) {
      triggerError('Withdrawal failed: Account has a negative balance.');
      return;
    }

    if (!val || val <= 0) {
      triggerError('Please enter a valid withdrawal amount.');
      return;
    }

    if (val < 1000) {
      triggerError('Minimum withdrawal amount is ₦1,000.');
      return;
    }

    if (val > userBalance) {
      triggerError('Insufficient balance. Your requested amount exceeds available funds.');
      return;
    }

    if (val % 10 !== 0) {
      triggerError('The withdrawal amount must be a whole number and a multiple of 10.');
      return;
    }

    // Schedule check
    const sched = isWithdrawalScheduleValid();
    if (!sched.isValid) {
      triggerError(sched.error || 'Operating hours are Monday to Friday, 10:00 AM to 5:00 PM.');
      return;
    }

    if (payoutMethod === 'bank') {
      if (!hasBoundBank && showBankForm) {
        const saved = handleSaveInlineBank();
        if (!saved) return;
      } else if (!hasBoundBank && !activeAccountNum) {
        setShowBankForm(true);
        triggerError('Please provide your Nigerian bank details below.');
        return;
      }

      soundService.playSuccess();
      onWithdraw(
        val, 
        activeAccountNum, 
        activeBankName, 
        'bank', 
        {
          bankName: activeBankName,
          accountNumber: activeAccountNum,
          accountName: activeAccountHolder
        }
      );
      setShowTips(true);
    } else {
      // USDT
      if (!hasBoundUsdt && showUsdtForm) {
        const saved = handleSaveInlineUsdt();
        if (!saved) return;
      } else if (!hasBoundUsdt && !activeUsdtAddress) {
        setShowUsdtForm(true);
        triggerError('Please provide your TRC20 USDT receiving address below.');
        return;
      }

      soundService.playSuccess();
      onWithdraw(
        val, 
        activeUsdtAddress, 
        'TRC20', 
        'usdt'
      );
      setShowTips(true);
    }
  };

  return (
    <div className="pb-24 pt-3 px-4 space-y-4 max-w-md mx-auto relative">
      {/* Top Header */}
      <div className="flex items-center justify-between mb-2">
        <button 
          onClick={() => { soundService.playClick(); onNavigate('home'); }} 
          className="w-9 h-9 rounded-full bg-[#18153b] border border-cyan-900 flex items-center justify-center text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-black text-white">Withdrawal Portal</h2>
        <button 
          onClick={() => { soundService.playClick(); setShowRuleModal(true); }} 
          className="text-xs text-cyan-300 font-bold bg-cyan-950/80 border border-cyan-500/30 px-3 py-1 rounded-full hover:bg-cyan-900 transition"
        >
          Rules
        </button>
      </div>

      {/* Schedule Window Status Badge */}
      {(() => {
        const sched = isWithdrawalScheduleValid();
        return (
          <div className={`p-3 rounded-2xl border flex items-center justify-between shadow-lg text-xs font-bold ${
            sched.isValid
              ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300'
              : 'bg-rose-950/80 border-rose-500/60 text-rose-300'
          }`}>
            <div className="flex items-center gap-2">
              <Clock className={`w-4 h-4 shrink-0 ${sched.isValid ? 'text-emerald-400 animate-pulse' : 'text-rose-400'}`} />
              <div>
                <span className="block text-[11px] opacity-80 uppercase tracking-wider font-extrabold">Payout Window</span>
                <span>{sched.isValid ? 'OPEN NOW (Mon-Fri 10:00 - 17:00)' : 'CLOSED NOW (Mon-Fri 10:00 - 17:00)'}</span>
              </div>
            </div>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
              sched.isValid ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'
            }`}>
              {sched.isValid ? 'Active' : 'Closed'}
            </span>
          </div>
        );
      })()}

      {/* Mandatory Withdrawal Requirement Status */}
      {!hasMetWithdrawalRequirements ? (
        <div className="p-3.5 rounded-2xl border border-amber-500/60 bg-gradient-to-br from-amber-950/80 via-slate-900 to-slate-950 text-amber-200 shadow-lg text-xs space-y-2.5">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
            <div>
              <span className="block text-[11px] uppercase tracking-wider font-extrabold text-amber-300">Mandatory Withdrawal Qualification</span>
              <p className="text-[11px] text-slate-300">Account holders must make a deposit and hold an active share tranche before withdrawals.</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-amber-500/20">
            <div className={`p-2 rounded-xl border flex flex-col justify-between ${
              hasDeposited ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold">1. Deposit</span>
                {hasDeposited ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
              </div>
              <span className="text-[10px] mt-1">{hasDeposited ? 'Completed' : 'Deposit Required'}</span>
              {!hasDeposited && (
                <button
                  type="button"
                  onClick={() => { soundService.playClick(); onNavigate('recharge'); }}
                  className="mt-1.5 py-1 px-2 bg-rose-500 hover:bg-rose-400 text-slate-950 rounded-lg text-[9px] font-black uppercase text-center"
                >
                  Deposit Now
                </button>
              )}
            </div>

            <div className={`p-2 rounded-xl border flex flex-col justify-between ${
              hasPurchasedPaidProduct ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-bold">2. Share Tranche</span>
                {hasPurchasedPaidProduct ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <XCircle className="w-3.5 h-3.5 text-rose-400" />}
              </div>
              <span className="text-[10px] mt-1">{hasPurchasedPaidProduct ? 'Active Tranche Held' : 'Tranche Required'}</span>
              {!hasPurchasedPaidProduct && (
                <button
                  type="button"
                  onClick={() => { soundService.playClick(); onNavigate('products'); }}
                  className="mt-1.5 py-1 px-2 bg-amber-400 hover:bg-amber-300 text-slate-950 rounded-lg text-[9px] font-black uppercase text-center"
                >
                  Subscribe Now
                </button>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="p-2.5 rounded-2xl border border-emerald-500/40 bg-emerald-950/40 text-emerald-300 flex items-center justify-between shadow-md text-xs font-bold">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="text-[11px]">Withdrawal Qualification Verified (Funded & Active Shareholder)</span>
          </div>
        </div>
      )}

      {/* WITHDRAWAL METHOD SELECTOR TABS: Nigerian Bank vs USDT */}
      <div className="space-y-2">
        <label className="text-xs font-black uppercase tracking-wider text-cyan-200 block px-1">
          Select Payout Destination
        </label>
        <div className="grid grid-cols-2 gap-2 bg-[#081333] p-1.5 rounded-2xl border border-blue-900/60">
          <button
            type="button"
            onClick={() => { soundService.playClick(); setPayoutMethod('bank'); setErrorMsg(''); }}
            className={`py-3 px-3 rounded-xl text-xs font-black transition flex flex-col items-center justify-center gap-1 ${
              payoutMethod === 'bank'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-900/50 border border-blue-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-amber-300" />
              <span>Nigerian Bank</span>
            </div>
            <span className="text-[10px] opacity-80 font-normal">Naira (₦) Payout</span>
          </button>

          <button
            type="button"
            onClick={() => { soundService.playClick(); setPayoutMethod('usdt'); setErrorMsg(''); }}
            className={`py-3 px-3 rounded-xl text-xs font-black transition flex flex-col items-center justify-center gap-1 ${
              payoutMethod === 'usdt'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-900/50 border border-emerald-400/40'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-emerald-300" />
              <span>USDT (TRC20)</span>
            </div>
            <span className="text-[10px] opacity-80 font-normal">Crypto Payout</span>
          </button>
        </div>
      </div>

      {/* METHOD DETAILS CARD */}
      {payoutMethod === 'bank' ? (
        /* Nigerian Bank Section */
        <div className="bg-[#0b1739] border border-blue-500/40 rounded-3xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-blue-900/50 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <Building2 className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-white">Direct Bank Wire (Nigeria)</span>
                <span className="text-[10px] text-blue-300 block">Instant clearing via NIP</span>
              </div>
            </div>
            <button
              onClick={() => setShowBankForm(!showBankForm)}
              className="text-[11px] font-bold text-cyan-300 hover:text-white bg-cyan-950 border border-cyan-700/60 px-2.5 py-1 rounded-full"
            >
              {showBankForm ? 'Cancel' : (hasBoundBank ? 'Change' : '+ Add Bank')}
            </button>
          </div>

          {!showBankForm && hasBoundBank ? (
            <div className="space-y-1 bg-slate-950/60 p-3 rounded-2xl border border-blue-900/40">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Bank:</span>
                <span className="font-black text-amber-300">{userBank?.bankName}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Account Number:</span>
                <span className="font-mono font-black text-white">{userBank?.accountNumber}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Account Name:</span>
                <span className="font-bold text-slate-200">{userBank?.accountName}</span>
              </div>
            </div>
          ) : showBankForm || !hasBoundBank ? (
            <div className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Select Bank</label>
                <div className="relative">
                  <select
                    value={activeBankName}
                    onChange={(e) => setSelectedBank(e.target.value)}
                    className="w-full bg-[#040c24] border border-blue-900/60 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-400 appearance-none"
                  >
                    {NIGERIAN_BANKS.map((b) => (
                      <option key={b} value={b} className="bg-slate-900 text-white">{b}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Account Number (10 Digits)</label>
                <input
                  type="text"
                  maxLength={10}
                  value={activeAccountNum}
                  onChange={(e) => setAccountNum(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                  placeholder="e.g. 0123456789"
                  className="w-full bg-[#040c24] border border-blue-900/60 rounded-xl p-2.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">Account Holder Full Name</label>
                <input
                  type="text"
                  value={activeAccountHolder}
                  onChange={(e) => setAccountHolder(e.target.value)}
                  placeholder="e.g. Aliko Dangote"
                  className="w-full bg-[#040c24] border border-blue-900/60 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveInlineBank}
                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black rounded-xl transition"
              >
                Save Bank Account
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        /* USDT Section */
        <div className="bg-[#0b1739] border border-emerald-500/40 rounded-3xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between border-b border-emerald-900/50 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <span className="text-xs font-black text-white">USDT Payout (TRC20)</span>
                <span className="text-[10px] text-emerald-300 block">Rate: 1 USDT = ₦{exchangeRate.toLocaleString()}</span>
              </div>
            </div>
            <button
              onClick={() => setShowUsdtForm(!showUsdtForm)}
              className="text-[11px] font-bold text-emerald-300 hover:text-white bg-emerald-950 border border-emerald-700/60 px-2.5 py-1 rounded-full"
            >
              {showUsdtForm ? 'Cancel' : (hasBoundUsdt ? 'Change' : '+ Add Wallet')}
            </button>
          </div>

          {!showUsdtForm && hasBoundUsdt ? (
            <div className="space-y-1 bg-slate-950/60 p-3 rounded-2xl border border-emerald-900/40">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400">Network:</span>
                <span className="font-mono font-black text-emerald-400">TRON (TRC20)</span>
              </div>
              <div className="flex justify-between items-start text-xs pt-1">
                <span className="text-slate-400">Address:</span>
                <span className="font-mono font-bold text-white break-all max-w-[220px] text-right">
                  {userBank?.usdtAddress || userBank?.accountNumber}
                </span>
              </div>
            </div>
          ) : showUsdtForm || !hasBoundUsdt ? (
            <div className="space-y-3 pt-1">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">
                  USDT TRC20 Receiving Address (starts with T)
                </label>
                <input
                  type="text"
                  value={activeUsdtAddress}
                  onChange={(e) => setInputUsdtAddress(e.target.value.trim())}
                  placeholder="e.g. TXyz..."
                  className="w-full bg-[#040c24] border border-emerald-900/60 rounded-xl p-2.5 text-xs font-mono font-bold text-white focus:outline-none focus:border-emerald-400"
                />
              </div>

              <button
                type="button"
                onClick={handleSaveInlineUsdt}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl transition"
              >
                Save USDT Address
              </button>
            </div>
          ) : null}
        </div>
      )}

      {/* Mandatory Requirements Status Box */}
      <div className={`rounded-3xl p-4.5 border space-y-2 text-xs shadow-xl ${
        hasMetWithdrawalRequirements 
          ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200' 
          : 'bg-[#0f172a] border-amber-500/40 text-amber-200'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-black">
            {hasMetWithdrawalRequirements ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            )}
            <span className={hasMetWithdrawalRequirements ? 'text-emerald-300' : 'text-amber-300'}>
              {hasMetWithdrawalRequirements ? 'Withdrawal Eligibility Unlocked' : 'Mandatory Withdrawal Criteria'}
            </span>
          </div>
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider ${
            hasMetWithdrawalRequirements ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
          }`}>
            {hasMetWithdrawalRequirements ? 'Eligible' : 'Action Required'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1 text-[11px]">
          <div className={`p-2 rounded-xl border flex items-center gap-2 ${
            hasDeposited 
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}>
            {hasDeposited ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <div>
              <span className="font-extrabold block text-white">1. Deposit Made</span>
              <span className="text-[10px] opacity-80">{hasDeposited ? 'Verified' : 'Deposit required'}</span>
            </div>
          </div>

          <div className={`p-2 rounded-xl border flex items-center gap-2 ${
            hasPurchasedPaidProduct 
              ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
              : 'bg-slate-900 border-slate-800 text-slate-400'
          }`}>
            {hasPurchasedPaidProduct ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            )}
            <div>
              <span className="font-extrabold block text-white">2. Share Purchased</span>
              <span className="text-[10px] opacity-80">{hasPurchasedPaidProduct ? 'Active product' : 'Purchase required'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Available Balance Box */}
      <div className="bg-[#0b1739] border border-cyan-900/50 rounded-3xl p-5 flex items-center justify-between shadow-xl">
        <div>
          <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">Available Withdrawable Balance</span>
          <h3 className="text-2xl font-black text-white mt-0.5">₦ {userBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h3>
          <span className="text-xs text-emerald-400 font-bold block mt-0.5">
            ≈ ${(userBalance / exchangeRate).toFixed(2)} USDT
          </span>
        </div>
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
          <ArrowUpRight className="w-7 h-7" />
        </div>
      </div>

      {/* Amount Input Card */}
      <div className="bg-[#071333] text-white border border-cyan-900/50 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex justify-between items-center">
          <h4 className="text-xs font-black text-cyan-200 uppercase tracking-wider">Withdrawal Amount</h4>
          <span className="text-[11px] font-extrabold text-cyan-300 bg-cyan-950 px-2.5 py-0.5 rounded-full border border-cyan-800/60">Min ₦1,000</span>
        </div>

        <div className="relative">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-2xl font-black text-cyan-400">₦</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              setErrorMsg('');
            }}
            placeholder="Minimum withdrawal ₦1,000"
            className="w-full bg-[#03091e] border border-cyan-900/60 rounded-full py-4 pl-12 pr-5 text-lg font-black text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 transition duration-300"
          />
        </div>

        {/* Quick Amount Buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[1000, 5000, 20000, 50000].map((preset) => (
            <button
              key={preset}
              type="button"
              onClick={() => { soundService.playClick(); setAmount(preset.toString()); setErrorMsg(''); }}
              className="py-1.5 px-2 bg-slate-900 hover:bg-slate-800 border border-cyan-900/40 text-[11px] font-bold rounded-xl text-cyan-200 transition"
            >
              ₦{preset.toLocaleString()}
            </button>
          ))}
        </div>

        <div className="flex justify-between text-xs font-bold text-cyan-300 px-1">
          <span>Balance: ₦ {userBalance.toLocaleString()}</span>
          <button 
            onClick={() => { soundService.playClick(); setAmount(userBalance.toString()); setErrorMsg(''); }} 
            className="text-emerald-400 font-extrabold hover:underline"
          >
            Withdraw All
          </button>
        </div>

        {/* Dynamic Calculation Breakdown */}
        {val > 0 && (
          <div className="bg-[#03091e] rounded-2xl p-3.5 border border-cyan-800/60 space-y-2 text-xs">
            <div className="flex justify-between text-slate-300 font-medium">
              <span>Gross Withdrawal:</span>
              <span className="font-bold text-white">₦{val.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-300 font-medium">
              <span className="flex items-center gap-1">Processing Fee (11%):</span>
              <span className="font-bold text-rose-400">- ₦{Math.round(fee).toLocaleString()}</span>
            </div>
            
            <div className="pt-2 border-t border-cyan-900/60 flex justify-between items-center text-sm font-black">
              <span className="text-white">
                {payoutMethod === 'bank' ? 'Net Credited to Nigerian Bank:' : 'Net Received in USDT:'}
              </span>
              <div className="text-right">
                <span className="text-emerald-400 block">
                  {payoutMethod === 'bank' 
                    ? `₦${Math.floor(netReceiveNaira).toLocaleString()}` 
                    : `${netUsdtReceive} USDT`}
                </span>
                {payoutMethod === 'usdt' && (
                  <span className="text-[10px] text-slate-400 block font-normal">
                    (≈ ₦{Math.floor(netReceiveNaira).toLocaleString()})
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {errorMsg && (
          <div className="bg-rose-950/80 border border-rose-500 rounded-2xl p-3 flex items-start gap-2.5 text-xs text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1 font-semibold">{errorMsg}</div>
            <button onClick={() => setErrorMsg('')} className="text-rose-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleWithdrawSubmit}
          className={`w-full py-4 text-slate-950 font-black text-sm rounded-full shadow-xl transition flex items-center justify-center gap-2 ${
            payoutMethod === 'bank'
              ? 'bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 shadow-cyan-500/25 hover:opacity-95'
              : 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 shadow-emerald-500/25 hover:opacity-95'
          }`}
        >
          <ShieldCheck className="w-5 h-5 text-slate-950" />
          <span>
            {payoutMethod === 'bank' 
              ? 'Confirm Withdrawal to Nigerian Bank' 
              : 'Confirm Withdrawal to USDT (TRC20)'}
          </span>
        </button>

        {/* Manage in Profile Link */}
        <div className="text-center pt-1">
          <button
            onClick={() => { soundService.playClick(); onNavigate('bank_account'); }}
            className="text-[11px] text-slate-400 hover:text-cyan-300 font-bold transition underline"
          >
            Manage Saved Nigerian Bank & USDT Accounts
          </button>
        </div>
      </div>

      {/* SUCCESS MODAL / TIPS POPUP */}
      {showTips && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1739] border border-emerald-500/60 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-scale-up text-white">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-lg font-black text-white">Withdrawal Submitted!</h3>
              <p className="text-xs text-slate-300">
                Your request of{' '}
                <strong className="text-emerald-400 font-black">
                  {payoutMethod === 'bank' ? `₦${val.toLocaleString()}` : `${netUsdtReceive} USDT (₦${val.toLocaleString()})`}
                </strong>{' '}
                has been queued for settlement via{' '}
                <strong className="text-amber-300">
                  {payoutMethod === 'bank' ? activeBankName : 'TRC20 USDT'}
                </strong>.
              </p>
            </div>
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Destination:</span>
                <span className="font-bold text-white">
                  {payoutMethod === 'bank' ? `${activeBankName} (${activeAccountNum})` : 'USDT TRC20'}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Processing Window:</span>
                <span className="font-bold text-emerald-400">10-60 Minutes (NIP / Chain)</span>
              </div>
            </div>
            <button
              onClick={() => {
                setShowTips(false);
                onNavigate('withdrawal_records');
              }}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-black text-xs rounded-xl shadow-lg"
            >
              View Withdrawal Records
            </button>
          </div>
        </div>
      )}

      {/* RULES MODAL */}
      {showRuleModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0b1739] border border-cyan-800 rounded-3xl p-6 max-w-sm w-full space-y-4 shadow-2xl animate-scale-up text-white">
            <div className="flex justify-between items-center border-b border-cyan-900 pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-black text-white">Withdrawal Guidelines</h3>
              </div>
              <button 
                onClick={() => setShowRuleModal(false)}
                className="w-7 h-7 rounded-full bg-slate-900 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-bold">1. Nigerian Bank Transfers:</strong>
                  Available to all licensed commercial & microfinance banks in Nigeria (Access, GTBank, Zenith, OPay, PalmPay, Kuda, etc.) via instant NIP.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Coins className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-bold">2. USDT Crypto (TRC20):</strong>
                  Payouts are converted at real-time rate (1 USDT = ₦{exchangeRate.toLocaleString()}) and dispatched via TRON blockchain to your TRC20 address.
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Percent className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-bold">3. 11% Withdrawal Fee Across Borders:</strong>
                  Standard settlement & clearing fee (11%) is strictly enforced across all channels (both Nigerian bank accounts and cross-border USDT TRC20 wallets).
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-bold">4. Operating Hours & Minimum Limit:</strong>
                  Monday through Friday, 10:00 AM to 5:00 PM. Minimum withdrawal is ₦1,000 (Maximum ₦1,000,000 per transaction).
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <ShoppingBag className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-bold">5. Mandatory Deposit & Share Purchase Rule:</strong>
                  To prevent fraudulent cashouts, account holders must deposit funds and purchase at least one active share tranche before requesting any withdrawal.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowRuleModal(false)}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-xs rounded-xl shadow-lg"
            >
              I Understand
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
