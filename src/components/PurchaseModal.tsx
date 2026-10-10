import { useState } from 'react';
import { X, Plus, Minus, Building2, Sparkles, AlertTriangle } from 'lucide-react';
import { Product, Order } from '../types';
import { AutoVideoImage } from './AutoVideoImage';
import { soundService } from '../utils/audioService';
import { isFreeGiftProduct, hasUserClaimedFreeGift, getProductDailyIncome } from '../utils/validators';
import { formatUSD, formatNaira, nairaToUsd } from '../utils/currency';

interface PurchaseModalProps {
  product: Product;
  userBalance: number;
  userOrders?: Order[];
  onClose: () => void;
  onConfirm: (product: Product, quantity: number) => void;
  usdNairaRate?: number;
}

export function PurchaseModal({ product, userBalance, userOrders = [], onClose, onConfirm, usdNairaRate = 1500 }: PurchaseModalProps) {
  const isFree = isFreeGiftProduct(product);
  const alreadyClaimedFreeGift = hasUserClaimedFreeGift(product, userOrders);

  const maxQuota = isFree ? 1 : (product.quota || 5);
  const [quantity, setQuantity] = useState(1);

  const totalPrice = product.price * quantity;
  const totalDailyIncome = getProductDailyIncome(product) * quantity;
  const totalReturn = product.totalIncome * quantity;
  const canAfford = userBalance >= totalPrice;

  const totalPriceUsd = isFree ? 0 : nairaToUsd(totalPrice, usdNairaRate);
  const totalDailyIncomeUsd = isFree ? 0.13 : nairaToUsd(totalDailyIncome, usdNairaRate);
  const totalReturnUsd = isFree ? 0.13 : nairaToUsd(totalReturn, usdNairaRate);
  const userBalanceUsd = nairaToUsd(userBalance, usdNairaRate);

  const handleIncrement = () => {
    soundService.playClick();
    setQuantity((q) => Math.min(maxQuota, q + 1));
  };
  const handleDecrement = () => {
    soundService.playClick();
    setQuantity((q) => Math.max(1, q - 1));
  };

  const handleConfirmPurchase = () => {
    if (alreadyClaimedFreeGift) {
      alert('You have already claimed this free gift plan! Each user can only claim the free gift plan once.');
      return;
    }
    if (!canAfford && !isFree) return;
    soundService.playSuccess();
    onConfirm(product, quantity);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-fadeIn">
      <div className="bg-[#120e2e] border border-purple-800/60 rounded-3xl p-5 w-full max-w-sm relative shadow-2xl text-white space-y-4">
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-900/80 border border-slate-800 p-2 rounded-full transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center pt-1">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-950 border border-blue-600/40 text-amber-300 text-[10px] font-black uppercase tracking-wider mb-2">
            <Building2 className="w-3.5 h-3.5 text-amber-400" /> IPO Share Subscription
          </div>
          <h3 className="text-lg font-black text-white">{product.title}</h3>
          <p className="text-xs font-bold text-slate-300 mt-0.5">Tranche: {product.category} • NGX: DANGREFINERY</p>
        </div>

        {/* Video / Gallery Preview Banner */}
        <div className="rounded-2xl overflow-hidden shadow-lg border border-blue-900/60 relative">
          <AutoVideoImage
            src={product.imageUrl}
            galleryImages={product.galleryImages}
            alt={product.title}
            className="w-full h-36 object-cover"
          />
          <div className="absolute bottom-2 right-2 px-2.5 py-1 bg-slate-950/80 backdrop-blur-md rounded-lg text-[10px] font-bold text-amber-300 border border-blue-800/40 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-400" /> {product.cycleDays} Days Term
          </div>
        </div>

        {/* Quantity Selector */}
        <div className="bg-slate-950/90 p-3.5 rounded-2xl flex items-center justify-between border border-blue-900/50">
          <div>
            <span className="text-xs font-black text-slate-200 block">Subscription Units</span>
            <span className="text-[10px] font-bold text-amber-400">Max Allotment: {maxQuota} / User</span>
          </div>
          <div className="flex items-center gap-3 bg-slate-900 px-3 py-1.5 rounded-xl border border-blue-800/50 shadow-inner">
            <button 
              onClick={handleDecrement}
              disabled={quantity <= 1}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white font-black disabled:opacity-30 transition"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="font-black text-sm text-amber-300 min-w-[20px] text-center">{quantity}</span>
            <button 
              onClick={handleIncrement}
              disabled={quantity >= maxQuota}
              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white font-black disabled:opacity-30 transition"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Investment Details */}
        <div className="bg-slate-950/80 rounded-2xl p-4 border border-blue-900/40 space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-slate-300 font-medium">
            <span>Subscription Amount:</span>
            <div className="text-right">
              <span className="font-black text-amber-300 text-base font-mono">
                {isFree ? 'FREE ₦0.00' : formatNaira(totalPrice, true)}
              </span>
              <span className="text-[11px] font-bold text-slate-400 ml-1.5">
                (≈ {isFree ? '$0.00' : formatUSD(totalPriceUsd)})
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center text-slate-300 font-medium">
            <span>Daily Dividend Yield:</span>
            <div className="text-right">
              <span className="font-black text-emerald-400">
                {formatNaira(totalDailyIncome)} / day
              </span>
              <span className="text-[11px] font-bold text-slate-400 ml-1.5">
                (≈ {formatUSD(totalDailyIncomeUsd)}/day)
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center text-slate-300 font-medium">
            <span>Total Expected Payout:</span>
            <div className="text-right">
              <span className="font-black text-blue-300">
                {formatNaira(totalReturn)}
              </span>
              <span className="text-[11px] font-bold text-slate-400 ml-1.5">
                (≈ {formatUSD(totalReturnUsd)})
              </span>
            </div>
          </div>
          <div className="flex justify-between items-center text-slate-400 border-t border-blue-900/50 pt-2 font-medium">
            <span>Shareholder Balance:</span>
            <div className="text-right">
              <span className={`font-black ${canAfford ? 'text-white' : 'text-rose-400'}`}>
                {formatNaira(userBalance)}
              </span>
              <span className="text-[11px] font-bold text-slate-400 ml-1.5">
                (≈ {formatUSD(userBalanceUsd)})
              </span>
            </div>
          </div>
        </div>

        {alreadyClaimedFreeGift && (
          <div className="p-3 bg-amber-950/90 border border-amber-500/60 rounded-2xl text-[11px] font-extrabold text-amber-200 text-center flex items-center justify-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Notice: You have already claimed this free gift plan. Limit is 1 per user account.</span>
          </div>
        )}

        {!canAfford && !isFree && !alreadyClaimedFreeGift && (
          <div className="p-3 bg-rose-950/80 border border-rose-500/60 rounded-2xl text-[11px] font-bold text-rose-200 text-center">
            Insufficient wallet balance! Please deposit funds to subscribe to this share tranche.
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleConfirmPurchase}
          disabled={alreadyClaimedFreeGift || (!canAfford && !isFree)}
          className="w-full py-3.5 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 font-black text-sm rounded-2xl shadow-lg shadow-amber-500/25 hover:opacity-95 transition disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {alreadyClaimedFreeGift
            ? 'Already Claimed'
            : isFree
            ? 'Claim Free Welcome Shares (₦0.00)'
            : canAfford
            ? `Confirm Subscription (${formatNaira(totalPrice, true)})`
            : 'Insufficient Balance (Deposit Funds)'}
        </button>
      </div>
    </div>
  );
}
