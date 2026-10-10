import React from 'react';
import { Sparkles, MapPin, Globe, CheckCircle2, TrendingUp, Flame, Fuel } from 'lucide-react';
import { DangoteLogo } from './DangoteLogo';

interface DangoteTimesSquareHeroProps {
  variant?: 'banner' | 'card' | 'background' | 'badge';
  className?: string;
  showDetails?: boolean;
}

export const DangoteTimesSquareHero: React.FC<DangoteTimesSquareHeroProps> = ({
  variant = 'card',
  className = '',
  showDetails = true,
}) => {
  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-blue-900/80 to-amber-900/80 border border-amber-400/50 shadow-lg ${className}`}>
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
        <span className="text-[10px] font-black text-white uppercase tracking-wider">
          Times Square NYC • Dangote & Davido IPO Launch
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden rounded-3xl border border-blue-500/50 shadow-2xl bg-[#05112f] text-white ${className}`}>
      {/* Background Graphic & Urban Times Square Lighting */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#020b24]/90 via-[#07173e]/85 to-[#020617]/95 z-0" />
      
      {/* Billboard Emulation Layer */}
      <div className="relative z-10 p-4 sm:p-5 space-y-3">
        {/* Top Location & Slogan Tag */}
        <div className="flex items-center justify-between gap-2 border-b border-blue-800/40 pb-2.5">
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-amber-300">
            <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span>Times Square, New York City (Nasdaq Tower)</span>
          </div>
          <span className="text-[9px] font-extrabold bg-blue-600 text-white px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
            GLOBAL IPO SHOWCASE
          </span>
        </div>

        {/* Actual Times Square Billboard & Davido Photo */}
        <div className="relative rounded-2xl overflow-hidden border border-blue-400/50 shadow-lg group">
          <img
            src="/THE-NEW-YORK-PICTURE-WITH-DAVIDO.jpeg"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/images/THE-NEW-YORK-PICTURE-WITH-DAVIDO.jpeg';
            }}
            alt="Davido and Aliko Dangote in Times Square New York with Dangote Refinery Billboard"
            className="w-full h-48 sm:h-56 object-cover object-center transition duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end p-3">
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] font-bold text-amber-300 drop-shadow">
                Times Square, NYC • Davido & Aliko Dangote
              </span>
              <span className="text-[9px] font-extrabold bg-blue-600/90 text-white px-2 py-0.5 rounded-full">
                HISTORIC UNVEILING
              </span>
            </div>
          </div>
        </div>

        {/* The Famous Times Square Billboard Representation */}
        <div className="bg-[#020d2d] border-2 border-blue-500 rounded-2xl p-4 shadow-[0_0_25px_rgba(37,99,235,0.4)] relative overflow-hidden">
          {/* Billboard Glowing Title */}
          <div className="flex items-start justify-between">
            <div>
              <div className="text-[9px] font-black tracking-widest text-cyan-300 uppercase">
                GLOBAL ENERGY TRANSITION
              </div>
              <h4 className="text-base sm:text-lg font-black tracking-tight text-white drop-shadow-md">
                INDUSTRY FOR TOMORROW
              </h4>
            </div>
            <span className="text-[8px] font-bold bg-amber-500/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded">
              SEPTEMBER 2024
            </span>
          </div>

          <p className="text-[10px] text-blue-200 mt-1 leading-relaxed max-w-xs">
            "A Modern, highly integrated refinery designed around advanced process technologies, production efficiency, and optimised energy recovery."
          </p>

          {/* 711-TT-1102 B Crude Day Tank Graphic Card */}
          <div className="mt-3 bg-gradient-to-r from-blue-950 to-[#0c1f54] border border-blue-400/50 rounded-xl p-3 flex items-center justify-between gap-3 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-cyan-400/60 flex items-center justify-center text-cyan-300 shrink-0 shadow">
                <Fuel className="w-5 h-5 text-cyan-300" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <DangoteLogo size="sm" showSubtitle={false} variant="icon" />
                  <span className="text-xs font-black text-white tracking-wider">DANGOTE</span>
                </div>
                <div className="text-[10px] font-extrabold text-amber-300 font-mono">
                  711-TT-1102 B CRUDE DAY TANK
                </div>
                <div className="text-[9px] text-slate-300 font-semibold">
                  Capacity: 60,000,000 Litres Single Vessel
                </div>
              </div>
            </div>

            <div className="text-right shrink-0">
              <span className="text-[9px] font-bold text-emerald-400 bg-emerald-950/80 px-2 py-1 rounded border border-emerald-500/40 block">
                650k BPD Active
              </span>
            </div>
          </div>
        </div>

        {/* Davido & Aliko Dangote Thumbs-up VIP Showcase Card */}
        <div className="bg-gradient-to-r from-amber-950/40 via-[#071333] to-blue-950/40 border border-amber-500/40 rounded-2xl p-3.5 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-white">
                Aliko Dangote & Davido in New York
              </span>
              <span className="text-[9px] font-extrabold bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded font-mono">
                👍 THUMBS UP
              </span>
            </div>
            <p className="text-[10px] text-slate-300 leading-tight">
              Africa's wealthiest industrialist Aliko Dangote and Afrobeats icon Davido celebrate the Dangote Petroleum Refinery IPO unveiling on the colossal Times Square digital billboards.
            </p>
          </div>
        </div>

        {/* Details & Key Quotes */}
        {showDetails && (
          <div className="grid grid-cols-2 gap-2 pt-1 text-center">
            <div className="bg-black/40 border border-blue-800/40 rounded-xl p-2">
              <div className="text-[9px] text-blue-300 font-bold uppercase">Slogan in Times Square</div>
              <div className="text-[11px] font-black text-amber-300 mt-0.5">"Made in Nigeria. Built for the World."</div>
            </div>
            <div className="bg-black/40 border border-blue-800/40 rounded-xl p-2">
              <div className="text-[9px] text-blue-300 font-bold uppercase">IPO Valuation Target</div>
              <div className="text-[11px] font-black text-emerald-400 mt-0.5">₦2.15+ Trillion Global Listing</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
