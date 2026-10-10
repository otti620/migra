import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Copy, 
  Share2, 
  Check, 
  QrCode, 
  ChevronRight, 
  Search, 
  X,
  UserCheck,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Award,
  RefreshCw
} from 'lucide-react';
import { ActiveScreen, Order, User, Transaction } from '../types';
import { soundService } from '../utils/audioService';
import { isUserReferredBy } from '../lib/firestoreService';

interface TeamScreenProps {
  teamSize: number;
  referralCode: string;
  allUsers?: User[];
  allOrders?: Order[];
  currentUser?: User;
  transactions?: Transaction[];
  onNavigate: (screen: ActiveScreen) => void;
  onRefreshTeam?: () => Promise<void> | void;
  isRefreshingTeam?: boolean;
}

export function TeamScreen({
  teamSize,
  referralCode,
  allUsers = [],
  allOrders = [],
  currentUser,
  transactions = [],
  onNavigate,
  onRefreshTeam,
  isRefreshingTeam = false,
}: TeamScreenProps) {
  const [copied, setCopied] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [detailsLevelTab, setDetailsLevelTab] = useState<1 | 2 | 3>(1);
  const [searchDownline, setSearchDownline] = useState('');
  const [showQrModal, setShowQrModal] = useState(false);

  const cleanRef = (referralCode || currentUser?.referralCode || 'DANGOTE888').trim().toUpperCase();

  const inviteUrl = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}?ref=${cleanRef}&screen=signup`
    : `https://dangote-refinery.com?ref=${cleanRef}&screen=signup`;

  const fallbackCopyText = (text: string) => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
    } catch (err) {
      console.warn('Copy command failed:', err);
    }
    document.body.removeChild(textArea);
  };

  const handleCopy = () => {
    soundService.playClick();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(inviteUrl).catch(() => {
        fallbackCopyText(inviteUrl);
      });
    } else {
      fallbackCopyText(inviteUrl);
    }
    setCopied(true);
    soundService.playSuccess();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleCopyCode = () => {
    soundService.playClick();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cleanRef).catch(() => {
        fallbackCopyText(cleanRef);
      });
    } else {
      fallbackCopyText(cleanRef);
    }
    setCopied(true);
    soundService.playSuccess();
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShare = async () => {
    soundService.playClick();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Dangote Petroleum Refinery PLC IPO Portal',
          text: `Join Dangote Petroleum Refinery PLC Shareholder Syndicate using my invitation code ${cleanRef} to claim your free welcome share grant and daily energy dividends!`,
          url: inviteUrl,
        });
        soundService.playSuccess();
        return;
      } catch (err) {
        // Fallback
      }
    }
    handleCopy();
  };

  // Extract tier members & commissions from transactions
  const commRecords = useMemo(() => {
    if (!transactions || !currentUser) {
      return { 
        l1Phones: new Set<string>(), 
        l2Phones: new Set<string>(), 
        l3Phones: new Set<string>(), 
        totalCommSum: 0,
        l1Sum: 0,
        l2Sum: 0,
        l3Sum: 0,
      };
    }
    const cleanUserPhone = (currentUser.phone || '').replace(/[^0-9]/g, '');
    
    // Combine transactions and currentUser.records (to catch all commission logs)
    const allCommissionItems: Array<{ amount: number; description: string }> = [];
    const seenCommKeys = new Set<string>();

    transactions.forEach(t => {
      const tp = (t.userPhone || '').replace(/[^0-9]/g, '');
      const desc = t.description || '';
      if ((t.type === 'Team Commission' || desc.toLowerCase().includes('commission')) &&
          (!tp || tp === cleanUserPhone || cleanUserPhone.endsWith(tp) || tp.endsWith(cleanUserPhone))) {
        const key = `${t.amount}_${desc}`;
        if (!seenCommKeys.has(key)) {
          seenCommKeys.add(key);
          allCommissionItems.push({ amount: t.amount || 0, description: desc });
        }
      }
    });

    (currentUser?.records || []).forEach(r => {
      const rType = (r.type || '').toLowerCase();
      const desc = r.details || r.title || '';
      if (rType === 'commission' || desc.toLowerCase().includes('commission') || desc.toLowerCase().includes('affiliate')) {
        const key = `${r.amount}_${desc}`;
        if (!seenCommKeys.has(key)) {
          seenCommKeys.add(key);
          allCommissionItems.push({ amount: r.amount || 0, description: desc });
        }
      }
    });

    const l1Phones = new Set<string>();
    const l2Phones = new Set<string>();
    const l3Phones = new Set<string>();
    let totalCommSum = 0;
    let l1Sum = 0;
    let l2Sum = 0;
    let l3Sum = 0;

    allCommissionItems.forEach(t => {
      const amt = t.amount || 0;
      totalCommSum += amt;
      const desc = (t.description || '').toLowerCase();
      const phoneMatch = desc.match(/(?:member|from)\s+([0-9+\-\s]{7,})/i);
      const extractedPhone = phoneMatch ? phoneMatch[1].replace(/[^0-9]/g, '') : '';

      if (desc.includes('l1') || desc.includes('level 1') || desc.includes('15%') || desc.includes('25%')) {
        if (extractedPhone) l1Phones.add(extractedPhone);
        l1Sum += amt;
      } else if (desc.includes('l2') || desc.includes('level 2') || desc.includes('3%')) {
        if (extractedPhone) l2Phones.add(extractedPhone);
        l2Sum += amt;
      } else if (desc.includes('l3') || desc.includes('level 3') || desc.includes('1%')) {
        if (extractedPhone) l3Phones.add(extractedPhone);
        l3Sum += amt;
      } else {
        l1Sum += amt;
      }
    });

    return { l1Phones, l2Phones, l3Phones, totalCommSum, l1Sum, l2Sum, l3Sum };
  }, [transactions, currentUser]);

  // Find real registered downlines from allUsers
  const realL1 = useMemo(() => {
    return allUsers.filter(
      (u) => currentUser && isUserReferredBy(u, currentUser) && u.phone !== currentUser.phone
    );
  }, [allUsers, currentUser]);

  const realL2 = useMemo(() => {
    return allUsers.filter((u) => {
      if (!u.referredBy || (currentUser && u.phone === currentUser.phone)) return false;
      return realL1.some((l1) => isUserReferredBy(u, l1));
    });
  }, [allUsers, currentUser, realL1]);

  const realL3 = useMemo(() => {
    return allUsers.filter((u) => {
      if (!u.referredBy || (currentUser && u.phone === currentUser.phone)) return false;
      return realL2.some((l2) => isUserReferredBy(u, l2));
    });
  }, [allUsers, currentUser, realL2]);

  // Separate downlines from currentUser.teamMembers array
  const directTeamMembers = currentUser?.teamMembers || [];
  const teamL1 = directTeamMembers.filter(m => !m.level || m.level === 1);
  const teamL2 = directTeamMembers.filter(m => m.level === 2);
  const teamL3 = directTeamMembers.filter(m => m.level === 3);

  // Real Team sizes without fake inflation or dropouts
  const userTeamSizeProp = currentUser?.teamSize || teamSize || 0;
  let l1Count = Math.max(realL1.length, teamL1.length, commRecords.l1Phones.size);
  let l2Count = Math.max(realL2.length, teamL2.length, commRecords.l2Phones.size);
  let l3Count = Math.max(realL3.length, teamL3.length, commRecords.l3Phones.size);

  const rawTotalPeople = l1Count + l2Count + l3Count;
  if (userTeamSizeProp > rawTotalPeople && l1Count === 0) {
    l1Count = userTeamSizeProp;
  }
  
  // Real total number of downlines
  const displayTotalPeople = Math.max(rawTotalPeople, userTeamSizeProp, directTeamMembers.length);

  // Real total commissions / Team Income
  const totalCommissions = Number(currentUser?.totalCommissions || 0) > 0
    ? Number(currentUser?.totalCommissions || 0)
    : commRecords.totalCommSum;

  // Real earnings per level
  const l1Earned = commRecords.l1Sum > 0 ? commRecords.l1Sum : (totalCommissions > 0 && commRecords.totalCommSum === 0 ? totalCommissions : 0);
  const l2Earned = commRecords.l2Sum;
  const l3Earned = commRecords.l3Sum;

  const maskPhone = (phone: string) => {
    if (!phone) return 'Private';
    const clean = phone.replace(/\s+/g, '');
    if (clean.length > 7) {
      return `${clean.slice(0, 4)}***${clean.slice(-3)}`;
    }
    return clean;
  };

  // Construct downline details list for the modal (100% Real downlines only)
  const downlineMembersList = useMemo(() => {
    const list: Array<{
      id: string;
      phone: string;
      level: 1 | 2 | 3;
      bonusRate: string;
      date: string;
      spentAmount: number;
    }> = [];
    const addedPhones = new Set<string>();

    // Real Level 1 from allUsers
    realL1.forEach((u, i) => {
      const cleanP = (u.phone || '').replace(/[^0-9]/g, '');
      if (cleanP) addedPhones.add(cleanP);
      list.push({
        id: u.id || `l1-${i}`,
        phone: u.phone,
        level: 1,
        bonusRate: '15%',
        date: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active',
        spentAmount: u.teamTotalInvestment || 0,
      });
    });

    // Real Level 2 from allUsers
    realL2.forEach((u, i) => {
      const cleanP = (u.phone || '').replace(/[^0-9]/g, '');
      if (cleanP) addedPhones.add(cleanP);
      list.push({
        id: u.id || `l2-${i}`,
        phone: u.phone,
        level: 2,
        bonusRate: '3%',
        date: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active',
        spentAmount: u.teamTotalInvestment || 0,
      });
    });

    // Real Level 3 from allUsers
    realL3.forEach((u, i) => {
      const cleanP = (u.phone || '').replace(/[^0-9]/g, '');
      if (cleanP) addedPhones.add(cleanP);
      list.push({
        id: u.id || `l3-${i}`,
        phone: u.phone,
        level: 3,
        bonusRate: '1%',
        date: u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active',
        spentAmount: u.teamTotalInvestment || 0,
      });
    });

    // Also merge any members stored in currentUser.teamMembers array
    (currentUser?.teamMembers || []).forEach((m, idx) => {
      const cleanP = (m.phone || '').replace(/[^0-9]/g, '');
      if (!addedPhones.has(cleanP)) {
        if (cleanP) addedPhones.add(cleanP);
        const lvl = (m.level === 2 ? 2 : m.level === 3 ? 3 : 1) as 1 | 2 | 3;
        list.push({
          id: m.id || `tm-${idx}`,
          phone: m.phone,
          level: lvl,
          bonusRate: lvl === 1 ? '15%' : lvl === 2 ? '3%' : '1%',
          date: m.joinDate || 'Active',
          spentAmount: m.invested || 0,
        });
      }
    });

    return list;
  }, [realL1, realL2, realL3, currentUser]);

  const filteredMembers = downlineMembersList.filter(m => 
    m.level === detailsLevelTab &&
    (!searchDownline || m.phone.toLowerCase().includes(searchDownline.toLowerCase()))
  );

  return (
    <div className="min-h-screen bg-[#030b1e] text-slate-100 pb-28 pt-4 px-3.5 max-w-md mx-auto font-sans antialiased space-y-3.5">
      {/* 1. TOP CARD: "My team" + "Team details >>" + 3 Level Rows */}
      <div className="bg-gradient-to-br from-[#0c1f4d] via-[#091b42] to-[#061330] rounded-3xl p-5 shadow-2xl border border-blue-500/40 space-y-4">
        {/* Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-2xl bg-blue-500/20 border border-blue-400/30 text-blue-400 flex items-center justify-center shadow-inner">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h1 className="text-lg font-black text-white tracking-tight flex items-center gap-2">
                <span>My team</span>
                {onRefreshTeam && (
                  <button
                    onClick={() => {
                      soundService.playClick();
                      onRefreshTeam();
                    }}
                    disabled={isRefreshingTeam}
                    className="p-1 rounded-lg bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700/40 text-blue-300 hover:text-white transition active:scale-95 disabled:opacity-50"
                    title="Fetch latest team network on request"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingTeam ? 'animate-spin text-amber-400' : ''}`} />
                  </button>
                )}
              </h1>
            </div>
          </div>

          <button
            onClick={() => {
              soundService.playClick();
              setShowDetailsModal(true);
            }}
            className="bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black px-4 py-1.5 rounded-full shadow-md shadow-red-600/30 border border-red-400/40 transition active:scale-95 flex items-center gap-1"
          >
            <span>Team details &gt;&gt;</span>
          </button>
        </div>

        {/* 3 Level Rows */}
        <div className="space-y-4 pt-1">
          {/* Row 1: LV1 */}
          <div className="flex items-center justify-between border-b border-blue-900/60 pb-3">
            {/* Circle Badge */}
            <div className="w-14 h-14 rounded-full border border-blue-500/40 bg-[#05112e] flex items-center justify-center font-black text-amber-400 text-sm shadow-inner shrink-0">
              LV1
            </div>

            {/* Column 1: Buy Commission */}
            <div className="text-center flex-1">
              <div className="text-base font-black text-white">15%</div>
              <div className="text-[11px] text-blue-200/70 font-medium mt-0.5">
                Buy commission
              </div>
            </div>

            {/* Column 2: Valid User */}
            <div className="text-center flex-1">
              <div className="text-base font-black text-white">{l1Count}</div>
              <div className="text-[11px] text-blue-200/70 font-medium mt-0.5">
                Valid user
              </div>
            </div>

            {/* Column 3: Bonus */}
            <div className="text-center flex-1">
              <div className="text-base font-black text-amber-400 font-mono">
                ₦{l1Earned.toFixed(2)}
              </div>
              <div className="text-[11px] text-blue-200/70 font-medium mt-0.5">
                Bonus
              </div>
            </div>
          </div>

          {/* Row 2: LV2 */}
          <div className="flex items-center justify-between border-b border-blue-900/60 pb-3">
            {/* Circle Badge */}
            <div className="w-14 h-14 rounded-full border border-blue-500/40 bg-[#05112e] flex items-center justify-center font-black text-amber-400 text-sm shadow-inner shrink-0">
              LV2
            </div>

            {/* Column 1: Commission Rate */}
            <div className="text-center flex-1">
              <div className="text-base font-black text-white">3%</div>
              <div className="text-[11px] text-blue-200/70 font-medium mt-0.5">
                Commission Rate
              </div>
            </div>

            {/* Column 2: Valid User */}
            <div className="text-center flex-1">
              <div className="text-base font-black text-white">{l2Count}</div>
              <div className="text-[11px] text-blue-200/70 font-medium mt-0.5">
                Valid user
              </div>
            </div>

            {/* Column 3: Bonus */}
            <div className="text-center flex-1">
              <div className="text-base font-black text-amber-400 font-mono">
                ₦{l2Earned.toFixed(2)}
              </div>
              <div className="text-[11px] text-blue-200/70 font-medium mt-0.5">
                Bonus
              </div>
            </div>
          </div>

          {/* Row 3: LV3 */}
          <div className="flex items-center justify-between pt-1">
            {/* Circle Badge */}
            <div className="w-14 h-14 rounded-full border border-blue-500/40 bg-[#05112e] flex items-center justify-center font-black text-amber-400 text-sm shadow-inner shrink-0">
              LV3
            </div>

            {/* Column 1: Commission Rate */}
            <div className="text-center flex-1">
              <div className="text-base font-black text-white">1%</div>
              <div className="text-[11px] text-blue-200/70 font-medium mt-0.5">
                Commission Rate
              </div>
            </div>

            {/* Column 2: Valid User */}
            <div className="text-center flex-1">
              <div className="text-base font-black text-white">{l3Count}</div>
              <div className="text-[11px] text-blue-200/70 font-medium mt-0.5">
                Valid user
              </div>
            </div>

            {/* Column 3: Bonus */}
            <div className="text-center flex-1">
              <div className="text-base font-black text-amber-400 font-mono">
                ₦{l3Earned.toFixed(2)}
              </div>
              <div className="text-[11px] text-blue-200/70 font-medium mt-0.5">
                Bonus
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. TWO PLATFORM STAT CARDS SIDE BY SIDE: Number of people & Team income */}
      <div className="grid grid-cols-2 gap-3.5 my-3.5">
        {/* Left Card: Number of people */}
        <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 text-white rounded-2xl p-4 text-center shadow-xl border border-blue-400/40 flex flex-col items-center justify-center min-h-[92px]">
          <div className="text-2xl font-black font-sans leading-none tracking-tight text-white">
            {displayTotalPeople}
          </div>
          <div className="text-xs font-bold text-blue-100 mt-1.5">
            Number of people
          </div>
        </div>

        {/* Right Card: Team income */}
        <div className="bg-gradient-to-br from-red-700 via-rose-600 to-red-800 text-white rounded-2xl p-4 text-center shadow-xl border border-red-400/40 flex flex-col items-center justify-center min-h-[92px]">
          <div className="text-2xl font-black font-sans leading-none tracking-tight text-amber-300 font-mono">
            ₦ {totalCommissions.toFixed(2)}
          </div>
          <div className="text-xs font-bold text-rose-100 mt-1.5">
            Team income
          </div>
        </div>
      </div>

      {/* 3. INVITATION BONUS CARD (Deep Navy Platform Style with Yellow Accent Bar) */}
      <div className="bg-gradient-to-br from-[#0c1f4d] via-[#091b42] to-[#071536] border border-blue-500/40 text-white rounded-2xl p-5 shadow-xl space-y-3.5">
        {/* Header with yellow vertical accent bar */}
        <div className="flex items-center">
          <span className="w-1.5 h-4 bg-amber-400 rounded-full mr-2.5 inline-block"></span>
          <h2 className="text-amber-400 font-black text-base tracking-wide">
            Invitation bonus
          </h2>
        </div>

        {/* Content Paragraphs */}
        <div className="space-y-3 text-xs text-blue-100/90 leading-relaxed font-normal">
          <p>
            When a friend you invite registers and invests, you will immediately receive a cash reward of 15% of the friend's investment amount.
          </p>

          <p>
            When your Level 2 team members invest, you will receive a 3% cash bonus.
          </p>

          <p>
            When your Level 3 team members invest, you will receive a 1% cash bonus.
          </p>

          <p className="text-amber-300 font-bold leading-relaxed pt-1">
            Once your team member invests, the cash bonus is instantly credited to your account balance and you can withdraw it right away.
          </p>
        </div>
      </div>

      {/* 4. FAST INVITATION CODE & LINK BAR */}
      <div className="bg-[#081738]/90 border border-blue-900/60 rounded-2xl p-4 shadow-xl space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-blue-200 uppercase tracking-wider flex items-center gap-1.5">
            <Share2 className="w-4 h-4 text-amber-400" />
            Your Invitation Code
          </span>
          <span className="font-mono text-xs font-black text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-lg border border-amber-500/30">
            {cleanRef}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopyCode}
            className="flex-1 bg-blue-950/80 hover:bg-blue-900 border border-blue-700/50 text-blue-200 text-xs font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 active:scale-95"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'Copied Code!' : 'Copy Code'}</span>
          </button>

          <button
            onClick={handleCopy}
            className="flex-1 bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-500 hover:to-rose-500 text-white text-xs font-black py-2.5 px-3 rounded-xl shadow-lg shadow-red-600/30 border border-red-400/40 transition flex items-center justify-center gap-1.5 active:scale-95"
          >
            <Copy className="w-4 h-4" />
            <span>Copy Link</span>
          </button>

          <button
            onClick={handleShare}
            className="w-10 h-10 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white rounded-xl flex items-center justify-center transition active:scale-95 shadow-sm shrink-0"
            title="Share with WhatsApp / Contacts"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 5. "Team details >>" Modal Drawer */}
      {showDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-0 sm:p-4">
          <div className="w-full max-w-md bg-gradient-to-b from-[#0a1738] to-[#040b1e] border border-blue-600/40 rounded-t-3xl sm:rounded-3xl p-5 shadow-2xl text-white space-y-4 max-h-[85vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-blue-900/60 pb-3">
              <div>
                <h3 className="text-base font-black text-white">
                  Team Member Details
                </h3>
                <p className="text-[11px] text-blue-300">
                  Total Downlines: {displayTotalPeople} Members (₦{totalCommissions.toFixed(2)} Earned)
                </p>
              </div>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 flex items-center justify-center text-slate-300 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Level Tabs */}
            <div className="flex items-center gap-2 p-1 bg-[#06112c] border border-blue-900/60 rounded-2xl">
              {( [1, 2, 3] as const ).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => {
                    soundService.playClick();
                    setDetailsLevelTab(lvl);
                  }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                    detailsLevelTab === lvl
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md border border-blue-400/40 font-black'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <span>Level {lvl}</span>
                  <span className="text-[10px] opacity-80">
                    ({lvl === 1 ? '15%' : lvl === 2 ? '3%' : '1%'})
                  </span>
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchDownline}
                onChange={(e) => setSearchDownline(e.target.value)}
                placeholder="Search phone number..."
                className="w-full bg-[#06112c] border border-blue-900/60 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-400"
              />
            </div>

            {/* Member List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 min-h-[220px]">
              {filteredMembers.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No members found in Level {detailsLevelTab}.
                </div>
              ) : (
                filteredMembers.map((m, idx) => (
                  <div
                    key={`${m.phone}_${m.id}_${idx}`}
                    className="p-3 rounded-2xl border border-blue-900/50 bg-[#081738]/90 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-white">
                          {maskPhone(m.phone)}
                        </span>
                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                          Valid
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        Joined: {m.date}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-black text-amber-400 font-mono">
                        {m.bonusRate} Commission
                      </div>
                      <div className="text-[10px] text-blue-200/80 font-mono">
                        Invest: ₦{m.spentAmount.toLocaleString()}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer Close */}
            <button
              onClick={() => setShowDetailsModal(false)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 text-white font-black text-xs shadow-lg shadow-blue-600/30 transition"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
