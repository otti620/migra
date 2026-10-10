import React, { useState } from 'react';
import { Phone, Lock, Eye, EyeOff, Check, AlertCircle, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveScreen } from '../types';
import { firebaseLogin } from '../lib/firestoreService';
import { soundService } from '../utils/audioService';
import { validatePhone, validatePassword } from '../utils/validators';
import { TimesSquareDavidoBackground } from './TimesSquareDavidoBackground';

interface LoginScreenProps {
  onLogin: (phone: string) => void;
  onNavigate: (screen: ActiveScreen) => void;
}

export function LoginScreen({ onLogin, onNavigate }: LoginScreenProps) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [saveAccount, setSaveAccount] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const triggerToast = (msg: string, isError = true) => {
    setToastMessage(msg);
    if (isError) {
      soundService.playError();
    } else {
      soundService.playSuccess();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

    setToastMessage('');
    setLoading(true);
    soundService.playClick();

    const clean = phoneVal.cleanPhone;
    try {
      await firebaseLogin(clean, password);
      soundService.playSuccess();
      onLogin(clean);
    } catch (err: any) {
      const errMsg = err?.message || 'Login failed. Please verify your phone number and password.';
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
      <div className="relative z-10 w-full px-5 pb-8 pt-2">
        <div className="bg-black/30 backdrop-blur-[2px] border border-white/20 rounded-3xl p-5 shadow-2xl space-y-3.5">
          <div className="text-center pb-0.5">
            <h2 className="text-xl font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] tracking-wide">
              Account Log In
            </h2>
            <p className="text-xs text-amber-300 font-bold drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)]">
              Dangote Petroleum Refinery Shareholder Portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Phone Field */}
            <div className="flex items-center bg-black/40 border border-white/30 rounded-2xl px-4 py-3.5 focus-within:border-amber-400 focus-within:bg-black/60 transition shadow-inner">
              <Phone className="w-5 h-5 text-amber-400 shrink-0 mr-3" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Phone number (e.g. 08012345678)"
                className="w-full bg-transparent text-sm text-white placeholder-slate-300 focus:outline-none font-semibold"
              />
            </div>

            {/* Password Field */}
            <div className="flex items-center bg-black/40 border border-white/30 rounded-2xl px-4 py-3.5 focus-within:border-amber-400 focus-within:bg-black/60 transition shadow-inner">
              <Lock className="w-5 h-5 text-amber-400 shrink-0 mr-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-transparent text-sm text-white placeholder-slate-300 focus:outline-none font-semibold"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-300 hover:text-white transition ml-2 p-1"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            {/* Error / Toast Banner */}
            <AnimatePresence>
              {toastMessage && (
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-red-900/90 border border-red-500 rounded-xl p-2.5 text-center shadow-lg"
                >
                  <div className="text-xs font-bold text-white flex flex-col items-center justify-center gap-1.5">
                    <div className="flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4 text-red-300 shrink-0" />
                      <span>{toastMessage}</span>
                    </div>
                    {toastMessage.toLowerCase().includes('register') && (
                      <button
                        type="button"
                        onClick={() => {
                          soundService.playClick();
                          onNavigate('signup');
                        }}
                        className="bg-amber-400 text-black text-xs font-black px-3.5 py-1 rounded-full shadow hover:bg-amber-300 transition mt-0.5 active:scale-95"
                      >
                        Register an Account Now
                      </button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Remember Account */}
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    soundService.playClick();
                    setSaveAccount(!saveAccount);
                  }}
                  className={`w-4 h-4 rounded flex items-center justify-center transition border ${
                    saveAccount 
                      ? 'bg-amber-400 border-amber-300 text-slate-950' 
                      : 'bg-black/50 border-white/40 text-transparent'
                  }`}
                >
                  <Check className="w-3 h-3 stroke-[3]" />
                </button>
                <span className="text-xs text-white font-medium drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">Remember account</span>
              </div>
            </div>

            {/* Log In Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-sm rounded-full shadow-xl transition transform active:scale-[0.98] disabled:opacity-60 mt-2"
            >
              Log In
            </button>
          </form>

          {/* Registration Link */}
          <div className="text-center pt-2 border-t border-white/15">
            <p className="text-xs text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)]">
              Don't have an account?{' '}
              <button
                onClick={() => {
                  soundService.playClick();
                  onNavigate('signup');
                }}
                className="text-amber-300 font-black hover:underline ml-1"
              >
                Register here
              </button>
            </p>
          </div>
        </div>
      </div>

      {/* Loading Modal */}
      <AnimatePresence>
        {loading && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-black/80 border border-white/20 rounded-3xl p-6 w-36 h-36 flex flex-col items-center justify-center gap-3 shadow-2xl text-center"
            >
              <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
              <span className="text-xs font-bold text-white">Connecting...</span>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
