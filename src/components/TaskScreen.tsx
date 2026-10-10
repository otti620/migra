import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Gift, Users, ShoppingBag, ChevronRight, Share2, Award, Info } from 'lucide-react';
import { ActiveScreen, Order, User } from '../types';
import { soundService } from '../utils/audioService';
import { isUserReferredBy } from '../lib/firestoreService';
import { formatUSD, formatNaira, nairaToUsd } from '../utils/currency';

interface TaskScreenProps {
  user: User;
  allUsers?: User[];
  allOrders?: Order[];
  onNavigate: (screen: ActiveScreen) => void;
  onClaimTaskReward: (taskId: string, amount: number) => void;
  usdNairaRate?: number;
}

interface TaskItem {
  id: string;
  title: string;
  description: string;
  targetCount: number;
  rewardAmount: number;
  type: 'referrals' | 'buyers';
}

export function TaskScreen({
  user,
  allUsers = [],
  allOrders = [],
  onNavigate,
  onClaimTaskReward,
  usdNairaRate = 1500,
}: TaskScreenProps) {
  const [claimingId, setClaimingId] = useState<string | null>(null);

  const completed = user.completedTasks || [];

  const realL1 = allUsers.filter(
    (u) => isUserReferredBy(u, user) && u.phone !== user.phone
  );
  const realL2 = allUsers.filter((u) => {
    if (!u.referredBy || u.phone === user.phone) return false;
    return realL1.some((l1) => isUserReferredBy(u, l1));
  });
  const realL3 = allUsers.filter((u) => {
    if (!u.referredBy || u.phone === user.phone) return false;
    return realL2.some((l2) => isUserReferredBy(u, l2));
  });

  const allDownlines = [...realL1, ...realL2, ...realL3];

  const getUserOrderCount = (phone: string) => {
    if (!phone || !allOrders || allOrders.length === 0) return 0;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    if (!cleanPhone) return 0;
    return allOrders.filter((o) => {
      const op = (o.userPhone || '').replace(/[^0-9]/g, '');
      return op && (op === cleanPhone || cleanPhone.endsWith(op) || op.endsWith(cleanPhone));
    }).length;
  };

  const calculatedTeamSize = Math.max(user.teamSize || 0, allDownlines.length);
  const calculatedBuyerCount = Math.max(
    user.referralDepositsCount || 0,
    allDownlines.filter((u) => getUserOrderCount(u.phone) > 0).length
  );

  const teamSize = calculatedTeamSize > 0 ? calculatedTeamSize : (user.teamSize || 0);
  const buyerCount = calculatedBuyerCount > 0 ? calculatedBuyerCount : (user.referralDepositsCount || 0);

  const tasks: TaskItem[] = [
    {
      id: 'task-ref-1',
      title: 'Invite First Shareholder',
      description: 'Invite 1 registered investor using your referral invitation link',
      targetCount: 1,
      rewardAmount: 100,
      type: 'referrals',
    },
    {
      id: 'task-ref-3',
      title: 'Expand Shareholder Syndicate (3 Investors)',
      description: 'Invite 3 registered members to join your refinery investment syndicate',
      targetCount: 3,
      rewardAmount: 300,
      type: 'referrals',
    },
    {
      id: 'task-buyer-1',
      title: '1 Active Downline Shareholder',
      description: 'Have 1 downline team member subscribe to a Dangote share tranche (min ₦10,000)',
      targetCount: 1,
      rewardAmount: 500,
      type: 'buyers',
    },
    {
      id: 'task-buyer-3',
      title: '3 Active Share Tranche Buyers',
      description: 'Accumulate 3 downline team members with active refinery shareholdings',
      targetCount: 3,
      rewardAmount: 1500,
      type: 'buyers',
    },
    {
      id: 'task-buyer-5',
      title: '5 Active Downline Shareholders',
      description: 'Accumulate 5 active downline refinery equity holders',
      targetCount: 5,
      rewardAmount: 3000,
      type: 'buyers',
    },
    {
      id: 'task-buyer-10',
      title: '10 Active Downline Shareholders',
      description: 'Build an institutional syndicate of 10 active share investors',
      targetCount: 10,
      rewardAmount: 7500,
      type: 'buyers',
    },
    {
      id: 'task-buyer-20',
      title: '20 Active Downline Shareholders',
      description: 'Master Syndicate Leader: 20 active downline share tranche subscribers',
      targetCount: 20,
      rewardAmount: 15000,
      type: 'buyers',
    },
  ];

  const handleClaim = (task: TaskItem) => {
    soundService.playClick();
    setClaimingId(task.id);
    setTimeout(() => {
      onClaimTaskReward(task.id, task.rewardAmount);
      soundService.playCoin();
      setClaimingId(null);
    }, 400);
  };

  return (
    <div className="pb-28 pt-3 px-4 space-y-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <button
          onClick={() => { soundService.playClick(); onNavigate('home'); }}
          className="w-9 h-9 rounded-full bg-[#18153b] border border-purple-900 flex items-center justify-center text-slate-300"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-white">Downline Referral Tasks</h2>
        <button
          onClick={() => { soundService.playClick(); onNavigate('team'); }}
          className="text-xs text-purple-400 font-bold hover:underline flex items-center gap-1"
        >
          Team <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Network Overview Card */}
      <div className="bg-gradient-to-r from-purple-950 via-indigo-950 to-slate-900 border border-purple-500/40 rounded-3xl p-5 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 flex items-center justify-center text-white shadow-lg">
              <Award className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <span className="text-[10px] text-purple-300 uppercase tracking-widest font-bold block">
                Task Milestone Hub
              </span>
              <h3 className="text-base font-black text-white">Downline Commissions</h3>
            </div>
          </div>
          <button
            onClick={() => { soundService.playClick(); onNavigate('team'); }}
            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl text-white text-xs font-bold transition flex items-center gap-1"
          >
            <Share2 className="w-3.5 h-3.5" /> Invite
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-purple-900/60 text-xs">
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-purple-900/40 flex items-center gap-2.5">
            <Users className="w-5 h-5 text-purple-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">Total Referrals</span>
              <span className="font-extrabold text-white text-sm">{teamSize} Members</span>
            </div>
          </div>
          <div className="bg-slate-950/60 p-3 rounded-2xl border border-purple-900/40 flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-400 block">Product Buyers</span>
              <span className="font-extrabold text-emerald-300 text-sm">{buyerCount} Downlines</span>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-3 bg-blue-950/80 border border-blue-700/50 rounded-2xl text-xs text-blue-200 flex items-center gap-2.5 shadow-md">
        <Info className="w-5 h-5 text-amber-400 shrink-0" />
        <p className="leading-snug">
          Tasks strictly require verified downline activity. Downline share subscriptions must be active to unlock task rewards.
        </p>
      </div>

      {/* Tasks List */}
      <div className="space-y-3">
        {tasks.map((task) => {
          const isDone = completed.includes(task.id);
          const currentCount = task.type === 'referrals' ? teamSize : buyerCount;
          const isEligible = currentCount >= task.targetCount;
          const progressPercent = Math.min(100, Math.round((currentCount / task.targetCount) * 100));

          return (
            <div
              key={task.id}
              className={`bg-[#18153b] border rounded-3xl p-4 shadow-xl space-y-3 relative overflow-hidden transition ${
                isDone
                  ? 'border-emerald-500/30 opacity-90'
                  : isEligible
                  ? 'border-amber-400 bg-gradient-to-r from-purple-950/90 via-[#18153b] to-purple-950/90 shadow-amber-500/10'
                  : 'border-purple-900/40'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      task.type === 'referrals' 
                        ? 'bg-purple-950 text-purple-300 border-purple-800' 
                        : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                    }`}>
                      {task.type === 'referrals' ? 'Referral Task' : 'Buyer Task'}
                    </span>
                    {isDone && (
                      <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Claimed
                      </span>
                    )}
                  </div>
                  <h4 className="font-bold text-white text-sm">{task.title}</h4>
                  <p className="text-[11px] text-slate-400 leading-snug">{task.description}</p>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-xs text-amber-300 font-extrabold bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 rounded-xl block font-mono">
                    +{formatNaira(task.rewardAmount)} <span className="text-[10px] text-slate-300 font-sans">(≈ {formatUSD(nairaToUsd(task.rewardAmount, usdNairaRate))})</span>
                  </span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1 pt-1">
                <div className="flex justify-between text-[10px] font-bold">
                  <span className="text-slate-400">Progress</span>
                  <span className={isEligible ? 'text-amber-300' : 'text-purple-300'}>
                    {currentCount} / {task.targetCount} ({progressPercent}%)
                  </span>
                </div>
                <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isDone
                        ? 'bg-emerald-500'
                        : isEligible
                        ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                        : 'bg-gradient-to-r from-purple-600 to-indigo-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>

              {/* Action Button */}
              <div>
                {isDone ? (
                  <button
                    disabled
                    className="w-full py-2.5 bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 font-bold text-xs rounded-2xl flex items-center justify-center gap-1.5 cursor-default"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Reward Received
                  </button>
                ) : isEligible ? (
                  <button
                    onClick={() => handleClaim(task)}
                    disabled={claimingId === task.id}
                    className="w-full py-3 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black text-xs rounded-2xl shadow-lg shadow-amber-500/20 hover:opacity-95 transition flex items-center justify-center gap-2 animate-bounce"
                  >
                    <Gift className="w-4 h-4 fill-current" />
                    {claimingId === task.id ? 'Claiming...' : `Claim ₦${task.rewardAmount.toLocaleString()} Bonus Now!`}
                  </button>
                ) : (
                  <button
                    onClick={() => { soundService.playClick(); onNavigate('team'); }}
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-bold text-xs rounded-2xl transition flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-3.5 h-3.5 text-purple-400" /> Invite Friends to Complete Task
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
