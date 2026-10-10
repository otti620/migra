import React, { useState, useEffect, useRef } from 'react';
import { Clock, Check, PackageOpen, ArrowRight, Info, X, Sparkles, ShieldCheck, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Order } from '../types';
import { AutoVideoImage } from './AutoVideoImage';
import { soundService } from '../utils/audioService';
import { getOrderDailyIncome, getOrderClaimInfo } from '../utils/validators';
import { formatUSD, formatNaira, nairaToUsd } from '../utils/currency';

interface OrderScreenProps {
  orders: Order[];
  onClaimEarnings: (orderId: string, amount: number) => void;
  onClaimAllEarnings?: () => void;
  onForfeitOrder?: (orderId: string) => void;
  onNavigate?: (screen: any) => void;
  usdNairaRate?: number;
  lastIncomeClaimDate?: string;
  onRefreshOrders?: () => Promise<void> | void;
  isRefreshingOrders?: boolean;
}

export function OrderScreen({ 
  orders, 
  onClaimEarnings, 
  onClaimAllEarnings,
  onForfeitOrder, 
  onNavigate, 
  usdNairaRate = 1500,
  lastIncomeClaimDate,
  onRefreshOrders,
  isRefreshingOrders = false,
}: OrderScreenProps) {
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');
  const [claimModalOrder, setClaimModalOrder] = useState<Order | null>(null);
  const [infoTooltip, setInfoTooltip] = useState<{ title: string; text: string } | null>(null);
  const [now, setNow] = useState<number>(Date.now());
  const [claimingOrderIds, setClaimingOrderIds] = useState<Set<string>>(new Set());
  const forfeitingOrderIds = useRef<Set<string>>(new Set());

  const todayStr = new Date().toDateString();
  const hasClaimedIncomeToday = !!(
    lastIncomeClaimDate && new Date(lastIncomeClaimDate).toDateString() === todayStr
  );

  // Live timer ticking every second
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto check for expired unclaimed orders with once-per-session guard
  useEffect(() => {
    orders.forEach((ord) => {
      if (ord.status === 'active' && !forfeitingOrderIds.current.has(ord.id)) {
        const claimInfo = getOrderClaimInfo(ord, now);
        if (claimInfo.claimExpiresAt > 0 && now >= claimInfo.claimExpiresAt) {
          forfeitingOrderIds.current.add(ord.id);
          if (onForfeitOrder) {
            onForfeitOrder(ord.id);
          }
        }
      }
    });
  }, [now, orders, onForfeitOrder]);

  const filteredOrders = orders.filter((o) => {
    if (activeTab === 'active') return o.status === 'active' && o.daysRemaining > 0;
    return o.status === 'completed' || o.status === 'expired' || o.daysRemaining <= 0;
  });

  const activeCount = orders.filter(o => o.status === 'active' && o.daysRemaining > 0).length;
  const completedCount = orders.filter(o => o.status === 'completed' || o.status === 'expired' || o.daysRemaining <= 0).length;

  const claimableActiveOrders = orders.filter((o) => {
    if (o.status !== 'active' || (o.daysRemaining !== undefined && o.daysRemaining <= 0)) return false;
    const claimInfo = getOrderClaimInfo(o, now);
    return claimInfo.isClaimable;
  });

  const totalClaimableNaira = claimableActiveOrders.reduce((sum, ord) => sum + getOrderDailyIncome(ord), 0);

  return (
    <div className="pb-28 pt-2 px-4 space-y-4 max-w-md mx-auto">
      {/* Top Bar with on-demand refresh */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-slate-300 font-mono">
          Shareholder Tranche Contracts
        </div>
        {onRefreshOrders && (
          <button
            onClick={() => {
              soundService.playClick();
              onRefreshOrders();
            }}
            disabled={isRefreshingOrders}
            className="px-2.5 py-1 rounded-xl bg-purple-900/40 hover:bg-purple-800/60 border border-purple-700/40 text-purple-300 hover:text-white text-[11px] font-bold flex items-center gap-1.5 transition active:scale-95 disabled:opacity-50"
            title="Fetch latest orders on request"
          >
            <RefreshCw className={`w-3 h-3 ${isRefreshingOrders ? 'animate-spin text-amber-400' : ''}`} />
            <span>Refresh</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex bg-[#18153b] p-1.5 rounded-2xl border border-purple-900/50 shadow-md">
        <button
          onClick={() => { soundService.playClick(); setActiveTab('active'); }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'active'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Active Orders ({activeCount})
        </button>
        <button
          onClick={() => { soundService.playClick(); setActiveTab('completed'); }}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
            activeTab === 'completed'
              ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-600/30 font-black'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Completed / Expired ({completedCount})
        </button>
      </div>

      {/* Daily Income Status / Harvest Banner */}
      {hasClaimedIncomeToday ? (
        <div className="bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 border border-emerald-500/40 rounded-3xl p-4 shadow-xl flex items-center justify-between text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black text-emerald-300">Daily Dividend Claimed (1/1 Today)</div>
              <div className="text-[11px] text-emerald-200/70 mt-0.5">Strict policy: Dividends can only be claimed once a day. Next harvest unlocks tomorrow.</div>
            </div>
          </div>
        </div>
      ) : (
        claimableActiveOrders.length > 0 && (
          <div className="bg-gradient-to-r from-[#0c1f4d] via-[#102a6b] to-[#0c1f4d] border border-blue-500/50 rounded-3xl p-4 shadow-xl space-y-3 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-black text-white">Daily Dividend Harvest Available</span>
              </div>
              <span className="text-[10px] font-extrabold bg-amber-400/20 text-amber-300 border border-amber-400/30 px-2.5 py-0.5 rounded-full">
                1 Claim / Day
              </span>
            </div>
            <div className="flex items-baseline justify-between pt-1">
              <div>
                <span className="text-[10px] text-blue-200/70 font-semibold uppercase tracking-wider block">Today's Harvestable Dividend</span>
                <div className="text-xl font-black text-emerald-400 tracking-tight font-mono">{formatNaira(totalClaimableNaira)}</div>
              </div>
              <button
                onClick={() => {
                  soundService.playClick();
                  if (onClaimAllEarnings) {
                    onClaimAllEarnings();
                  } else if (claimableActiveOrders[0]) {
                    setClaimModalOrder(claimableActiveOrders[0]);
                  }
                }}
                className="py-2.5 px-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs rounded-2xl shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition active:scale-95 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Harvest All Today's Income</span>
              </button>
            </div>
          </div>
        )
      )}

      {/* Orders List / Empty State */}
      {filteredOrders.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl p-8 text-center shadow-xl border border-slate-100 my-6 space-y-4"
        >
          <div className="w-20 h-20 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
            <PackageOpen className="w-10 h-10" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">No {activeTab} shareholdings</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              {activeTab === 'active'
                ? "You don't have any running Dangote Refinery shareholdings right now."
                : "No completed or expired shareholding allotments yet."}
            </p>
          </div>
          {activeTab === 'active' && onNavigate && (
            <button
              onClick={() => { soundService.playClick(); onNavigate('products'); }}
              className="py-3 px-6 bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 text-xs font-black rounded-full shadow-lg shadow-amber-500/25 hover:opacity-95 transition inline-flex items-center gap-2"
            >
              Explore Dangote Share Tranches <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </motion.div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => {
            const daysElapsed = Math.max(0, order.cycleDays - order.daysRemaining);
            const progressPercent = Math.min(100, Math.max(0, (daysElapsed / Math.max(1, order.cycleDays)) * 100));
            const isFinished = order.status === 'completed' || order.status === 'expired' || order.daysRemaining <= 0;
            const isExpired = order.status === 'expired' || (order.daysRemaining <= 0 && order.status !== 'completed');

            const dailyIncomeNaira = getOrderDailyIncome(order);
            const priceUsd = nairaToUsd(order.price, usdNairaRate);
            const dailyUsd = nairaToUsd(dailyIncomeNaira, usdNairaRate);

            const claimInfo = getOrderClaimInfo(order, now);

            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white text-slate-900 border border-slate-100 rounded-3xl p-4 shadow-xl space-y-3 relative overflow-hidden"
              >
                <div className="flex justify-between items-center text-xs text-slate-500 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono text-purple-700 font-bold">#{order.orderNumber}</span>
                    <span className="text-[10px] text-slate-400 font-medium">({order.daysRemaining}d left)</span>
                  </div>

                  {isFinished ? (
                    isExpired ? (
                      <span className="flex items-center gap-1 text-rose-600 font-extrabold bg-rose-50 px-2.5 py-0.5 rounded-full text-[11px]">
                        <Clock className="w-3.5 h-3.5" /> Expired
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-600 font-extrabold bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px]">
                        <Check className="w-3.5 h-3.5" /> Completed
                      </span>
                    )
                  ) : claimInfo.isClaimable ? (
                    <span className="flex items-center gap-1 text-emerald-600 font-extrabold bg-emerald-50 px-2.5 py-0.5 rounded-full text-[11px] animate-pulse">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-500" /> Dividend Ready!
                    </span>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <span className="flex items-center gap-1 text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full text-[10px] font-mono border border-amber-200/60">
                        <Clock className="w-3 h-3 text-amber-500 animate-spin" style={{ animationDuration: '8s' }} />
                        <span>Next: {claimInfo.formattedCountdown}</span>
                      </span>
                      <button
                        onClick={() => {
                          soundService.playClick();
                          setInfoTooltip({
                            title: '24-Hour Yield Accrual Schedule',
                            text: 'Dividends strictly accrue and unlock once every 24 hours per shareholding tranche. Multiple claims per day are restricted to preserve authentic dividend cycles.'
                          });
                        }}
                        className="p-1 rounded-full text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition"
                        title="Dividend cycle info"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <div className="flex gap-3">
                  <AutoVideoImage
                    src={order.productImage}
                    alt={order.productTitle}
                    className="w-18 h-18 rounded-2xl overflow-hidden border border-slate-100 shadow-sm shrink-0"
                  />
                  <div className="flex-1">
                    <h4 className="font-extrabold text-slate-900 text-base">{order.productTitle}</h4>
                    <div className="flex items-baseline gap-2 mt-0.5">
                      <span className="text-base font-black text-[#e11d48] font-mono">
                        {order.price === 0 ? 'FREE ₦0.00' : formatNaira(order.price)}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        (≈ {order.price === 0 ? '$0.00' : formatUSD(priceUsd)})
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5 flex items-center gap-1.5">
                      <span>Daily: <strong className="text-emerald-600 font-bold">{formatNaira(dailyIncomeNaira)}/day <span className="text-[11px] font-normal text-slate-500">(≈ {formatUSD(dailyUsd)})</span></strong></span>
                      <button
                        onClick={() => {
                          soundService.playClick();
                          setInfoTooltip({
                            title: 'Daily Income Calculation',
                            text: 'Daily income is calculated as a fixed daily return percentage based on your investment tier and product value. Earnings accrue once every 24 hours and can be claimed directly into your main balance.'
                          });
                        }}
                        className="p-1 rounded-full text-slate-400 hover:text-purple-600 hover:bg-purple-50 transition"
                        title="How daily income works"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Near Completion / Final Cycle Day Badge */}
                {!isFinished && order.daysRemaining <= 3 && (
                  <div className={`px-3 py-1.5 rounded-2xl text-xs font-black flex items-center justify-between border ${
                    order.daysRemaining === 1 
                      ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse' 
                      : 'bg-amber-50 border-amber-200 text-amber-800'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <span>🔥</span>
                      <span>{order.daysRemaining === 1 ? 'Final Cycle Day!' : `Near Completion (${order.daysRemaining} days left)`}</span>
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-wide opacity-80">
                      {order.daysRemaining === 1 ? 'Last Claim' : 'Almost Done'}
                    </span>
                  </div>
                )}

                {/* Progress Bar */}
                <div className="space-y-1 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  <div className="flex justify-between items-center text-[11px] font-bold text-slate-500">
                    <span>Cycle Progress</span>
                    <span className="text-purple-700 font-black">{Math.round(progressPercent)}% ({daysElapsed}/{order.cycleDays} Days)</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${
                        isFinished 
                          ? (isExpired ? 'bg-rose-500' : 'bg-emerald-500')
                          : 'bg-gradient-to-r from-purple-600 to-indigo-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Action button / Claim Button with Strict Once-A-Day Protection */}
                {!isFinished && (
                  hasClaimedIncomeToday ? (
                    <div className="space-y-1.5">
                      <button
                        disabled
                        className="w-full py-3 bg-slate-100 border border-slate-200 text-slate-500 text-xs font-bold rounded-2xl cursor-not-allowed flex items-center justify-between px-4 transition shadow-inner"
                      >
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600" />
                          <span className="font-semibold text-slate-700">Daily Dividend Claimed (1/1 Today)</span>
                        </div>
                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 font-mono">
                          Claimed
                        </span>
                      </button>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 font-medium">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                          <span>Strict Policy: Maximum 1 dividend claim per day</span>
                        </span>
                        <span className="font-bold text-slate-600">Unlocks Tomorrow</span>
                      </div>
                    </div>
                  ) : claimInfo.isClaimable ? (
                    <button
                      onClick={() => {
                        soundService.playClick();
                        setClaimModalOrder(order);
                      }}
                      disabled={claimingOrderIds.has(order.id)}
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-black rounded-2xl shadow-lg shadow-emerald-600/30 hover:shadow-emerald-600/50 transition-all flex items-center justify-center gap-2 active:scale-98 animate-pulse"
                    >
                      <Sparkles className="w-4 h-4 text-amber-300" />
                      <span>Claim Today's Dividend ({formatNaira(dailyIncomeNaira)})</span>
                    </button>
                  ) : (
                    <div className="space-y-1.5">
                      <button
                        disabled
                        className="w-full py-3 bg-slate-100 border border-slate-200 text-slate-500 text-xs font-bold rounded-2xl cursor-not-allowed flex items-center justify-between px-4 transition shadow-inner"
                      >
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-amber-500 animate-spin" style={{ animationDuration: '8s' }} />
                          <span className="font-semibold text-slate-600">Next Dividend Unlocks In:</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-black text-slate-800 bg-slate-200 px-2.5 py-1 rounded-lg">
                            {claimInfo.formattedCountdown}
                          </span>
                        </div>
                      </button>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 px-1 font-medium">
                        <span className="flex items-center gap-1">
                          <ShieldCheck className="w-3.5 h-3.5 text-blue-500" />
                          <span>Strict Policy: 1 claim allowed every 24 hours</span>
                        </span>
                        <span className="font-bold text-emerald-700">+{formatNaira(dailyIncomeNaira)}/day</span>
                      </div>
                    </div>
                  )
                )}
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Claim Earnings Modal */}
      <AnimatePresence>
        {claimModalOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-xs w-full shadow-2xl text-center relative border border-slate-100"
            >
              <button
                onClick={() => setClaimModalOrder(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="w-20 h-20 mx-auto mb-3 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
                  <rect x="25" y="45" width="50" height="40" rx="6" fill="#e03a52" />
                  <path d="M 20 45 C 20 40, 30 32, 50 32 C 70 32, 80 40, 80 45 Z" fill="#c0263c" />
                  <polygon points="50,40 45,50 55,50" fill="#ff6600" />
                  <path d="M 32,82 Q 50,88 68,82 L 68,82 Q 50,78 32,82 Z" fill="#e67e22" />
                </svg>
              </div>

              <h3 className="text-2xl font-black text-[#22183e] tracking-tight mb-1">
                Congratulations
              </h3>

              <div className="text-xs font-semibold text-[#665a83] mb-2">
                Daily ISO Yield Harvested
              </div>

              <div className="text-3xl font-black text-[#e03a52] tracking-tight mb-1 font-mono">
                +{formatNaira(getOrderDailyIncome(claimModalOrder))}
              </div>
              <div className="text-xs font-bold text-slate-500 mb-6">
                (≈ +{formatUSD(nairaToUsd(getOrderDailyIncome(claimModalOrder), usdNairaRate))})
              </div>

              <button
                disabled={claimingOrderIds.has(claimModalOrder.id)}
                onClick={async () => {
                  if (claimingOrderIds.has(claimModalOrder.id)) return;
                  const currentClaimInfo = getOrderClaimInfo(claimModalOrder, Date.now());
                  if (!currentClaimInfo.isClaimable) {
                    setClaimModalOrder(null);
                    return;
                  }
                  soundService.playCoin();
                  setClaimingOrderIds((prev) => new Set(prev).add(claimModalOrder.id));
                  try {
                    await onClaimEarnings(claimModalOrder.id, getOrderDailyIncome(claimModalOrder));
                  } finally {
                    setClaimingOrderIds((prev) => {
                      const next = new Set(prev);
                      next.delete(claimModalOrder.id);
                      return next;
                    });
                    setClaimModalOrder(null);
                  }
                }}
                className="w-full py-3.5 bg-[#5252f6] hover:bg-[#4343f1] disabled:opacity-50 text-white font-bold text-sm rounded-full shadow-lg shadow-indigo-500/30 transition active:scale-95 flex items-center justify-center gap-2"
              >
                {claimingOrderIds.has(claimModalOrder.id) ? (
                  <span>Crediting Balance...</span>
                ) : (
                  <span>Accept with joy</span>
                )}
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Info Tooltip Modal */}
      <AnimatePresence>
        {infoTooltip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-slate-100 text-slate-900 space-y-4"
            >
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Info className="w-4 h-4" />
                  </div>
                  <h4 className="font-black text-slate-900 text-sm">{infoTooltip.title}</h4>
                </div>
                <button
                  onClick={() => setInfoTooltip(null)}
                  className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {infoTooltip.text}
              </p>
              <button
                onClick={() => setInfoTooltip(null)}
                className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-xs rounded-xl shadow-md shadow-purple-600/30 hover:opacity-95 transition"
              >
                Got it
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
