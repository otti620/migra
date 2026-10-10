import { useState } from 'react';
import { Sparkles, Clock, CheckCircle2, ArrowDownUp } from 'lucide-react';
import { Product, Order } from '../types';
import { AutoVideoImage } from './AutoVideoImage';
import { isFreeGiftProduct, hasUserClaimedFreeGift, getProductDailyIncome } from '../utils/validators';
import { formatUSD, formatNaira, nairaToUsd } from '../utils/currency';

interface ProductsScreenProps {
  products: Product[];
  userOrders?: Order[];
  onSelectProduct: (product: Product) => void;
  usdNairaRate?: number;
}

export function ProductsScreen({ products, userOrders = [], onSelectProduct, usdNairaRate = 1500 }: ProductsScreenProps) {
  const [activeTab, setActiveTab] = useState<'All Shares' | 'Public IPO' | 'Petrochemical' | 'VIP Institutional'>('All Shares');

  const filteredProducts = products
    .filter((p) => {
      const isExpired = p.isExpired || (p.expiresAtTimestamp && p.expiresAtTimestamp <= Date.now());
      if (isExpired) return false;

      if (activeTab === 'All Shares') return true;
      if (activeTab === 'Public IPO') return p.category === 'Public IPO';
      if (activeTab === 'Petrochemical') return p.category === 'Petrochemical';
      return p.category === 'VIP Institutional' || p.category === 'VIP';
    })
    .sort((a, b) => {
      // Hide free shares to be under (placed at the bottom below all paid offerings)
      const aIsFree = a.price === 0 || isFreeGiftProduct(a);
      const bIsFree = b.price === 0 || isFreeGiftProduct(b);
      if (aIsFree && !bIsFree) return 1;
      if (!aIsFree && bIsFree) return -1;
      return (a.price || 0) - (b.price || 0);
    });

  return (
    <div className="pb-24 pt-3 px-4 space-y-4 max-w-md mx-auto">
      {/* Rate Notice Banner */}
      <div className="bg-gradient-to-r from-[#0a1b42] to-[#0d2861] border border-blue-500/30 rounded-2xl p-2.5 flex items-center justify-between text-xs text-slate-200 shadow-md">
        <div className="flex items-center gap-2">
          <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full uppercase">
            ₦ Nigerian Naira (NGN)
          </span>
          <span className="text-[11px] font-bold text-slate-300">1 USDT = {formatNaira(usdNairaRate)}</span>
        </div>
        <span className="text-[10px] text-amber-300 font-extrabold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-md">
          Official Allotments
        </span>
      </div>

      {/* Category Tabs */}
      <div className="flex bg-[#0a183d] p-1.5 rounded-2xl border border-blue-900/60 shadow-md overflow-x-auto no-scrollbar gap-1">
        {(['All Shares', 'Public IPO', 'Petrochemical', 'VIP Institutional'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 min-w-[76px] py-2 rounded-xl text-xs font-bold transition relative whitespace-nowrap text-center ${
              activeTab === tab
                ? 'text-amber-300 font-black bg-blue-900/60 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-full"></span>
            )}
          </button>
        ))}
      </div>

      {/* Classification Notice */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center gap-1.5 font-bold text-slate-300">
          <ArrowDownUp className="w-3.5 h-3.5 text-amber-400" />
          <span>Classified by Price:</span>
          <span className="text-amber-300 font-extrabold">Lowest → Highest</span>
        </div>
        <span className="text-[11px] text-slate-400 font-semibold bg-slate-900/80 px-2 py-0.5 rounded-full border border-blue-900/40">
          {filteredProducts.length} Tranche{filteredProducts.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Product List */}
      <div className="space-y-4">
        {filteredProducts.map((product, index) => {
          const isFree = isFreeGiftProduct(product);
          const priceUsd = isFree ? 0 : nairaToUsd(product.price, usdNairaRate);
          const dailyNaira = getProductDailyIncome(product);
          const dailyUsd = isFree ? 0.13 : nairaToUsd(dailyNaira, usdNairaRate);
          const totalUsd = isFree ? 0.13 : nairaToUsd(product.totalIncome, usdNairaRate);

          return (
            <div key={product.id} className="bg-white text-slate-900 border border-slate-100 rounded-3xl p-4 shadow-xl space-y-3 relative overflow-hidden">
              {/* Top Tags */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="bg-blue-50 text-blue-800 font-extrabold text-[10px] px-2.5 py-0.5 rounded-full border border-blue-200">
                    NGX: DANGREFINERY
                  </span>
                  <span className="bg-slate-100 text-slate-700 font-bold text-[10px] px-2 py-0.5 rounded-full border border-slate-200">
                    #{index + 1} {isFree ? 'Free Grant' : `${formatNaira(product.price)}`}
                  </span>
                </div>
                {product.hot && (
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-[10px] px-3 py-0.5 rounded-full uppercase tracking-wider shadow-sm">
                    POPULAR ALLOTMENT
                  </span>
                )}
              </div>

              <div className="flex gap-3">
                <AutoVideoImage
                  src={product.imageUrl}
                  galleryImages={product.galleryImages}
                  alt={product.title}
                  className="w-24 h-24 rounded-2xl overflow-hidden border border-slate-100 shadow-md shrink-0"
                />
                <div className="flex-1">
                  <h3 className="font-extrabold text-slate-900 text-base leading-tight">{product.title}</h3>
                  <div className="flex items-baseline gap-2 mt-1.5 flex-wrap">
                    <span className="text-2xl font-black text-blue-900 font-mono tracking-tight">
                      {isFree ? 'FREE ₦0.00' : formatNaira(product.price)}
                    </span>
                    <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
                      ≈ {isFree ? '$0.00' : formatUSD(priceUsd)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Countdown timer box */}
              <div className="flex items-center justify-between bg-slate-950 text-white px-3 py-2 rounded-2xl text-xs font-medium">
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" /> Share Offering Closes
                </span>
                <div className="flex gap-1 items-center font-mono font-bold text-amber-400">
                  <span className="bg-slate-800 px-2 py-0.5 rounded-md">{String(product.countdown?.hours ?? 12).padStart(2, '0')}</span>:
                  <span className="bg-slate-800 px-2 py-0.5 rounded-md">{String(product.countdown?.minutes ?? 0).padStart(2, '0')}</span>:
                  <span className="bg-slate-800 px-2 py-0.5 rounded-md">{String(product.countdown?.seconds ?? 0).padStart(2, '0')}</span>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="bg-slate-50 rounded-2xl p-3 grid grid-cols-2 gap-2 text-xs border border-slate-100">
                <div>
                  <span className="text-slate-500 block text-[10px] font-medium">Total Return</span>
                  <div className="font-extrabold text-slate-900 text-sm">
                    {formatNaira(product.totalIncome)} <span className="text-[11px] font-bold text-slate-500">(≈ {formatUSD(totalUsd)})</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-medium">Investor Quota</span>
                  <span className="font-extrabold text-slate-900 text-sm">{product.quota} / account</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-medium">Yield Term</span>
                  <span className="font-extrabold text-slate-900 text-sm">{product.cycleDays} Days</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px] font-medium">Daily Dividend</span>
                  <div className="font-extrabold text-emerald-600 text-sm">
                    {formatNaira(dailyNaira)}/day <span className="text-[11px] font-bold text-emerald-700">(≈ {formatUSD(dailyUsd)})</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <p className="text-[11px] text-slate-500 line-clamp-1 flex-1 pr-2">
                  Backed by 650,000 BPD Lekki Refinery production revenues.
                </p>
                {isFree && hasUserClaimedFreeGift(product, userOrders) ? (
                  <button
                    onClick={() => onSelectProduct(product)}
                    className="py-2.5 px-5 bg-slate-200 text-slate-600 text-xs font-extrabold rounded-full shadow-sm flex items-center gap-1.5 shrink-0"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Already Claimed
                  </button>
                ) : (
                  <button
                    onClick={() => onSelectProduct(product)}
                    className="py-2.5 px-6 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 text-xs font-black rounded-full shadow-md hover:opacity-95 transition flex items-center gap-1.5 shrink-0"
                  >
                    <Sparkles className="w-3.5 h-3.5 fill-slate-950" /> Subscribe Units
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-slate-400 text-sm">
            No share tranches available in this category at the moment.
          </div>
        )}
      </div>
    </div>
  );
}
