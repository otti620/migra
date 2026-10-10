import React, { useState } from 'react';
import { 
  Search, Users, DollarSign, Crown, Lock, Unlock, 
  Trash2, Ban, ShieldCheck, Edit3, Plus, ArrowUpRight, 
  CheckCircle2, AlertCircle, Copy, Building2, UserPlus, Coins, RefreshCw
} from 'lucide-react';
import { User, Product, Order, Transaction, PendingDeposit, PendingWithdrawalReq } from '../../types';

interface AdminUsersTabProps {
  allUsers: User[];
  allOrders: Order[];
  allTransactions: Transaction[];
  pendingDeposits: PendingDeposit[];
  pendingWithdrawals: PendingWithdrawalReq[];
  products: Product[];
  selectedUserPhone: string;
  onSelectUserPhone: (phone: string) => void;
  onCreditUser: (phone: string, amount: number) => void;
  onSetUserVip: (phone: string, vipLevel: number) => void;
  onToggleUserBan?: (phone: string, isBanned: boolean) => void;
  onToggleUserFreeze?: (phone: string, isFrozen: boolean) => void;
  onBanAndDeleteUser?: (phone: string) => void;
  onUpdateUserBank?: (phone: string, bank: { bankName: string; accountNumber: string; accountName: string }) => void;
  onUpdateUserTeam?: (phone: string, teamSize: number, referralDepositsCount: number, referredBy: string, totalCommissions: number, referralCount: number, newPhone: string, teamTotalInvestment: number, referralDepositAmount: number, referralCode: string) => void;
  onAddDownlineUser?: (referrerPhone: string, referrerCode: string, newDownlinePhone: string, registrationAmount: number) => void;
  onAllocateProduct?: (userPhone: string, product: Product, quantity: number) => void;
  usdNairaRate?: number;
  onRefresh?: () => void;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  allUsers,
  allOrders,
  allTransactions,
  pendingDeposits,
  pendingWithdrawals,
  products,
  selectedUserPhone,
  onSelectUserPhone,
  onCreditUser,
  onSetUserVip,
  onToggleUserBan,
  onToggleUserFreeze,
  onBanAndDeleteUser,
  onUpdateUserBank,
  onUpdateUserTeam,
  onAddDownlineUser,
  onAllocateProduct,
  usdNairaRate = 1500,
  onRefresh
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [customCreditVal, setCustomCreditVal] = useState('');
  const [actionMsg, setActionMsg] = useState('');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Bank Form state
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankNameInput, setBankNameInput] = useState('');
  const [accNumInput, setAccNumInput] = useState('');
  const [accNameInput, setAccNameInput] = useState('');

  // Team Form state
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamSizeInput, setTeamSizeInput] = useState('0');
  const [refDepCountInput, setRefDepCountInput] = useState('0');
  const [referredByInput, setReferredByInput] = useState('');
  const [commissionsInput, setCommissionsInput] = useState('0');
  const [teamInvestInput, setTeamInvestInput] = useState('0');
  const [userPhoneEditInput, setUserPhoneEditInput] = useState('');

  // Downline Inject Form state
  const [showDownlineModal, setShowDownlineModal] = useState(false);
  const [newDownlinePhone, setNewDownlinePhone] = useState('');
  const [downlineRegAmount, setDownlineRegAmount] = useState('50000');

  // Allocate Share state
  const [showAllocModal, setShowAllocModal] = useState(false);
  const [selectedAllocProdId, setSelectedAllocProdId] = useState(products[0]?.id || '');
  const [allocQty, setAllocQty] = useState(1);

  // Deduplicate users in case of duplicate records from Firestore / legacy migrations
  const uniqueUsers = React.useMemo(() => {
    const map = new Map<string, User>();
    for (const u of allUsers) {
      if (!u) continue;
      const cleanPhone = (u.phone || '').replace(/[^0-9]/g, '');
      const key = cleanPhone || (u.id || '').trim();
      if (!key) continue;

      if (!map.has(key)) {
        map.set(key, u);
      } else {
        const existing = map.get(key)!;
        const isUNewer = (u as any).updatedAt && (existing as any).updatedAt
          ? (u as any).updatedAt >= (existing as any).updatedAt
          : ((u.records || []).length >= (existing.records || []).length);
        const mergedBalance = isUNewer && u.balance !== undefined ? u.balance : (existing.balance !== undefined ? existing.balance : u.balance);

        map.set(key, {
          ...existing,
          ...u,
          phone: existing.phone || u.phone,
          balance: mergedBalance,
          accruedIncome: Math.max(existing.accruedIncome || 0, u.accruedIncome || 0),
          vipLevel: Math.max(existing.vipLevel || 0, u.vipLevel || 0),
          teamSize: Math.max(existing.teamSize || 0, u.teamSize || 0, (u.teamMembers || []).length, (existing.teamMembers || []).length),
          totalCommissions: Math.max(existing.totalCommissions || 0, u.totalCommissions || 0),
          referralDepositsCount: Math.max(existing.referralDepositsCount || 0, u.referralDepositsCount || 0),
          bankAccount: u.bankAccount || existing.bankAccount,
          inviteCode: existing.inviteCode || u.inviteCode || existing.referralCode || u.referralCode,
          referralCode: existing.referralCode || u.referralCode || existing.inviteCode || u.inviteCode,
          records: [...(existing.records || []), ...(u.records || [])],
          teamMembers: [...(existing.teamMembers || []), ...(u.teamMembers || [])],
        });
      }
    }
    return Array.from(map.values());
  }, [allUsers]);

  // Filtered list
  const filteredUsers = uniqueUsers.filter(u => 
    !searchTerm || 
    (u.phone && u.phone.toLowerCase().includes(searchTerm.toLowerCase())) || 
    (u.referralCode && u.referralCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (u.id && u.id.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const activeUser = uniqueUsers.find(u => u.phone === selectedUserPhone) || filteredUsers[0] || uniqueUsers[0];

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleQuickCredit = (amount: number) => {
    if (!activeUser?.phone) return;
    onCreditUser(activeUser.phone, amount);
    setActionMsg(`Successfully ${amount > 0 ? 'credited' : 'deducted'} ₦${Math.abs(amount).toLocaleString()} to ${activeUser.phone}!`);
    setTimeout(() => setActionMsg(''), 4000);
  };

  const handleCustomCreditSubmit = (isDeduct: boolean = false) => {
    const val = parseFloat(customCreditVal);
    if (isNaN(val) || val <= 0 || !activeUser?.phone) return;
    const finalAmt = isDeduct ? -val : val;
    onCreditUser(activeUser.phone, finalAmt);
    setActionMsg(`Successfully ${isDeduct ? 'deducted' : 'credited'} ₦${val.toLocaleString()} to ${activeUser.phone}!`);
    setCustomCreditVal('');
    setTimeout(() => setActionMsg(''), 4000);
  };

  const openBankForm = () => {
    if (!activeUser) return;
    setBankNameInput(activeUser.bankAccount?.bankName || '');
    setAccNumInput(activeUser.bankAccount?.accountNumber || '');
    setAccNameInput(activeUser.bankAccount?.accountName || '');
    setShowBankModal(true);
  };

  const saveBankDetails = () => {
    if (!activeUser?.phone || !onUpdateUserBank) return;
    onUpdateUserBank(activeUser.phone, {
      bankName: bankNameInput,
      accountNumber: accNumInput,
      accountName: accNameInput
    });
    setShowBankModal(false);
    setActionMsg(`Updated bank account for ${activeUser.phone}!`);
    setTimeout(() => setActionMsg(''), 4000);
  };

  const openTeamForm = () => {
    if (!activeUser) return;
    setTeamSizeInput((activeUser.teamSize || 0).toString());
    setRefDepCountInput((activeUser.referralDepositsCount || 0).toString());
    setReferredByInput(activeUser.referredBy || '');
    setCommissionsInput((activeUser.totalCommissions || 0).toString());
    setTeamInvestInput((activeUser.teamTotalInvestment || 0).toString());
    setUserPhoneEditInput(activeUser.phone || '');
    setShowTeamModal(true);
  };

  const saveTeamDetails = () => {
    if (!activeUser?.phone || !onUpdateUserTeam) return;
    onUpdateUserTeam(
      activeUser.phone,
      parseInt(teamSizeInput) || 0,
      parseInt(refDepCountInput) || 0,
      referredByInput,
      parseFloat(commissionsInput) || 0,
      parseInt(teamSizeInput) || 0,
      userPhoneEditInput || activeUser.phone,
      parseFloat(teamInvestInput) || 0,
      0,
      activeUser.referralCode || ''
    );
    setShowTeamModal(false);
    setActionMsg(`Updated team data & phone for ${activeUser.phone}!`);
    setTimeout(() => setActionMsg(''), 4000);
  };

  const handleInjectDownline = () => {
    if (!activeUser?.phone || !newDownlinePhone.trim() || !onAddDownlineUser) return;
    onAddDownlineUser(activeUser.phone, activeUser.referralCode, newDownlinePhone.trim(), parseFloat(downlineRegAmount) || 0);
    setShowDownlineModal(false);
    setNewDownlinePhone('');
    setActionMsg(`Injected downline ${newDownlinePhone} for referrer ${activeUser.phone}!`);
    setTimeout(() => setActionMsg(''), 4000);
  };

  const handleConfirmAllocate = () => {
    if (!activeUser?.phone || !selectedAllocProdId || !onAllocateProduct) return;
    const prod = products.find(p => p.id === selectedAllocProdId);
    if (!prod) return;
    onAllocateProduct(activeUser.phone, prod, allocQty);
    setShowAllocModal(false);
    setActionMsg(`Allocated ${allocQty}x ${prod.title} to ${activeUser.phone}!`);
    setTimeout(() => setActionMsg(''), 4000);
  };

  // User's orders and activities
  const userOrders = allOrders.filter(o => o.userPhone === activeUser?.phone);
  const userTxCount = allTransactions.filter(t => t.userPhone === activeUser?.phone).length;

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      {/* User Directory Column (5 cols) */}
      <div className="xl:col-span-5 space-y-4">
        <div className="bg-[#07132e]/90 border border-blue-900/40 rounded-2xl p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-white flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-400" />
              <span>Investor Directory ({uniqueUsers.length})</span>
            </h3>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="px-2 py-1 rounded-lg bg-blue-900/40 hover:bg-blue-800/60 border border-blue-700/40 text-blue-300 hover:text-white text-[11px] font-bold flex items-center gap-1 transition active:scale-95"
                title="Fetch latest investors on request"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Refresh</span>
              </button>
            )}
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search phone, code, ID..."
              className="w-full bg-slate-950/80 border border-slate-700/60 rounded-xl py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 font-mono"
            />
          </div>

          {/* User List */}
          <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
            {filteredUsers.map((u, index) => {
              const isSelected = activeUser?.phone === u.phone;
              const userKey = u.id ? `user_${u.phone || 'anon'}_${u.id}_${index}` : `user_${u.phone || 'anon'}_${index}`;
              return (
                <div
                  key={userKey}
                  onClick={() => onSelectUserPhone(u.phone)}
                  className={`p-3 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                    isSelected
                      ? 'bg-blue-950/80 border-blue-500 shadow-md shadow-blue-950/50'
                      : 'bg-slate-950/60 hover:bg-slate-900 border-slate-800/80'
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-white text-xs">{u.phone}</span>
                      <span className="px-1.5 py-0.5 rounded bg-amber-500/20 border border-amber-400/30 text-amber-300 text-[10px] font-black">
                        VIP {u.vipLevel || 0}
                      </span>
                      {u.isBanned && (
                        <span className="px-1 py-0.2 rounded bg-rose-500 text-white text-[9px] font-black">
                          BANNED
                        </span>
                      )}
                      {u.isFrozen && (
                        <span className="px-1 py-0.2 rounded bg-cyan-500 text-black text-[9px] font-black">
                          FROZEN
                        </span>
                      )}
                    </div>
                    <div className="text-xs font-black text-emerald-400 font-mono mt-1">
                      ₦{(u.balance || 0).toLocaleString()}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-mono">
                      Ref: {u.referralCode || '—'}
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Team: {u.teamSize || 0}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* User Inspector & Hot Controls (7 cols) */}
      <div className="xl:col-span-7 space-y-4">
        {activeUser ? (
          <div className="bg-[#07132e]/90 border border-blue-500/30 rounded-2xl p-6 shadow-2xl space-y-6">
            {/* Header / Badges */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-blue-900/40">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-black text-white font-mono">{activeUser.phone}</h2>
                  <span className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 font-black text-xs">
                    VIP {activeUser.vipLevel || 0}
                  </span>
                  <button
                    onClick={() => handleCopy(activeUser.phone, 'phone')}
                    className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                    title="Copy phone"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-xs text-slate-400 mt-1 font-mono flex items-center gap-3">
                  <span>Ref Code: <b className="text-amber-300">{activeUser.referralCode || 'N/A'}</b></span>
                  <span>Upline: <b className="text-blue-300">{activeUser.referredBy || 'Direct HQ'}</b></span>
                </div>
              </div>

              {/* Status Badge & Security Actions */}
              <div className="flex items-center gap-2">
                {onToggleUserFreeze && (
                  <button
                    onClick={() => onToggleUserFreeze(activeUser.phone, !activeUser.isFrozen)}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition ${
                      activeUser.isFrozen
                        ? 'bg-cyan-500/20 border-cyan-500 text-cyan-300'
                        : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
                    }`}
                  >
                    {activeUser.isFrozen ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                    <span>{activeUser.isFrozen ? 'Unfreeze' : 'Freeze'}</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    if (confirm(`Permanently ban and delete user ${activeUser.phone}?`)) {
                      if (onBanAndDeleteUser) onBanAndDeleteUser(activeUser.phone);
                      else if (onToggleUserBan) onToggleUserBan(activeUser.phone, true);
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/40 text-rose-300 text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Ban User</span>
                </button>
              </div>
            </div>

            {actionMsg && (
              <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{actionMsg}</span>
              </div>
            )}

            {/* Balances & Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-emerald-500/30">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Current Balance
                </span>
                <div className="text-xl font-black text-emerald-400 font-mono mt-1">
                  ₦{(activeUser.balance || 0).toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  ≈ ${((activeUser.balance || 0) / usdNairaRate).toFixed(2)} USDT
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-amber-500/30">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Accrued Daily Yield
                </span>
                <div className="text-xl font-black text-amber-400 font-mono mt-1">
                  ₦{(activeUser.accruedIncome || 0).toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Active Tranches: {userOrders.length}
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-950/70 border border-blue-500/30">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                  Team Commissions
                </span>
                <div className="text-xl font-black text-blue-400 font-mono mt-1">
                  ₦{(activeUser.totalCommissions || 0).toLocaleString()}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">
                  Team Members: {activeUser.teamSize || 0}
                </span>
              </div>
            </div>

            {/* HOT 1-CLICK CREDIT PRESETS */}
            <div className="space-y-2 p-4 rounded-2xl bg-slate-950/60 border border-emerald-500/20">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-emerald-300 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  Instant Balance Modifier
                </span>
                <span className="text-[10px] text-slate-400 font-mono">Fast Presets</span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                {[5000, 20000, 50000, 100000, 500000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => handleQuickCredit(amt)}
                    className="py-2 px-2 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-xs transition active:scale-95 text-center"
                  >
                    +₦{(amt / 1000).toFixed(0)}k
                  </button>
                ))}
              </div>

              {/* Custom Credit Input */}
              <div className="flex items-center gap-2 pt-2">
                <input
                  type="number"
                  value={customCreditVal}
                  onChange={(e) => setCustomCreditVal(e.target.value)}
                  placeholder="Custom amount (e.g. 75000)"
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
                />
                <button
                  onClick={() => handleCustomCreditSubmit(false)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs shadow-md transition active:scale-95"
                >
                  + Credit
                </button>
                <button
                  onClick={() => handleCustomCreditSubmit(true)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs shadow-md transition active:scale-95"
                >
                  - Deduct
                </button>
              </div>
            </div>

            {/* HOT ACTION BUTTONS: VIP, ALLOCATE, BANK, TEAM */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* VIP Level Select */}
              <div className="p-3 rounded-xl bg-slate-950/70 border border-amber-500/30 space-y-1">
                <span className="text-[10px] font-black uppercase text-amber-300 block">
                  Set VIP Tier
                </span>
                <select
                  value={activeUser.vipLevel || 0}
                  onChange={(e) => {
                    const newVip = parseInt(e.target.value);
                    onSetUserVip(activeUser.phone, newVip);
                    setActionMsg(`Elevated ${activeUser.phone} to VIP ${newVip}!`);
                    setTimeout(() => setActionMsg(''), 4000);
                  }}
                  className="w-full bg-slate-900 border border-amber-500/40 rounded-lg py-1.5 px-2 text-xs font-bold text-amber-300 focus:outline-none"
                >
                  {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
                    <option key={v} value={v}>
                      VIP Level {v}
                    </option>
                  ))}
                </select>
              </div>

              {/* Allocate Product Button */}
              <button
                onClick={() => setShowAllocModal(true)}
                className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-blue-500/30 text-left transition space-y-1"
              >
                <span className="text-[10px] font-black uppercase text-blue-300 block">
                  Allocate Share
                </span>
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>Gift Product</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-blue-400" />
                </div>
              </button>

              {/* Bank Details Editor */}
              <button
                onClick={openBankForm}
                className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-purple-500/30 text-left transition space-y-1"
              >
                <span className="text-[10px] font-black uppercase text-purple-300 block">
                  Bank Account
                </span>
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>{activeUser.bankAccount?.bankName || 'Not Bound'}</span>
                  <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                </div>
              </button>

              {/* Team & Downline */}
              <button
                onClick={openTeamForm}
                className="p-3 rounded-xl bg-slate-950/70 hover:bg-slate-900 border border-cyan-500/30 text-left transition space-y-1"
              >
                <span className="text-[10px] font-black uppercase text-cyan-300 block">
                  Team Hierarchy
                </span>
                <div className="text-xs font-bold text-white flex items-center justify-between">
                  <span>{activeUser.teamSize || 0} Downlines</span>
                  <Edit3 className="w-3.5 h-3.5 text-cyan-400" />
                </div>
              </button>
            </div>

            {/* Direct Downline Injection Tool */}
            <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/50 to-indigo-950/50 border border-blue-500/30 flex items-center justify-between">
              <div>
                <div className="text-xs font-black text-white flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-blue-400" />
                  <span>Direct Downline Injection Engine</span>
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5">
                  Force-register a funded investor under {activeUser.phone}'s referral code.
                </div>
              </div>
              <button
                onClick={() => setShowDownlineModal(true)}
                className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs shadow-md transition active:scale-95"
              >
                + Inject User
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-[#07132e]/90 border border-blue-900/40 rounded-2xl p-12 text-center text-slate-400">
            Select a user from the directory to inspect profile & execute actions.
          </div>
        )}
      </div>

      {/* Modal: Bank Account Editor */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-purple-400" />
              <span>Edit Bank Account ({activeUser?.phone})</span>
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Bank Name</label>
                <input
                  type="text"
                  value={bankNameInput}
                  onChange={(e) => setBankNameInput(e.target.value)}
                  placeholder="e.g. Access Bank, OPay, Palmpay"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Account Number</label>
                <input
                  type="text"
                  value={accNumInput}
                  onChange={(e) => setAccNumInput(e.target.value)}
                  placeholder="10-digit NUBAN"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Account Holder Name</label>
                <input
                  type="text"
                  value={accNameInput}
                  onChange={(e) => setAccNameInput(e.target.value)}
                  placeholder="Full Legal Name"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowBankModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={saveBankDetails}
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-black"
              >
                Save Bank Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Team Editor */}
      {showTeamModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-cyan-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <span>Modify Team & Upline ({activeUser?.phone})</span>
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Team Size</label>
                <input
                  type="number"
                  value={teamSizeInput}
                  onChange={(e) => setTeamSizeInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Referred By (Upline)</label>
                <input
                  type="text"
                  value={referredByInput}
                  onChange={(e) => setReferredByInput(e.target.value)}
                  placeholder="Phone or 'None'"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Total Commissions (₦)</label>
                <input
                  type="number"
                  value={commissionsInput}
                  onChange={(e) => setCommissionsInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Team Total Invest (₦)</label>
                <input
                  type="number"
                  value={teamInvestInput}
                  onChange={(e) => setTeamInvestInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
                />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Change Account Phone Number</label>
                <input
                  type="text"
                  value={userPhoneEditInput}
                  onChange={(e) => setUserPhoneEditInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-xs text-white font-mono"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowTeamModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={saveTeamDetails}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-black"
              >
                Apply Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Allocate Product */}
      {showAllocModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-blue-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Crown className="w-5 h-5 text-blue-400" />
              <span>Allocate Share Tranche ({activeUser?.phone})</span>
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Select Investment Product</label>
                <select
                  value={selectedAllocProdId}
                  onChange={(e) => setSelectedAllocProdId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white"
                >
                  {products.map((p, pIdx) => (
                    <option key={p.id ? `alloc_prod_${p.id}_${pIdx}` : `alloc_prod_${pIdx}`} value={p.id}>
                      {p.title} — ₦{p.price.toLocaleString()} (Daily: ₦{p.dailyIncome.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Quantity</label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={allocQty}
                  onChange={(e) => setAllocQty(parseInt(e.target.value) || 1)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAllocModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAllocate}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black"
              >
                Confirm Allocation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Inject Downline */}
      {showDownlineModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-blue-500/40 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-blue-400" />
              <span>Inject Downline User</span>
            </h3>
            <p className="text-xs text-slate-400">
              This will create a new user profile attached under <b className="text-white">{activeUser?.phone}</b>.
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">New Downline Phone Number</label>
                <input
                  type="text"
                  value={newDownlinePhone}
                  onChange={(e) => setNewDownlinePhone(e.target.value)}
                  placeholder="e.g. 08123456789"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold text-slate-400 block mb-1">Initial Registration Deposit (₦)</label>
                <input
                  type="number"
                  value={downlineRegAmount}
                  onChange={(e) => setDownlineRegAmount(e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono"
                />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowDownlineModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                onClick={handleInjectDownline}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black"
              >
                Inject & Credit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
