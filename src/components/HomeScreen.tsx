import { useState } from 'react';
import { 
  Crown, 
  CheckSquare, 
  Calendar, 
  Wallet, 
  ArrowUpRight, 
  Users, 
  ChevronRight, 
  Building2, 
  Clock, 
  Sparkles, 
  CheckCircle2,
  TrendingUp
} from 'lucide-react';
import { ActiveScreen, Product, Order, Transaction, BalanceAuditLog } from '../types';
import { DangoteLogo } from './DangoteLogo';
import { isFreeGiftProduct, hasUserClaimedFreeGift, getProductDailyIncome } from '../utils/validators';
import { formatUSD, formatNaira, nairaToUsd } from '../utils/currency';

interface HomeScreenProps {
  userBalance: number;
  accruedIncome: number;
  teamSize: number;
  vipLevel: number;
  onNavigate: (screen: ActiveScreen) => void;
  onOpenCheckIn: () => void;
  onOpenRescue: () => void;
  products: Product[];
  userOrders?: Order[];
  transactions?: Transaction[];
  balanceAuditLogs?: BalanceAuditLog[];
  onSelectProduct: (product: Product) => void;
  usdNairaRate?: number;
}

export function HomeScreen({
  userBalance,
  accruedIncome,
  teamSize,
  vipLevel,
  onNavigate,
  onOpenCheckIn,
  products,
  userOrders = [],
  onSelectProduct,
  usdNairaRate = 1500,
}: HomeScreenProps) {
  const [showFullBanner, setShowFullBanner] = useState(false);

  const balanceUsd = nairaToUsd(userBalance, usdNairaRate);
  const accruedUsd = nairaToUsd(accruedIncome, usdNairaRate);

  return (
    <div className="pb-28 pt-2 px-4 space-y-4 max-w-md mx-auto relative">
      {/* Sleek Brand Header */}
      <div className="flex items-center justify-between px-1">
        <DangoteLogo size="md" showSubtitle={false} />
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black bg-amber-400 text-slate-950 px-2.5 py-1 rounded-full uppercase tracking-wider flex items-center gap-1 shadow-sm">
            <Crown className="w-3 h-3 text-slate-950 fill-current" /> VIP {vipLevel}
          </span>
          <button
            onClick={onOpenCheckIn}
            className="text-[10px] font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-1 rounded-full flex items-center gap-1 hover:bg-emerald-500/30 transition"
          >
            <Calendar className="w-3 h-3" /> Check-in
          </button>
        </div>
      </div>

      {/* Primary Image Showcase: Dangote Refinery Shares Go Live */}
      <div className="relative rounded-3xl overflow-hidden border border-blue-500/40 shadow-2xl bg-[#061436] group cursor-pointer"
           onClick={() => onNavigate('products')}>
        <div className="relative w-full overflow-hidden bg-slate-950">
          <img
            src="/images/dangote-shares-go-live.png"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/WhatsApp-Image-2026-09-11-at-12.21.15-PM.jpeg';
            }}
            alt="Dangote Refinery Shares Go Live - September 14th"
            className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          />
        </div>
        <div className="p-3 bg-gradient-to-r from-[#07173e] via-[#0b2460] to-[#07173e] flex items-center justify-between border-t border-blue-500/30">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-black text-white tracking-wide">
              Dangote Refinery Shares Live Now
            </span>
          </div>
          <span className="text-[11px] font-black text-amber-300 flex items-center gap-0.5 group-hover:translate-x-1 transition">
            Subscribe <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Clean Portfolio Balance Card */}
      <div className="bg-gradient-to-br from-[#0c1f4d] via-[#091b42] to-[#061330] border border-blue-500/40 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-blue-200/80 font-bold block">
              Available Balance
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h2 className="text-2xl font-black text-white tracking-tight">
                {formatNaira(userBalance)}
              </h2>
              <span className="text-xs font-semibold text-blue-300">
                ≈ {formatUSD(balanceUsd)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
              Total Dividends
            </span>
            <span className="text-sm font-black text-emerald-400 block mt-1">
              +{formatNaira(accruedIncome, true)}
            </span>
          </div>
        </div>

        {/* Deposit & Withdraw Action Buttons */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            onClick={() => onNavigate('recharge')}
            className="py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-black rounded-2xl shadow-lg shadow-blue-600/30 flex items-center justify-center gap-2 transition"
          >
            <Wallet className="w-4 h-4" />
            <span>Deposit</span>
          </button>
          <button
            onClick={() => onNavigate('withdraw')}
            className="py-3 px-4 bg-white/10 hover:bg-white/15 border border-white/20 text-white text-xs font-black rounded-2xl shadow-md flex items-center justify-center gap-2 transition"
          >
            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            <span>Withdraw</span>
          </button>
        </div>
      </div>

      {/* Clean Quick Actions Grid */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => onNavigate('vip')}
          className="bg-slate-900/80 border border-blue-900/40 hover:border-blue-700/60 p-3 rounded-2xl flex flex-col items-center justify-center transition group shadow-sm"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500/15 flex items-center justify-center mb-1 group-hover:scale-110 transition">
            <Crown className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-[11px] font-bold text-slate-200">VIP</span>
        </button>

        <button
          onClick={() => onNavigate('task')}
          className="bg-slate-900/80 border border-blue-900/40 hover:border-blue-700/60 p-3 rounded-2xl flex flex-col items-center justify-center transition group shadow-sm"
        >
          <div className="w-9 h-9 rounded-xl bg-blue-500/15 flex items-center justify-center mb-1 group-hover:scale-110 transition">
            <CheckSquare className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-[11px] font-bold text-slate-200">Tasks</span>
        </button>

        <button
          onClick={() => onNavigate('team')}
          className="bg-slate-900/80 border border-blue-900/40 hover:border-blue-700/60 p-3 rounded-2xl flex flex-col items-center justify-center transition group shadow-sm"
        >
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center mb-1 group-hover:scale-110 transition">
            <Users className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-[11px] font-bold text-slate-200">Team ({teamSize})</span>
        </button>

        <button
          onClick={() => onNavigate('roadmap')}
          className="bg-slate-900/80 border border-blue-900/40 hover:border-blue-700/60 p-3 rounded-2xl flex flex-col items-center justify-center transition group shadow-sm"
        >
          <div className="w-9 h-9 rounded-xl bg-purple-500/15 flex items-center justify-center mb-1 group-hover:scale-110 transition">
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-[11px] font-bold text-slate-200">Roadmap</span>
        </button>
      </div>

      {/* Featured Share Products (IPO Share Tranches) */}
      <div className="space-y-3 pt-1">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-4 h-4 text-amber-400" />
            <span>Dangote IPO Share Tranches</span>
          </h3>
          <button 
            onClick={() => onNavigate('products')} 
            className="text-xs text-amber-400 hover:text-amber-300 font-bold flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {products
          .filter((p) => !(p.isExpired || (p.expiresAtTimestamp && p.expiresAtTimestamp <= Date.now())))
          .sort((a, b) => {
            const aIsFree = a.price === 0 || isFreeGiftProduct(a);
            const bIsFree = b.price === 0 || isFreeGiftProduct(b);
            if (aIsFree && !bIsFree) return 1;
            if (!aIsFree && bIsFree) return -1;
            return (a.price || 0) - (b.price || 0);
          })
          .slice(0, 3)
          .map((product) => {
            const isFree = isFreeGiftProduct(product);
            const priceUsd = isFree ? 0 : nairaToUsd(product.price, usdNairaRate);
            const dailyNaira = getProductDailyIncome(product);
            const dailyUsd = isFree ? 0.13 : nairaToUsd(dailyNaira, usdNairaRate);
            const totalUsd = isFree ? 0.13 : nairaToUsd(product.totalIncome, usdNairaRate);

            return (
              <div 
                key={product.id} 
                className="bg-[#081738]/90 border border-blue-900/50 hover:border-blue-700/60 rounded-3xl p-4 shadow-xl space-y-3 transition"
              >
                <div className="flex gap-3">
                  <img 
                    src={product.imageUrl} 
                    alt={product.title} 
                    className="w-20 h-20 rounded-2xl object-cover border border-blue-800/40 shrink-0" 
                  />
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] uppercase font-bold bg-blue-950 text-amber-300 px-2 py-0.5 rounded-full border border-blue-700 inline-block">
                      {product.category}
                    </span>
                    <h4 className="font-bold text-white text-sm mt-1 truncate">{product.title}</h4>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-base font-black text-amber-400">
                        {isFree ? 'FREE' : formatNaira(product.price)}
                      </span>
                      {!isFree && (
                        <span className="text-[10px] text-slate-400 font-medium">
                          ({formatUSD(priceUsd)})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Return and Dividend Metrics */}
                <div className="bg-slate-950/70 rounded-2xl p-2.5 grid grid-cols-3 gap-2 text-center text-xs border border-blue-950">
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-semibold">Daily Yield</span>
                    <span className="font-bold text-emerald-400 text-xs">+{formatNaira(dailyNaira)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-semibold">Term</span>
                    <span className="font-bold text-white text-xs">{product.cycleDays} Days</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[9px] uppercase font-semibold">Total Return</span>
                    <span className="font-bold text-blue-300 text-xs">{formatNaira(product.totalIncome)}</span>
                  </div>
                </div>

                {isFree && hasUserClaimedFreeGift(product, userOrders) ? (
                  <button
                    onClick={() => onSelectProduct(product)}
                    className="w-full py-2.5 bg-slate-800 text-slate-300 text-xs font-bold rounded-2xl border border-slate-700 flex items-center justify-center gap-1.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Free Allotment Claimed</span>
                  </button>
                ) : (
                  <button
                    onClick={() => onSelectProduct(product)}
                    className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 text-xs font-black rounded-2xl shadow-md hover:opacity-95 transition"
                  >
                    Subscribe Share Units
                  </button>
                )}
              </div>
            );
          })}
      </div>
    </div>
  );
}
