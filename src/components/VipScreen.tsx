import { ArrowLeft, Crown, CheckCircle2, Users, ShoppingBag, Sparkles, Lock } from 'lucide-react';
import { ActiveScreen } from '../types';

interface VipScreenProps {
  currentVip: number;
  teamSize: number;
  activeProductsCount: number;
  onNavigate: (screen: ActiveScreen) => void;
  onUpgradeVip: (level: number) => void;
}

export function VipScreen({ currentVip, teamSize, activeProductsCount, onNavigate, onUpgradeVip }: VipScreenProps) {
  const vipLevels = [
    { level: 1, reqReferrals: 0, reqProducts: 0, commission: '1.5%', bonus: 'Base Shareholder Allotment Tier' },
    { level: 2, reqReferrals: 2, reqProducts: 1, commission: '2.5%', bonus: '+5% Extra Daily PMS Dividend' },
    { level: 3, reqReferrals: 5, reqProducts: 3, commission: '4.0%', bonus: '+10% Extra Daily Refinery Dividend' },
    { level: 4, reqReferrals: 10, reqProducts: 5, commission: '6.5%', bonus: '+15% Extra Daily Petrochemical Yield' },
    { level: 5, reqReferrals: 20, reqProducts: 10, commission: '10.0%', bonus: '+25% Extra Daily Dividend & VIP Syndicate Account Manager' },
  ];

  return (
    <div className="pb-24 pt-3 px-4 space-y-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button onClick={() => onNavigate('home')} className="w-9 h-9 rounded-full bg-[#081738] border border-blue-900 flex items-center justify-center text-slate-300">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-white">Shareholder VIP Tiers</h2>
        <div className="w-9"></div>
      </div>

      {/* User Progress Stats Header */}
      <div className="bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-900 border border-amber-500/40 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <Crown className="w-6 h-6 fill-slate-950" />
            </div>
            <div>
              <span className="text-[10px] text-amber-300 uppercase tracking-widest font-bold">Investor Tier</span>
              <h3 className="text-lg font-black text-white">VIP Level {currentVip}</h3>
            </div>
          </div>
          <span className="text-xs font-bold text-amber-300 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-500/30">
            Active Allottee
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
          <div className="bg-white/5 p-2.5 rounded-2xl border border-white/10 flex items-center gap-2">
            <Users className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">Referral Network</span>
              <span className="font-bold text-white">{teamSize} Members</span>
            </div>
          </div>
          <div className="bg-white/5 p-2.5 rounded-2xl border border-white/10 flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">Subscribed Units</span>
              <span className="font-bold text-white">{activeProductsCount} Tranches</span>
            </div>
          </div>
        </div>
      </div>

      {/* Requirement Notice */}
      <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl text-[11px] text-amber-200 flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
        <span>VIP upgrades are 100% unlocked by accumulating referrals or purchasing active Dangote share tranches!</span>
      </div>

      {/* VIP Cards */}
      <div className="space-y-3">
        {vipLevels.map((vip) => {
          const isCurrent = currentVip === vip.level;
          const isUnlocked = currentVip >= vip.level;
          const meetsRef = teamSize >= vip.reqReferrals;
          const meetsProd = activeProductsCount >= vip.reqProducts;
          const isEligibleToUpgrade = (meetsRef || meetsProd) && currentVip < vip.level;

          return (
            <div 
              key={vip.level} 
              className={`bg-[#0a183d] border rounded-3xl p-5 shadow-xl relative overflow-hidden transition ${
                isCurrent 
                  ? 'border-amber-400 bg-gradient-to-r from-blue-950/90 via-[#0a183d] to-blue-950/90 shadow-amber-500/10' 
                  : isUnlocked
                  ? 'border-emerald-500/40'
                  : 'border-blue-900/40'
              }`}
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black shadow-md ${
                    isCurrent || isUnlocked
                      ? 'bg-gradient-to-tr from-amber-400 to-amber-600 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }`}>
                    <Crown className="w-5 h-5 fill-current" />
                  </div>
                  <div>
                    <h3 className="font-black text-white text-base flex items-center gap-1.5">
                      VIP Level {vip.level}
                      {isCurrent && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                    </h3>
                    <span className="text-[10px] text-blue-300 font-medium">{vip.bonus}</span>
                  </div>
                </div>

                <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                  isCurrent 
                    ? 'bg-amber-400 text-slate-950 shadow-md' 
                    : isUnlocked
                    ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-500/30'
                    : 'bg-slate-900 text-slate-400'
                }`}>
                  {isCurrent ? 'Current Tier' : isUnlocked ? 'Unlocked' : 'Locked'}
                </span>
              </div>

              {/* Requirement Meters */}
              <div className="bg-slate-900/70 p-3 rounded-2xl border border-slate-800 space-y-2 text-xs mb-3">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Users className="w-3 h-3 text-blue-400" /> Shareholder Referrals:
                  </span>
                  <span className={`font-bold ${meetsRef ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {teamSize} / {vip.reqReferrals} {meetsRef && '✓'}
                  </span>
                </div>

                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400 flex items-center gap-1">
                    <ShoppingBag className="w-3 h-3 text-emerald-400" /> Subscribed Share Tranches:
                  </span>
                  <span className={`font-bold ${meetsProd ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {activeProductsCount} / {vip.reqProducts} {meetsProd && '✓'}
                  </span>
                </div>

                <div className="pt-1.5 border-t border-slate-800 flex justify-between text-[11px]">
                  <span className="text-blue-300">Daily Task Dividend:</span>
                  <span className="font-extrabold text-amber-300">{vip.commission}</span>
                </div>
              </div>

              {isCurrent ? (
                <div className="w-full py-2.5 bg-amber-400/10 border border-amber-400/30 text-amber-300 text-xs font-bold rounded-xl text-center">
                  Active Shareholder Privileges Applied
                </div>
              ) : isEligibleToUpgrade ? (
                <button
                  onClick={() => onUpgradeVip(vip.level)}
                  className="w-full py-2.5 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-lg hover:brightness-110 transition flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-4 h-4 fill-slate-950" /> Claim Upgrade to VIP {vip.level}
                </button>
              ) : !isUnlocked ? (
                <div className="w-full py-2.5 bg-slate-900/60 border border-slate-800 text-slate-400 text-[11px] font-medium rounded-xl flex items-center justify-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  Invite {Math.max(0, vip.reqReferrals - teamSize)} more referrals OR subscribe {Math.max(0, vip.reqProducts - activeProductsCount)} more tranches
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
