import React, { useState } from 'react';
import { ArrowLeft, ShieldCheck, CheckCircle2, AlertCircle, Coins, Building2, ChevronDown, Check } from 'lucide-react';
import { ActiveScreen } from '../types';
import { validateUsdtWallet, validateBankAccount } from '../utils/validators';
import { soundService } from '../utils/audioService';
import { NIGERIAN_BANKS } from '../utils/currency';

interface BankAccountScreenProps {
  onNavigate: (screen: ActiveScreen) => void;
  onSaveBank: (bank: { 
    bankName: string; 
    accountNumber: string; 
    accountName: string;
    usdtAddress?: string;
    usdtNetwork?: string;
  }) => void;
  userBank?: { 
    bankName: string; 
    accountNumber: string; 
    accountName: string; 
    usdtAddress?: string; 
    usdtNetwork?: string;
  };
}

export function BankAccountScreen({ onNavigate, onSaveBank, userBank }: BankAccountScreenProps) {
  const isCurrentlyBank = !!(userBank?.accountNumber && userBank.accountNumber.length === 10 && !userBank.bankName?.includes('USDT'));
  const [payoutType, setPayoutType] = useState<'bank' | 'usdt'>(isCurrentlyBank ? 'bank' : 'usdt');
  
  // Traditional Bank States
  const [bankName, setBankName] = useState(
    userBank?.bankName && !userBank.bankName.includes('USDT') ? userBank.bankName : NIGERIAN_BANKS[0]
  );
  const [accountNumber, setAccountNumber] = useState(
    userBank?.accountNumber && userBank.accountNumber.length === 10 ? userBank.accountNumber : ''
  );
  const [accountName, setAccountName] = useState(userBank?.accountName || '');

  // USDT Wallet States
  const usdtNetwork = 'TRC20';
  const [usdtAddress, setUsdtAddress] = useState(
    userBank?.usdtAddress || (userBank?.accountNumber?.startsWith('T') ? userBank.accountNumber : '')
  );
  const [walletLabel, setWalletLabel] = useState(
    userBank?.bankName?.includes('USDT') ? userBank?.accountName || '' : ''
  );

  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    soundService.playClick();

    if (payoutType === 'bank') {
      const val = validateBankAccount({ bankName, accountNumber, accountName });
      if (!val.isValid) {
        setErrors(val.fieldErrors || { bankName: val.error });
        soundService.playError();
        return;
      }

      onSaveBank({
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        accountName: accountName.trim(),
        usdtAddress: userBank?.usdtAddress || usdtAddress.trim(),
        usdtNetwork: 'TRC20',
      });
    } else {
      const val = validateUsdtWallet({
        network: usdtNetwork,
        address: usdtAddress,
        walletName: walletLabel,
      });

      if (!val.isValid) {
        setErrors(val.fieldErrors || { address: val.error });
        soundService.playError();
        return;
      }

      onSaveBank({
        bankName: userBank?.bankName && !userBank.bankName.includes('USDT') ? userBank.bankName : `USDT (${usdtNetwork})`,
        accountNumber: userBank?.accountNumber && userBank.accountNumber.length === 10 ? userBank.accountNumber : usdtAddress.trim(),
        accountName: userBank?.accountName && !userBank.bankName?.includes('USDT') ? userBank.accountName : (walletLabel.trim() || 'USDT Wallet'),
        usdtAddress: usdtAddress.trim(),
        usdtNetwork: usdtNetwork,
      });
    }

    soundService.playSuccess();
    setSaved(true);
    setTimeout(() => {
      onNavigate('withdraw');
    }, 1200);
  };

  return (
    <div className="pb-24 pt-3 px-4 space-y-4 max-w-md mx-auto">
      <div className="flex items-center justify-between mb-2">
        <button 
          onClick={() => { soundService.playClick(); onNavigate('withdraw'); }} 
          className="w-9 h-9 rounded-full bg-[#18153b] border border-cyan-900 flex items-center justify-center text-slate-300 hover:text-white"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-base font-black text-white">Payout Method Settings</h2>
        <div className="w-9"></div>
      </div>

      {saved && (
        <div className="p-4 bg-emerald-950/80 border border-emerald-500 rounded-2xl text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" /> Payout details saved successfully!
        </div>
      )}

      {/* Mode Switcher */}
      <div className="grid grid-cols-2 gap-2 bg-[#0a1238] p-1.5 rounded-2xl border border-cyan-900/50">
        <button
          type="button"
          onClick={() => { soundService.playClick(); setPayoutType('bank'); setErrors({}); }}
          className={`py-3 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
            payoutType === 'bank'
              ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md border border-blue-400/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4 text-amber-300" />
          <span>Nigerian Bank (NGN)</span>
        </button>

        <button
          type="button"
          onClick={() => { soundService.playClick(); setPayoutType('usdt'); setErrors({}); }}
          className={`py-3 px-3 rounded-xl text-xs font-black transition flex items-center justify-center gap-2 ${
            payoutType === 'usdt'
              ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md border border-emerald-400/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Coins className="w-4 h-4 text-emerald-300" />
          <span>USDT (TRC20)</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-[#0b1739] border border-cyan-900/50 rounded-3xl p-6 shadow-xl space-y-4">
        {payoutType === 'bank' ? (
          <>
            {/* Bank Name Dropdown */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-cyan-300 block">Select Nigerian Bank <span className="text-amber-400">*</span></label>
              <div className="relative">
                <select
                  value={bankName}
                  onChange={(e) => setBankName(e.target.value)}
                  className="w-full bg-[#040c24] border border-cyan-900/60 focus:border-cyan-400 rounded-2xl py-3.5 px-4 text-xs font-bold text-white focus:outline-none appearance-none"
                >
                  {NIGERIAN_BANKS.map((bank) => (
                    <option key={bank} value={bank} className="bg-slate-900 text-white">
                      {bank}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Account Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-cyan-300 block">
                NUBAN Account Number (10 Digits) <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={accountNumber}
                onChange={(e) => {
                  setAccountNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 10));
                  if (errors.accountNumber) setErrors((prev) => ({ ...prev, accountNumber: undefined }));
                }}
                placeholder="10-digit NUBAN number"
                maxLength={10}
                className={`w-full bg-[#040c24] border ${
                  errors.accountNumber ? 'border-rose-500 ring-1 ring-rose-500/50' : 'border-cyan-900/60 focus:border-cyan-400'
                } rounded-2xl py-3.5 px-4 text-xs font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition duration-300`}
              />
              {errors.accountNumber && (
                <p className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.accountNumber}
                </p>
              )}
            </div>

            {/* Account Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-cyan-300 block">
                Account Holder Full Name <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={accountName}
                onChange={(e) => {
                  setAccountName(e.target.value);
                  if (errors.accountName) setErrors((prev) => ({ ...prev, accountName: undefined }));
                }}
                placeholder="Name as registered on bank account"
                className={`w-full bg-[#040c24] border ${
                  errors.accountName ? 'border-rose-500 ring-1 ring-rose-500/50' : 'border-cyan-900/60 focus:border-cyan-400'
                } rounded-2xl py-3.5 px-4 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition duration-300`}
              />
              {errors.accountName && (
                <p className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.accountName}
                </p>
              )}
            </div>
          </>
        ) : (
          <>
            {/* USDT Network Locked to TRC20 */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-cyan-300 block">USDT Payout Blockchain</label>
              <div className="bg-slate-950 p-3 rounded-2xl border border-cyan-800/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <span className="font-mono font-bold text-white text-xs">TRON (TRC20)</span>
                </div>
                <span className="text-[10px] font-black text-amber-300 bg-amber-950 px-2 py-0.5 rounded border border-amber-700/50">
                  STANDARD TRC20
                </span>
              </div>
            </div>

            {/* USDT Address Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-cyan-300 block">
                USDT Receiving Address (TRC20) <span className="text-amber-400">*</span>
              </label>
              <input
                type="text"
                required
                value={usdtAddress}
                onChange={(e) => {
                  setUsdtAddress(e.target.value.trim());
                  if (errors.address) setErrors((prev) => ({ ...prev, address: undefined }));
                }}
                placeholder="Starts with T (e.g. TXyz...)"
                className={`w-full bg-[#040c24] border ${
                  errors.address ? 'border-rose-500 ring-1 ring-rose-500/50' : 'border-cyan-900/60 focus:border-cyan-400'
                } rounded-2xl py-3.5 px-4 text-xs font-mono font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition duration-300`}
              />
              {errors.address && (
                <p className="text-[11px] font-semibold text-rose-400 flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errors.address}
                </p>
              )}
            </div>

            {/* Wallet Holder / Label */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-cyan-300 block">Wallet Owner Name / Label</label>
              <input
                type="text"
                value={walletLabel}
                onChange={(e) => setWalletLabel(e.target.value)}
                placeholder="e.g. My Binance USDT TRC20"
                className="w-full bg-[#040c24] border border-cyan-900/60 focus:border-cyan-400 rounded-2xl py-3.5 px-4 text-xs font-bold text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/30 transition duration-300"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/20 hover:opacity-95 transition flex items-center justify-center gap-2 mt-4"
        >
          <ShieldCheck className="w-5 h-5" /> 
          <span>Save {payoutType === 'bank' ? 'Nigerian Bank Details' : 'USDT TRC20 Address'}</span>
        </button>
      </form>
    </div>
  );
}
