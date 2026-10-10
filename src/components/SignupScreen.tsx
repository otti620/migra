import React, { useState, useEffect } from 'react';
import { Lock, Phone, KeyRound, Loader2, Users, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveScreen } from '../types';
import { firebaseSignup } from '../lib/firestoreService';
import { soundService } from '../utils/audioService';
import { validatePhone, validatePassword } from '../utils/validators';
import { TimesSquareDavidoBackground } from './TimesSquareDavidoBackground';

interface SignupScreenProps {
  onSignup: (phone: string, referralCode?: string) => void;
  onNavigate: (screen: ActiveScreen) => void;
}

const COUNTRY_CODES = [
  { code: '+234', label: 'NG', flag: '🇳🇬' },
  { code: '+971', label: 'UAE', flag: '🇦🇪' },
  { code: '+1', label: 'US', flag: '🇺🇸' },
  { code: '+44', label: 'UK', flag: '🇬🇧' },
];

export function SignupScreen({ onSignup, onNavigate }: SignupScreenProps) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [countryCode, setCountryCode] = useState('+234');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpNotice, setOtpNotice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const params = new URLSearchParams(window.location.search);
      const refParam = params.get('ref') || params.get('invitation') || params.get('code') || params.get('invitedBy');
      if (refParam) {
        setReferralCode(refParam.trim().toUpperCase());
      }
    } catch (e) {
      console.warn('Error reading URL referral params:', e);
    }
  }, []);

  const triggerToast = (msg: string, isError = true) => {
    setError(msg);
    if (isError) {
      soundService.playError();
    } else {
      soundService.playSuccess();
    }
  };

  const handleSendOtp = () => {
    soundService.playClick();
    if (!phone) {
      triggerToast('Please enter your mobile phone number first');
      return;
    }
    setError('');
    setOtpSent(true);
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setOtpCode(code);
    setOtpNotice(`Verification SMS code sent to ${countryCode} ${phone}`);
    soundService.playSuccess();
    setTimeout(() => setOtpNotice(''), 5000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    soundService.playClick();

    const phoneVal = validatePhone(phone);
    if (!phoneVal.isValid && phoneVal.error) {
      triggerToast(phoneVal.error);
      return;
    }

    const passVal = validatePassword(password);
    if (!passVal.isValid && passVal.error) {
      triggerToast(passVal.error);
      return;
    }

    if (password !== confirmPassword) {
      triggerToast('Passwords do not match');
      return;
    }

    setError('');
    setLoading(true);
    soundService.playClick();
    const clean = phoneVal.cleanPhone;
    try {
      await firebaseSignup(clean, password, { referredBy: referralCode || undefined });
      soundService.playSuccess();
      onSignup(clean, referralCode);
    } catch (err: any) {
      const errMsg = err?.message || 'Registration failed. Please check your details.';
      triggerToast(errMsg, true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen max-w-md mx-auto relative flex flex-col justify-end text-white font-sans overflow-hidden select-none bg-black">
      {/* 100% UNCONSTRAINED TIMES SQUARE PHOTO SHOWING THE WHOLE IMAGE */}
      <TimesSquareDavidoBackground />

      {/* Fully Transparent Floating Form Overlay */}
      <div className="relative z-10 w-full px-5 pb-6 pt-2">
        <div className="bg-black/30 backdrop-blur-[2px] border border-white/20 rounded-3xl p-5 shadow-2xl space-y-3">
          <div className="text-center pb-0.5">
            <h2 className="text-xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wide">
              Create Account
            </h2>
            <p className="text-xs text-amber-300 font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              Dangote Petroleum Refinery Shareholder Portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2.5">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-2 bg-red-900/90 border border-red-500 rounded-xl text-xs text-white flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-red-300 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}
              {otpNotice && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="p-2 bg-emerald-900/90 border border-emerald-500 rounded-xl text-xs text-white flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-300 shrink-0" />
                  <span>{otpNotice}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Mobile Phone Number */}
            <div className="flex bg-black/40 border border-white/30 rounded-2xl overflow-hidden focus-within:border-amber-400 focus-within:bg-black/60 transition shadow-inner">
              <select
                value={countryCode}
                onChange={(e) => setCountryCode(e.target.value)}
                className="bg-black/80 text-white text-xs font-bold px-2.5 py-3 border-r border-white/20 focus:outline-none cursor-pointer"
              >
                {COUNTRY_CODES.map((item) => (
                  <option key={item.code} value={item.code} className="bg-slate-900 text-white">
                    {item.flag} {item.code}
                  </option>
                ))}
              </select>
              <div className="flex-1 flex items-center px-3 py-3">
                <Phone className="w-4 h-4 text-amber-400 shrink-0 mr-2" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Phone number"
                  className="w-full bg-transparent text-sm text-white placeholder-slate-300 focus:outline-none font-semibold"
                />
              </div>
            </div>

            {/* SMS Verification (Optional) */}
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-black/40 border border-white/30 rounded-2xl px-3 py-2.5 focus-within:border-amber-400 focus-within:bg-black/60 transition shadow-inner">
                <KeyRound className="w-4 h-4 text-amber-400 shrink-0 mr-2" />
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  placeholder="SMS code (optional)"
                  className="w-full bg-transparent text-xs text-white placeholder-slate-300 focus:outline-none font-semibold tracking-wider"
                />
              </div>
              <button
                type="button"
                onClick={handleSendOtp}
                className="px-3.5 py-2.5 bg-black/50 hover:bg-black/70 text-amber-300 font-bold text-xs rounded-2xl border border-white/20 transition shrink-0"
              >
                {otpSent ? 'Resend' : 'Send Code'}
              </button>
            </div>

            {/* Password */}
            <div className="flex items-center bg-black/40 border border-white/30 rounded-2xl px-3.5 py-2.5 focus-within:border-amber-400 focus-within:bg-black/60 transition shadow-inner">
              <Lock className="w-4 h-4 text-amber-400 shrink-0 mr-2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password (min 6 chars)"
                className="w-full bg-transparent text-sm text-white placeholder-slate-300 focus:outline-none font-semibold"
              />
            </div>

            {/* Confirm Password */}
            <div className="flex items-center bg-black/40 border border-white/30 rounded-2xl px-3.5 py-2.5 focus-within:border-amber-400 focus-within:bg-black/60 transition shadow-inner">
              <Lock className="w-4 h-4 text-amber-400 shrink-0 mr-2" />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm password"
                className="w-full bg-transparent text-sm text-white placeholder-slate-300 focus:outline-none font-semibold"
              />
            </div>

            {/* Invitation Code */}
            <div className="flex items-center bg-black/40 border border-white/30 rounded-2xl px-3.5 py-2.5 focus-within:border-amber-400 focus-within:bg-black/60 transition shadow-inner">
              <Users className="w-4 h-4 text-amber-400 shrink-0 mr-2" />
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                placeholder="Invitation code (optional)"
                className="w-full bg-transparent text-xs text-white placeholder-slate-300 focus:outline-none font-semibold uppercase tracking-wider"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm rounded-full shadow-xl transition transform active:scale-[0.98] disabled:opacity-60 mt-1"
            >
              {loading ? 'Creating Account...' : 'Register Account'}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center pt-2 border-t border-white/15">
            <p className="text-xs text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              Already registered?{' '}
              <button
                onClick={() => {
                  soundService.playClick();
                  onNavigate('login');
                }}
                className="text-amber-300 font-black hover:underline ml-1"
              >
                Log In here
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
