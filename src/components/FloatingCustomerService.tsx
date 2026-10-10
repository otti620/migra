import React, { useState } from 'react';
import { 
  Headphones, 
  Send, 
  MessageCircle, 
  ExternalLink, 
  X, 
  ShieldCheck, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  HelpCircle,
  PhoneCall
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveScreen } from '../types';
import { soundService } from '../utils/audioService';

interface FloatingCustomerServiceProps {
  currentScreen: ActiveScreen;
  onNavigate: (screen: ActiveScreen) => void;
}

export const FloatingCustomerService: React.FC<FloatingCustomerServiceProps> = ({
  currentScreen,
  onNavigate,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  // Hide on admin panel and login/signup screens
  if (['admin', 'login', 'signup'].includes(currentScreen)) {
    return null;
  }

  const handleOpenTelegram = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundService.playClick();
    window.open('https://t.me/dangote_refinery_support', '_blank', 'noopener,noreferrer');
  };

  const handleOpenTelegramChannel = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundService.playClick();
    window.open('https://t.me/dangote_refinery_plc', '_blank', 'noopener,noreferrer');
  };

  const handleOpenWhatsApp = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundService.playClick();
    window.open('https://wa.me/2349074936043?text=Hello%20Dangote%20Refinery%20Customer%20Care,%20I%20need%20assistance%20with%20my%20account.', '_blank', 'noopener,noreferrer');
  };

  const handleOpenInAppChat = () => {
    soundService.playClick();
    setIsOpen(false);
    onNavigate('support');
  };

  return (
    <>
      {/* Floating Pill Button as shown in the screenshot */}
      <div className="fixed bottom-20 right-3.5 z-40 pointer-events-auto">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.94 }}
          onClick={() => {
            soundService.playClick();
            setIsOpen(true);
          }}
          className="bg-[#07132e]/95 hover:bg-[#0c1f4d] text-white rounded-full pl-1.5 pr-4 py-1.5 shadow-[0_8px_30px_rgba(0,0,0,0.65)] border border-blue-500/50 flex items-center gap-2.5 transition-all group backdrop-blur-md"
          title="24/7 Customer Support"
          aria-label="24/7 Customer Support"
        >
          {/* Agent Avatar with Headset */}
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-amber-400 shadow-sm shrink-0 bg-slate-900">
            <img
              src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
              alt="Customer Support Representative"
              className="w-full h-full object-cover object-top"
              onError={(e) => {
                // Fallback to stylized SVG
                (e.currentTarget as HTMLElement).style.display = 'none';
              }}
            />
            {/* Online Green Pulsing Indicator */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border border-[#07132e]"></span>
          </div>

          {/* Badge & Label Text */}
          <div className="text-left flex flex-col justify-center">
            <div className="flex items-center gap-1 leading-none">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[10px] font-black text-amber-400 tracking-wider uppercase font-sans">
                24/7 CARE
              </span>
            </div>
            <span className="text-xs font-black text-white tracking-tight mt-0.5">
              Support
            </span>
          </div>
        </motion.button>
      </div>

      {/* Comprehensive Customer Service Drawer / Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-md bg-gradient-to-b from-[#0a1738] to-[#050d24] border border-blue-600/40 rounded-t-[32px] sm:rounded-3xl p-5 shadow-2xl text-white space-y-4 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-blue-900/50 pb-3">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-2xl overflow-hidden border-2 border-emerald-400 shrink-0 shadow-lg bg-slate-900">
                    <img
                      src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&q=80"
                      alt="Support Representative"
                      className="w-full h-full object-cover object-top"
                    />
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#0a1738]"></span>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-black text-white">Dangote Care 24/7</h3>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-black">
                        ONLINE
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      Official Petroleum Refinery Shareholder Support
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Service Guarantee Banner */}
              <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-950/60 to-blue-950/60 border border-emerald-500/30 flex items-center gap-2.5 text-xs text-emerald-200">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div className="leading-snug text-[11px]">
                  <b>Instant Resolution:</b> Recharges, NGN & USDT withdrawals, dividend inquiries, and team commission tracking.
                </div>
              </div>

              {/* Action Channels List */}
              <div className="space-y-2.5">
                {/* 1. Official Direct Telegram 1-on-1 */}
                <button
                  onClick={handleOpenTelegram}
                  className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-blue-900/60 to-indigo-900/60 hover:from-blue-800/70 hover:to-indigo-800/70 border border-blue-500/40 text-left transition flex items-center justify-between group shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition shrink-0">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white flex items-center gap-1.5">
                        <span>Telegram 1-on-1 Specialist</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-amber-400 text-slate-950 font-black">FAST</span>
                      </div>
                      <span className="text-[11px] text-amber-300 font-mono font-bold block mt-0.5">
                        @DANGOTE_REFINERY_SUPPORT
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-blue-300 group-hover:text-white">
                    <span>Chat</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* 2. Official WhatsApp Support */}
                <button
                  onClick={handleOpenWhatsApp}
                  className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-emerald-950/70 to-teal-950/70 hover:from-emerald-900/70 hover:to-teal-900/70 border border-emerald-500/40 text-left transition flex items-center justify-between group shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition shrink-0">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white flex items-center gap-1.5">
                        <span>WhatsApp Official Desk</span>
                        <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-400 text-slate-950 font-black">24/7</span>
                      </div>
                      <span className="text-[11px] text-emerald-300 font-mono block mt-0.5">
                        Nigerian Banking & USDT Payout Hotline
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-emerald-300 group-hover:text-white">
                    <span>WhatsApp</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* 3. Official Telegram Channel */}
                <button
                  onClick={handleOpenTelegramChannel}
                  className="w-full p-3.5 rounded-2xl bg-slate-900/80 hover:bg-slate-800/80 border border-slate-700 text-left transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-sky-400 group-hover:scale-105 transition shrink-0">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white">
                        Dangote Refinery Community Channel
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono block mt-0.5">
                        Daily IPO dividends & community updates
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-400 group-hover:text-white">
                    <span>Join</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </div>
                </button>

                {/* 4. In-App Interactive Support Assistant */}
                <button
                  onClick={handleOpenInAppChat}
                  className="w-full p-3.5 rounded-2xl bg-gradient-to-r from-purple-950/60 to-indigo-950/60 hover:from-purple-900/60 hover:to-indigo-900/60 border border-purple-500/40 text-left transition flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition shrink-0">
                      <Headphones className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-xs font-black text-white">
                        In-App Help Assistant & FAQ
                      </div>
                      <span className="text-[11px] text-purple-300 block mt-0.5">
                        Deposit guides, withdrawal rules & tranches
                      </span>
                    </div>
                  </div>
                  <div className="text-xs font-bold text-purple-300 group-hover:text-white">
                    Open Help →
                  </div>
                </button>
              </div>

              {/* Working Hours Footnote */}
              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                <Clock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Customer Care Response Time: &lt; 2 minutes (24/7)</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
