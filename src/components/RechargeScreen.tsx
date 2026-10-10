import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, Copy, ShieldCheck, Clock, CheckCircle2, AlertCircle, RefreshCw, 
  Sparkles, Check, DollarSign, QrCode, Coins, Building2, CreditCard, ArrowRight,
  ChevronRight, Wallet, Info
} from 'lucide-react';
import { ActiveScreen, PaymentConfig } from '../types';
import { soundService } from '../utils/audioService';

interface RechargeScreenProps {
  onNavigate: (screen: ActiveScreen) => void;
  onRecharge: (
    amount: number, 
    paymentMethod: string, 
    senderAddressOrBank?: string, 
    senderNameOrTxHash?: string, 
    assignedAccount?: string,
    usdtDetails?: { usdtAmount: number; network: string; txHash: string; usdtAddress: string },
    currency?: 'NGN' | 'USDT'
  ) => void;
  paymentConfig?: PaymentConfig;
}

export function RechargeScreen({ onNavigate, onRecharge, paymentConfig }: RechargeScreenProps) {
  // Deposit Currency Option: 'NGN' (Naira) or 'USDT' (US Dollars)
  const [depositCurrency, setDepositCurrency] = useState<'NGN' | 'USDT'>('NGN');

  // Steps: 'amount' | 'checkout' | 'verify' | 'submitted'
  const [step, setStep] = useState<'amount' | 'checkout' | 'verify' | 'submitted'>('amount');

  // Currency exchange rate (1 USDT = NGN rate)
  const exchangeRate = paymentConfig?.usdtNairaRate || 1500;

  // --- NAIRA DEPOSIT STATE ---
  const nairaAmounts = [5000, 10000, 25000, 50000, 100000, 250000, 500000, 1000000];
  const [selectedNaira, setSelectedNaira] = useState<number>(25000);
  const [customNaira, setCustomNaira] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderBank, setSenderBank] = useState('');
  const [nairaSessionRef, setNairaSessionRef] = useState('');

  // Official Company Bank Account for Naira Deposits
  const officialBankName = paymentConfig?.nairaBankName || 'CARBON';
  const officialAccountNumber = paymentConfig?.nairaAccountNumber || '1581957640';
  const officialAccountName = paymentConfig?.nairaAccountName || 'LEVIATHAN HYPERMARKET';

  // --- USDT DOLLAR DEPOSIT STATE ---
  const usdtAmounts = [5, 10, 25, 50, 100, 250, 500, 1000];
  const [selectedUsdt, setSelectedUsdt] = useState<number>(25);
  const [customUsdt, setCustomUsdt] = useState('');
  const selectedNetwork = 'TRC20';
  const officialUsdtAddress = paymentConfig?.usdtAddress || 'TMfHpAqnR5VGDhy2u96QtFwA6GvCD9L23f';
  const [senderTxHash, setSenderTxHash] = useState('');
  const [senderUsdtAddress, setSenderUsdtAddress] = useState('');

  // Copy states
  const [copiedBankAcc, setCopiedBankAcc] = useState(false);
  const [copiedRef, setCopiedRef] = useState(false);
  const [copiedUsdtAddr, setCopiedUsdtAddr] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);

  // Common State
  const [errorMsg, setErrorMsg] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState<number>(899); // 14:59 mins
  const [isSessionUsed, setIsSessionUsed] = useState(false);

  // Session timer countdown
  useEffect(() => {
    if (step !== 'checkout') return;
    const interval = setInterval(() => {
      setTimerSeconds((prev) => {
        if (prev <= 1) {
          setIsSessionUsed(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Amount Getters
  const getFinalNairaAmount = () => {
    return customNaira ? Number(customNaira) : selectedNaira;
  };

  const getFinalUsdtAmount = () => {
    return customUsdt ? Number(customUsdt) : selectedUsdt;
  };

  const getNairaEquivalentFromUsdt = () => {
    return getFinalUsdtAmount() * exchangeRate;
  };

  const getUsdtEquivalentFromNaira = () => {
    return (getFinalNairaAmount() / exchangeRate).toFixed(2);
  };

  // Copy handlers
  const handleCopyBankAccount = () => {
    soundService.playClick();
    navigator.clipboard.writeText(officialAccountNumber);
    setCopiedBankAcc(true);
    setTimeout(() => setCopiedBankAcc(false), 2500);
  };

  const handleCopyRef = () => {
    soundService.playClick();
    navigator.clipboard.writeText(nairaSessionRef);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const handleCopyUsdtAddress = () => {
    soundService.playClick();
    navigator.clipboard.writeText(officialUsdtAddress);
    setCopiedUsdtAddr(true);
    setTimeout(() => setCopiedUsdtAddr(false), 2500);
  };

  const handleCopyAmount = () => {
    soundService.playClick();
    const txt = depositCurrency === 'NGN' 
      ? getFinalNairaAmount().toString() 
      : getFinalUsdtAmount().toString();
    navigator.clipboard.writeText(txt);
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2500);
  };

  // Initiate Checkout
  const handleInitiateCheckout = () => {
    setErrorMsg('');
    soundService.playClick();

    if (depositCurrency === 'NGN') {
      const amt = getFinalNairaAmount();
      const minNaira = paymentConfig?.minDepositNaira || 5000;
      if (isNaN(amt) || amt < minNaira) {
        setErrorMsg(`Minimum deposit is ₦${minNaira.toLocaleString()}.`);
        soundService.playError();
        return;
      }
    } else {
      const amt = getFinalUsdtAmount();
      const minUsdt = paymentConfig?.minDepositUsdt || 5;
      if (isNaN(amt) || amt < minUsdt) {
        setErrorMsg(`Minimum deposit is $${minUsdt} USDT.`);
        soundService.playError();
        return;
      }
    }

    setNairaSessionRef(`DP-${Math.floor(100000 + Math.random() * 900000)}`);
    setIsGenerating(true);
    setIsSessionUsed(false);
    setTimeout(() => {
      setIsGenerating(false);
      setTimerSeconds(899);
      setStep('checkout');
    }, 700);
  };

  // Submit Naira Transfer Proof
  const handleSubmitNairaProof = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    soundService.playClick();

    if (!senderName.trim()) {
      setErrorMsg('Please enter your Sender Account Name or Reference.');
      soundService.playError();
      return;
    }

    const amt = getFinalNairaAmount();
    const method = 'Naira Bank Transfer';
    const assignedStr = `${officialBankName}: ${officialAccountNumber} (${officialAccountName})`;

    onRecharge(
      amt,
      method,
      senderBank.trim() || 'Direct Bank Deposit',
      senderName.trim(),
      assignedStr,
      undefined,
      'NGN'
    );

    soundService.playSuccess();
    setStep('submitted');
  };

  // Submit USDT Crypto Proof
  const handleSubmitUsdtProof = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    soundService.playClick();

    const cleanTx = senderTxHash.trim();
    const cleanSenderAddr = senderUsdtAddress.trim();

    if (!cleanTx && !cleanSenderAddr) {
      setErrorMsg('Please provide your Transaction Hash (TxID) or Sender USDT Address.');
      soundService.playError();
      return;
    }

    const usdtAmt = getFinalUsdtAmount();
    const nairaAmt = getNairaEquivalentFromUsdt();
    const method = `USDT (${selectedNetwork})`;
    const assignedStr = `${selectedNetwork}: ${officialUsdtAddress}`;

    onRecharge(
      nairaAmt,
      method,
      cleanSenderAddr || `USDT Wallet (${selectedNetwork})`,
      cleanTx || 'TxID Submitted',
      assignedStr,
      {
        usdtAmount: usdtAmt,
        network: selectedNetwork,
        txHash: cleanTx,
        usdtAddress: cleanSenderAddr
      },
      'USDT'
    );

    soundService.playSuccess();
    setStep('submitted');
  };

  // Real dynamic QR code image URL for USDT
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(officialUsdtAddress)}&color=06122d&bgcolor=ffffff&qzone=1`;

  const popularBanks = [
    'OPay', 'Palmpay', 'Moniepoint', 'Kuda Bank', 'Zenith Bank', 
    'Access Bank', 'GTBank', 'First Bank', 'UBA', 'Fidelity Bank'
  ];

  return (
    <div className="pb-24 pt-3 px-4 max-w-md mx-auto space-y-4">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => {
            soundService.playClick();
            if (step === 'verify') setStep('checkout');
            else if (step === 'checkout') setStep('amount');
            else onNavigate('home');
          }} 
          className="w-9 h-9 rounded-full bg-[#18153b] border border-cyan-900/60 flex items-center justify-center text-slate-300 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="text-center">
          <h2 className="text-base font-black text-white tracking-wide flex items-center justify-center gap-1.5">
            {depositCurrency === 'NGN' ? (
              <CreditCard className="w-4 h-4 text-emerald-400" />
            ) : (
              <Coins className="w-4 h-4 text-emerald-400" />
            )}
            {step === 'amount' && (depositCurrency === 'NGN' ? 'Naira (NGN) Deposit' : 'USDT Dollar Deposit')}
            {step === 'checkout' && (depositCurrency === 'NGN' ? 'Bank Transfer Gateway' : 'USDT Crypto Gateway')}
            {step === 'verify' && 'Payment Verification'}
            {step === 'submitted' && 'Deposit Queued'}
          </h2>
          <span className="text-[10px] text-cyan-300 font-bold tracking-wider block">
            {step === 'amount' && 'Step 1: Select Currency & Amount'}
            {step === 'checkout' && (depositCurrency === 'NGN' ? 'Step 2: Transfer to Dedicated Account' : `Step 2: Send ${selectedNetwork} USDT`)}
            {step === 'verify' && 'Step 3: Enter Payment Proof'}
            {step === 'submitted' && 'Verification In Progress'}
          </span>
        </div>
        <button 
          onClick={() => { soundService.playClick(); onNavigate('bills'); }} 
          className="text-xs text-cyan-400 font-bold hover:underline"
        >
          History
        </button>
      </div>

      {/* DUAL CURRENCY TOGGLE TABS (NAIRA / DOLLARS-USDT) */}
      {step === 'amount' && (
        <div className="bg-[#0b1638] p-1.5 rounded-2xl border border-cyan-700/50 shadow-lg grid grid-cols-2 gap-1.5">
          <button
            type="button"
            onClick={() => {
              soundService.playClick();
              setDepositCurrency('NGN');
              setErrorMsg('');
            }}
            className={`py-3 px-4 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 ${
              depositCurrency === 'NGN'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-[1.01]'
                : 'text-slate-300 hover:text-white bg-slate-900/60'
            }`}
          >
            <span className="text-base">🇳🇬</span>
            <span>NAIRA (₦ NGN)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundService.playClick();
              setDepositCurrency('USDT');
              setErrorMsg('');
            }}
            className={`py-3 px-4 rounded-xl font-black text-xs transition flex items-center justify-center gap-2 ${
              depositCurrency === 'USDT'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/20 scale-[1.01]'
                : 'text-slate-300 hover:text-white bg-slate-900/60'
            }`}
          >
            <span className="text-base">🇺🇸</span>
            <span>DOLLARS (₮ USDT)</span>
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 1: AMOUNT SELECTION (NAIRA OR DOLLARS-USDT)         */}
      {/* ========================================================= */}
      {step === 'amount' && (
        <div className="space-y-4">
          {/* Header Card for Selected Currency */}
          {depositCurrency === 'NGN' ? (
            /* NAIRA HEADER BANNER */
            <div className="bg-gradient-to-br from-[#0c224e] via-[#091b3f] to-[#04112c] border border-cyan-600/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex items-center justify-between">
              <div className="absolute top-0 right-0 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    🇳🇬 Instant Bank Transfer
                  </span>
                </div>
                <span className="text-[10px] text-cyan-300 uppercase tracking-widest font-black block">
                  Deposit Amount
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <h3 className="text-3xl font-black text-white">
                    ₦{getFinalNairaAmount().toLocaleString()}
                  </h3>
                </div>
                <span className="text-xs text-amber-300 font-bold block mt-1">
                  ≈ ${getUsdtEquivalentFromNaira()} USD (Rate: ₦{exchangeRate.toLocaleString()} / $1)
                </span>
              </div>
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/30 shrink-0">
                <CreditCard className="w-7 h-7 font-black" />
              </div>
            </div>
          ) : (
            /* DOLLARS-USDT HEADER BANNER */
            <div className="bg-gradient-to-br from-[#0c224e] via-[#091b3f] to-[#04112c] border border-cyan-600/40 rounded-3xl p-5 shadow-2xl relative overflow-hidden flex items-center justify-between">
              <div className="absolute top-0 right-0 w-36 h-36 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none"></div>
              <div>
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                    🇺🇸 USDT ({selectedNetwork})
                  </span>
                </div>
                <span className="text-[10px] text-cyan-300 uppercase tracking-widest font-black block">
                  Deposit Amount
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-3xl font-black text-white">
                    ${getFinalUsdtAmount()} <span className="text-emerald-400 text-lg font-bold">USDT</span>
                  </h3>
                </div>
                <span className="text-xs text-amber-300 font-bold block mt-1">
                  ≈ ₦{getNairaEquivalentFromUsdt().toLocaleString()} NGN (Rate: ₦{exchangeRate.toLocaleString()} / $1)
                </span>
              </div>
              <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 shadow-lg shadow-emerald-500/30 shrink-0">
                <Coins className="w-7 h-7 font-black" />
              </div>
            </div>
          )}

          {/* Network Selection (TRON TRC20 ONLY) */}
          {depositCurrency === 'USDT' && (
            <div className="bg-[#0b1739] border border-amber-500/50 rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  BLOCKCHAIN NETWORK: TRON (TRC20) ONLY
                </span>
                <span className="text-[10px] text-emerald-400 font-black bg-emerald-950 px-2 py-0.5 rounded-full border border-emerald-800">
                  Zero Loss
                </span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span className="font-mono font-bold text-white">TRC20 (TRON Blockchain)</span>
                </div>
                <span className="text-[10px] font-black text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-600/40">
                  ONLY ALLOWED CHAIN
                </span>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-rose-950/90 border border-rose-500/60 rounded-2xl text-xs font-bold text-rose-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* QUICK PRESET GRID */}
          <div className="bg-[#0b1739] border border-blue-900/50 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black text-slate-200 uppercase tracking-wider">
                {depositCurrency === 'NGN' ? 'Select Naira Amount' : 'Select Dollar Amount'}
              </h4>
              <span className="text-[10px] text-cyan-400 font-bold">
                {depositCurrency === 'NGN' 
                  ? `Min: ₦${(paymentConfig?.minDepositNaira || 5000).toLocaleString()}`
                  : `Min: $${paymentConfig?.minDepositUsdt || 5} USDT`}
              </span>
            </div>

            {depositCurrency === 'NGN' ? (
              /* NAIRA PRESET BUTTONS */
              <div className="grid grid-cols-4 gap-2">
                {nairaAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => { 
                      soundService.playClick(); 
                      setSelectedNaira(amt); 
                      setCustomNaira(''); 
                    }}
                    className={`py-3 rounded-xl text-xs font-black border transition ${
                      selectedNaira === amt && !customNaira
                        ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white border-cyan-400 shadow-lg shadow-cyan-600/40 scale-[1.02]'
                        : 'bg-slate-950/80 text-slate-200 border-slate-800 hover:border-cyan-800'
                    }`}
                  >
                    {amt >= 1000000 ? `₦${amt / 1000000}M` : `₦${amt / 1000}k`}
                  </button>
                ))}
              </div>
            ) : (
              /* USDT PRESET BUTTONS */
              <div className="grid grid-cols-4 gap-2">
                {usdtAmounts.map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => { 
                      soundService.playClick(); 
                      setSelectedUsdt(amt); 
                      setCustomUsdt(''); 
                    }}
                    className={`py-3 rounded-xl text-xs font-black border transition ${
                      selectedUsdt === amt && !customUsdt
                        ? 'bg-gradient-to-tr from-cyan-600 to-blue-600 text-white border-cyan-400 shadow-lg shadow-cyan-600/40 scale-[1.02]'
                        : 'bg-slate-950/80 text-slate-200 border-slate-800 hover:border-cyan-800'
                    }`}
                  >
                    ${amt}
                  </button>
                ))}
              </div>
            )}

            {/* Custom Amount Input */}
            <div className="pt-1">
              <label className="text-[11px] font-bold text-slate-300 mb-1.5 block">
                {depositCurrency === 'NGN' ? 'Or Enter Custom Amount in Naira (₦)' : 'Or Enter Custom Amount in Dollars ($)'}
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={depositCurrency === 'NGN' ? customNaira : customUsdt}
                  onChange={(e) => {
                    if (depositCurrency === 'NGN') setCustomNaira(e.target.value);
                    else setCustomUsdt(e.target.value);
                  }}
                  placeholder={depositCurrency === 'NGN' ? 'e.g. 15000, 75000, 350000' : 'e.g. 50, 150, 750'}
                  className="w-full bg-slate-950 border border-cyan-900/60 rounded-2xl py-3.5 px-4 pr-16 text-sm font-bold text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-black text-emerald-400">
                  {depositCurrency === 'NGN' ? 'NGN' : 'USDT'}
                </span>
              </div>
            </div>
          </div>

          {/* Deposit Security Notice */}
          <div className="bg-slate-950/90 border border-emerald-900/40 rounded-2xl p-3.5 text-xs flex items-start gap-2.5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <span className="font-extrabold text-emerald-300 block">
                {depositCurrency === 'NGN' ? 'Instant Automatic Bank Clearance' : 'Instant Blockchain Clearance'}
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">
                {depositCurrency === 'NGN'
                  ? 'Transfer directly to the official Dangote Petroleum Refinery bank account. Your account is credited immediately upon payment clearance.'
                  : 'Send USDT directly to the official Dangote Petrochemicals crypto wallet. Your account balance is credited upon blockchain confirmation.'}
              </p>
            </div>
          </div>

          <button
            onClick={handleInitiateCheckout}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/25 hover:opacity-95 transition flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>
              {depositCurrency === 'NGN'
                ? `Proceed to Naira Bank Checkout (₦${getFinalNairaAmount().toLocaleString()}) →`
                : `Proceed to USDT Crypto Checkout ($${getFinalUsdtAmount()}) →`}
            </span>
          </button>
        </div>
      )}

      {/* GENERATING CHECKOUT LOADING */}
      {isGenerating && (
        <div className="bg-[#0b1426] border border-cyan-800/40 rounded-3xl p-8 shadow-2xl text-center space-y-4 my-6">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500 flex items-center justify-center text-slate-950 shadow-lg animate-pulse">
            <Sparkles className="w-7 h-7" />
          </div>
          <div>
            <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest block mb-1">
              DANGOTE PETROLEUM REFINERY RECHARGE GATEWAY
            </span>
            <h3 className="text-base font-black text-white">
              {depositCurrency === 'NGN' ? 'Opening Secure Bank Transfer Session...' : `Opening Secure ${selectedNetwork} Session...`}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              {depositCurrency === 'NGN' 
                ? <>Generating session for <strong className="text-emerald-400">₦{getFinalNairaAmount().toLocaleString()}</strong></>
                : <>Generating deposit address for <strong className="text-emerald-400">${getFinalUsdtAmount()} USDT</strong></>}
            </p>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 2: CHECKOUT SCREEN (NAIRA BANK OR USDT CRYPTO)       */}
      {/* ========================================================= */}
      {!isGenerating && step === 'checkout' && (
        <div className="bg-slate-900 border border-slate-700/80 rounded-3xl overflow-hidden shadow-2xl text-white space-y-0 relative">
          
          {/* Header Bar - Paystack / Flutterwave style */}
          <div className="bg-slate-950 px-5 py-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-black text-xs">
                {depositCurrency === 'NGN' ? '₦' : '₮'}
              </div>
              <div>
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  <span>{depositCurrency === 'NGN' ? 'Bank Transfer Checkout' : `USDT (${selectedNetwork})`}</span>
                  <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded-full font-mono">Secure</span>
                </div>
                <span className="text-[10px] text-slate-400">Leviathan Hypermarket</span>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs font-mono font-bold text-amber-400 flex items-center justify-end gap-1">
                <Clock className="w-3.5 h-3.5" /> {formatTimer(timerSeconds)}
              </div>
              <span className="text-[9px] text-slate-500">Expires in</span>
            </div>
          </div>

          <div className="p-5 space-y-4 relative">
            
            {/* Amount Banner */}
            <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">
                  Amount to Pay
                </span>
                <div className="flex items-baseline gap-2 mt-0.5">
                  <h3 className="text-2xl font-black text-emerald-400 font-mono">
                    {depositCurrency === 'NGN'
                      ? `₦${getFinalNairaAmount().toLocaleString()}`
                      : `${getFinalUsdtAmount()} USDT`}
                  </h3>
                  <button
                    onClick={handleCopyAmount}
                    className="text-[10px] font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/60 px-2 py-0.5 rounded hover:bg-cyan-900 transition"
                  >
                    {copiedAmount ? 'Copied' : 'Copy'}
                  </button>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 block">Gateway</span>
                <span className="text-xs font-black text-white bg-slate-800 px-2.5 py-1 rounded-lg inline-block mt-0.5">
                  {depositCurrency === 'NGN' ? 'Direct Bank Transfer' : selectedNetwork}
                </span>
              </div>
            </div>

            {/* ---------------------------------------------------- */}
            {/* NAIRA BANK DETAILS BOX                              */}
            {/* ---------------------------------------------------- */}
            {depositCurrency === 'NGN' ? (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3.5 shadow-inner">
                <div className="flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-800 pb-2 font-medium">
                  <span>Transfer to this account:</span>
                  <span className="text-emerald-400 font-bold">Auto-matches on transfer</span>
                </div>

                {/* Bank Name */}
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span className="text-xs text-slate-400">Bank Name</span>
                  <span className="text-xs font-black text-white uppercase">{officialBankName}</span>
                </div>

                {/* Account Number with 1-Click Copy */}
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span className="text-xs text-slate-400">Account Number</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-mono font-black text-amber-300 tracking-wider">
                      {officialAccountNumber}
                    </span>
                    <button
                      onClick={handleCopyBankAccount}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-lg shadow transition flex items-center gap-1 active:scale-95"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      {copiedBankAcc ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>

                {/* Account Name */}
                <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                  <span className="text-xs text-slate-400">Account Name</span>
                  <span className="text-xs font-bold text-slate-200">{officialAccountName}</span>
                </div>

                {/* Reference */}
                <div className="flex items-center justify-between py-1">
                  <span className="text-xs text-slate-400">Reference Note</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-400">{nairaSessionRef}</span>
                    <button
                      onClick={handleCopyRef}
                      className="px-2 py-0.5 bg-slate-900 border border-slate-700 text-slate-300 text-[10px] rounded hover:bg-slate-800"
                    >
                      {copiedRef ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p>
                    Transfer exact amount using your banking app. Click below once transfer is completed.
                  </p>
                </div>
              </div>
            ) : (
              /* ---------------------------------------------------- */
              /* USDT CRYPTO DETAILS BOX                             */
              /* ---------------------------------------------------- */
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-4">
                <div className="flex flex-col items-center justify-center space-y-2 py-1">
                  <div className="p-2.5 bg-white rounded-xl shadow">
                    <img 
                      src={qrCodeUrl} 
                      alt="USDT QR Code" 
                      className="w-36 h-36 object-contain"
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Scan QR or copy address</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-400 block font-bold">Deposit Address ({selectedNetwork})</span>
                  <div className="bg-slate-900 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono font-bold text-amber-300 break-all">
                      {officialUsdtAddress}
                    </span>
                    <button
                      onClick={handleCopyUsdtAddress}
                      className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-lg shrink-0 flex items-center gap-1"
                    >
                      <Copy className="w-3 h-3" />
                      {copiedUsdtAddr ? 'Copied!' : 'Copy'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <button
              onClick={() => {
                soundService.playClick();
                setStep('verify');
              }}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {depositCurrency === 'NGN' ? 'I Have Made This Bank Transfer' : 'I Have Transferred USDT'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* STEP 3: PROOF OF PAYMENT SUBMISSION                       */}
      {/* ========================================================= */}
      {step === 'verify' && (
        depositCurrency === 'NGN' ? (
          /* NAIRA PROOF FORM */
          <form onSubmit={handleSubmitNairaProof} className="space-y-4">
            <div className="bg-[#07183d] border border-cyan-700/60 rounded-3xl p-5 shadow-2xl space-y-4">
              <div>
                <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-widest block">
                  Verification Details
                </span>
                <h3 className="text-base font-black text-white mt-0.5">Submit Bank Transfer Proof</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your sender details so the admin system can verify and credit your balance immediately.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-950/90 border border-rose-500/60 rounded-2xl text-xs font-bold text-rose-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Sender Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 block">
                  Sender Account / Full Name <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Chukwuemeka Emmanuel or Session Ref"
                  className="w-full bg-slate-950 border border-cyan-900/60 rounded-2xl py-3.5 px-4 text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              {/* Sender Bank */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 block">
                  Sending Bank (Select or Type)
                </label>
                <input
                  type="text"
                  value={senderBank}
                  onChange={(e) => setSenderBank(e.target.value)}
                  placeholder="e.g. OPay, Palmpay, GTBank, Zenith, Kuda..."
                  className="w-full bg-slate-950 border border-cyan-900/60 rounded-2xl py-3.5 px-4 text-xs font-bold text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
                />

                {/* Bank shortcuts */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {popularBanks.slice(0, 6).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => setSenderBank(b)}
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition ${
                        senderBank === b
                          ? 'bg-cyan-600 text-slate-950 border-cyan-400'
                          : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-cyan-700'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>

              {/* Summary Box */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-cyan-900/40 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Transfer Amount:</span>
                  <strong className="text-emerald-400 font-black">₦{getFinalNairaAmount().toLocaleString()} NGN</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Destination:</span>
                  <strong className="text-slate-200 font-bold">{officialBankName} ({officialAccountNumber})</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Reference ID:</span>
                  <strong className="text-cyan-300 font-mono">{nairaSessionRef}</strong>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/30 hover:opacity-95 transition flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Confirm & Submit Naira Deposit</span>
            </button>
          </form>
        ) : (
          /* USDT PROOF FORM */
          <form onSubmit={handleSubmitUsdtProof} className="space-y-4">
            <div className="bg-[#07183d] border border-cyan-700/60 rounded-3xl p-5 shadow-2xl space-y-4">
              <div>
                <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-widest block">
                  Verification Details
                </span>
                <h3 className="text-base font-black text-white mt-0.5">Submit Transaction Hash (TxID)</h3>
                <p className="text-xs text-slate-400 mt-1">
                  Enter your blockchain Transaction Hash (TxID) or Sender Wallet Address so admin can verify and credit your account immediately.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-950/90 border border-rose-500/60 rounded-2xl text-xs font-bold text-rose-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* TxID Hash Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 block">
                  Transaction Hash / TxID <span className="text-amber-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={senderTxHash}
                  onChange={(e) => setSenderTxHash(e.target.value)}
                  placeholder="e.g. 7f8a9e1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f..."
                  className="w-full bg-slate-950 border border-cyan-900/60 rounded-2xl py-3.5 px-4 text-xs font-mono font-bold text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              {/* Sender Wallet Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-200 block">
                  Your Sender USDT Wallet Address (Optional)
                </label>
                <input
                  type="text"
                  value={senderUsdtAddress}
                  onChange={(e) => setSenderUsdtAddress(e.target.value)}
                  placeholder={`e.g. ${selectedNetwork === 'TRC20' ? 'TX...' : '0x...'}`}
                  className="w-full bg-slate-950 border border-cyan-900/60 rounded-2xl py-3.5 px-4 text-xs font-mono font-bold text-white placeholder-slate-600 focus:outline-none focus:border-cyan-400 transition"
                />
              </div>

              {/* Summary Box */}
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-cyan-900/40 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-400">
                  <span>Deposited Amount:</span>
                  <strong className="text-emerald-400 font-black">${getFinalUsdtAmount()} USDT</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Account Balance Credit:</span>
                  <strong className="text-amber-300 font-black">₦{getNairaEquivalentFromUsdt().toLocaleString()} NGN</strong>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Network:</span>
                  <strong className="text-slate-200 font-bold">USDT ({selectedNetwork})</strong>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/30 hover:opacity-95 transition flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Confirm & Submit Deposit TxID</span>
            </button>
          </form>
        )
      )}

      {/* ========================================================= */}
      {/* STEP 4: SUBMITTED NOTICE                                  */}
      {/* ========================================================= */}
      {step === 'submitted' && (
        <div className="bg-gradient-to-b from-[#081e4a] via-[#051535] to-[#020b1f] border border-cyan-700/60 rounded-3xl p-6 shadow-2xl text-center space-y-4">
          <div className="relative w-16 h-16 mx-auto">
            <div className="relative w-16 h-16 bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 rounded-2xl flex items-center justify-center text-slate-950 shadow-xl">
              <RefreshCw className="w-8 h-8 animate-spin" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-950 border border-emerald-500/40 text-emerald-300 text-[10px] font-black uppercase tracking-wider mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Payment Verification Active
            </div>
            <h3 className="text-lg font-black text-white">
              {depositCurrency === 'NGN' ? 'Naira Deposit Queued' : 'USDT Crypto Deposit Queued'}
            </h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">
              {depositCurrency === 'NGN' ? (
                <>Queued deposit of <strong className="text-emerald-400 font-black">₦{getFinalNairaAmount().toLocaleString()} NGN</strong> via Bank Transfer.</>
              ) : (
                <>Queued deposit of <strong className="text-emerald-400 font-black">${getFinalUsdtAmount()} USDT</strong> (₦{getNairaEquivalentFromUsdt().toLocaleString()}).</>
              )}
            </p>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-cyan-900/60 space-y-2 text-left">
            <div className="flex justify-between items-center text-[11px]">
              <span className="text-slate-400 font-mono font-bold truncate max-w-[200px]">
                {depositCurrency === 'NGN' ? `Sender: ${senderName}` : `TxID: ${senderTxHash || 'Submitted'}`}
              </span>
              <span className="text-emerald-400 font-black animate-pulse">Syncing...</span>
            </div>
            <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-cyan-950">
              <div className="bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 h-full w-[95%] rounded-full animate-pulse"></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              onClick={() => { soundService.playClick(); onNavigate('bills'); }}
              className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-2xl transition"
            >
              View History
            </button>
            <button
              onClick={() => { soundService.playClick(); onNavigate('home'); }}
              className="py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:opacity-95 text-slate-950 font-bold text-xs rounded-2xl shadow-lg transition"
            >
              Return Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
