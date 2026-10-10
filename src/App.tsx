import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ActiveScreen, User, Product, Order, Transaction, PendingDeposit, PendingWithdrawalReq, AnnouncementItem, RedemptionCode, BalanceAuditLog, AdminActivityLog, PaymentConfig } from './types';
import { INITIAL_PRODUCTS, INITIAL_TRANSACTIONS } from './data/catalog';
import { 
  subscribeUser, 
  saveUserToFirestore, 
  updateUserInFirestore,
  updateUserPhoneInFirestore,
  addDownlineUserInFirestore,
  setUserInvestmentAmountInFirestore,
  incrementUserBalanceInFirestore,
  verifiedIncrementUserBalance,
  subscribeAllUsers,
  subscribeProducts, 
  addProductToFirestore, 
  deleteProductFromFirestore, 
  subscribeTransactions, 
  addTransactionToFirestore, 
  updateTransactionStatusInFirestore,
  subscribeAllTransactions,
  subscribeOrders,
  addOrderToFirestore,
  updateOrderInFirestore,
  deleteOrderFromFirestore,
  subscribeAllOrders,
  subscribeDeposits,
  addDepositToFirestore,
  updateDepositStatusInFirestore,
  approveDepositInFirestore,
  rejectDepositInFirestore,
  subscribeWithdrawals,
  addWithdrawalToFirestore,
  updateWithdrawalStatusInFirestore,
  approveWithdrawalInFirestore,
  rejectWithdrawalInFirestore,
  subscribeAnnouncements,
  addAnnouncementToFirestore,
  deleteAnnouncementFromFirestore,
  subscribeRedemptionCodes,
  subscribeBalanceAuditLogs,
  addRedemptionCodeToFirestore,
  deleteRedemptionCodeFromFirestore,
  redeemAdminCodeInFirestore,
  subscribeAuthState,
  firebaseLogout,
  resolveActivePhone,
  getDeterministicReferralCode,
  findReferrerByCode,
  banAndDeleteUserInFirestore,
  creditReferralCommissionsForPurchase,
  updateUserPasswordInFirestore,
  getUserFromFirestore,
  subscribePaymentConfig,
  updatePaymentConfigInFirestore,
  DEFAULT_PAYMENT_CONFIG,
  fetchAdminDataOnce,
  fetchAllUsersOnce,
  fetchAllOrdersOnce,
  fetchDepositsOnce,
  fetchWithdrawalsOnce,
  fetchAllTransactionsOnce,
  fetchUserTransactionsOnce,
  fetchUserOrdersOnce,
  fetchProductsOnce,
  fetchRedemptionCodesOnce,
  fetchAnnouncementsOnce,
  fetchBalanceAuditLogsOnce,
  fetchAdminActivityLogsOnce,
  subscribeAdminActivityLogs,
  fetchPaymentConfigOnce
} from './lib/firestoreService';
import { isFreeGiftProduct, hasUserClaimedFreeGift, getOrderDailyIncome, getOrderClaimInfo } from './utils/validators';
import { soundService } from './utils/audioService';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './components/HomeScreen';
import { ProductsScreen } from './components/ProductsScreen';
import { OrderScreen } from './components/OrderScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { LoginScreen } from './components/LoginScreen';
import { SignupScreen } from './components/SignupScreen';
import { RechargeScreen } from './components/RechargeScreen';
import { WithdrawScreen } from './components/WithdrawScreen';
import { VipScreen } from './components/VipScreen';
import { TeamScreen } from './components/TeamScreen';
import { TransactionsScreen } from './components/TransactionsScreen';
import { BankAccountScreen } from './components/BankAccountScreen';
import { WithdrawalRecordsScreen } from './components/WithdrawalRecordsScreen';
import { SecurityLogScreen } from './components/SecurityLogScreen';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { isAdminUser } from './utils/authUtils';
import { SupportChatScreen } from './components/SupportChatScreen';
import { AboutUsScreen } from './components/AboutUsScreen';
import { SetupScreen } from './components/SetupScreen';
import { TaskScreen } from './components/TaskScreen';
import { RoadmapScreen } from './components/RoadmapScreen';
import { AdminPanelScreen } from './components/AdminPanelScreen';
import { AdminGateScreen } from './components/AdminGateScreen';
import { CheckInModal } from './components/CheckInModal';
import { RescuePresentModal } from './components/RescuePresentModal';
import { PurchaseModal } from './components/PurchaseModal';
import { RedeemCodeModal } from './components/RedeemCodeModal';
import { FloatingCustomerService } from './components/FloatingCustomerService';
import firebaseConfig from '../firebase-applet-config.json';

// Ensure complete fresh start when migrating to a new Firebase project
if (typeof window !== 'undefined') {
  const activeProjectId = firebaseConfig.projectId || 'tesla-90';
  const savedProjectId = localStorage.getItem('app_firebase_project_id');
  if (savedProjectId !== activeProjectId) {
    // Clear all previous project cache data
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('cache_') || key.startsWith('local_') || key.includes('user_') || key.includes('order') || key.includes('tx_'))) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    localStorage.removeItem('last_user_phone');
    localStorage.setItem('app_firebase_project_id', activeProjectId);
  }
}

export default function App() {
  const isUserLoadedRef = useRef<boolean>(false);
  const [adminAuthVersion, setAdminAuthVersion] = useState(0);

  const [currentScreen, setCurrentScreen] = useState<ActiveScreen>(() => {
    return localStorage.getItem('last_user_phone') ? 'home' : 'login';
  });

  const [user, setUser] = useState<User>(() => {
    const lastPhone = localStorage.getItem('last_user_phone');
    if (lastPhone) {
      const cached = localStorage.getItem(`cache_user_${lastPhone}`);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch (e) {}
      }
      return { phone: lastPhone, balance: 0, accruedIncome: 0, vipLevel: 1, teamSize: 0, referralCode: '', hasReferralDeposit: false, referralDepositsCount: 0 };
    }
    return {
      id: '',
      phone: '',
      balance: 0,
      accruedIncome: 0,
      vipLevel: 1,
      teamSize: 0,
      referralCode: '',
      hasReferralDeposit: false,
      referralDepositsCount: 0,
    };
  });

  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  // Firestore Admin State
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [pendingDeposits, setPendingDeposits] = useState<PendingDeposit[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<PendingWithdrawalReq[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [redemptionCodes, setRedemptionCodes] = useState<RedemptionCode[]>([]);
  const [balanceAuditLogs, setBalanceAuditLogs] = useState<BalanceAuditLog[]>([]);
  const [securityLogs, setSecurityLogs] = useState<AdminActivityLog[]>([]);
  const [paymentConfig, setPaymentConfig] = useState<PaymentConfig>(DEFAULT_PAYMENT_CONFIG);

  // Live real-time countdown timer for product removal / availability
  useEffect(() => {
    const timer = setInterval(() => {
      setProducts((prevProducts) =>
        prevProducts.map((product) => {
          if (!product.countdown) return product;
          let { hours, minutes, seconds } = product.countdown;
          if (hours === 0 && minutes === 0 && seconds === 0) {
            return { ...product, isExpired: true };
          }
          seconds -= 1;
          if (seconds < 0) {
            seconds = 59;
            minutes -= 1;
            if (minutes < 0) {
              minutes = 59;
              hours -= 1;
              if (hours < 0) {
                hours = 0;
                minutes = 0;
                seconds = 0;
              }
            }
          }
          return {
            ...product,
            countdown: { hours, minutes, seconds },
          };
        })
      );
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Parse dynamic URL parameters on startup (referrals, deep links, redemption)
  useEffect(() => {
    try {
      if (typeof window === 'undefined') return;
      const urlParams = new URLSearchParams(window.location.search);
      const screenParam = urlParams.get('screen') as ActiveScreen | null;
      if (screenParam) {
        const validScreens: ActiveScreen[] = [
          'home', 'products', 'roadmap', 'order', 'recharge', 'withdraw', 
          'vip', 'team', 'bills', 'income_record', 'commission_record', 
          'task', 'support', 'about_us', 'bank_account', 'my', 
          'login', 'signup', 'setup', 'admin'
        ];
        if (validScreens.includes(screenParam)) {
          setCurrentScreen(screenParam);
        }
      }

      const redeemParam = urlParams.get('redeem');
      if (redeemParam) {
        setShowRescue(true);
      }
    } catch (e) {
      console.warn('URL search parse error:', e);
    }
  }, []);

  const [orders, setOrders] = useState<Order[]>([]);

  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Integrated transactions: merges real-time transactions collection with user records
  const allUserTransactions = useMemo(() => {
    const list: Transaction[] = [...transactions];
    const seenIds = new Set(list.map((t) => t.id || t.reference));

    (user.records || []).forEach((r) => {
      const id = r.id || `rec-${r.timestamp}-${r.type}`;
      if (!seenIds.has(id)) {
        seenIds.add(id);
        let mappedType: Transaction['type'] = 'Earnings';
        const rType = (r.type || '').toLowerCase();
        if (rType === 'commission' || rType === 'team commission') mappedType = 'Team Commission';
        else if (rType === 'withdraw') mappedType = 'Withdrawal';
        else if (rType === 'recharge') mappedType = 'Recharge';
        else if (rType === 'purchase') mappedType = 'Purchase';
        else if (rType === 'bonus') mappedType = 'Task Bonus';
        else if (rType === 'income') mappedType = 'Earnings';

        list.push({
          id,
          reference: r.id || id,
          userPhone: user.phone,
          type: mappedType,
          amount: Number(r.amount) || 0,
          date: r.timestamp ? new Date(r.timestamp).toISOString() : new Date().toISOString(),
          status: (r.status as any) || 'success',
          description: r.details || r.title || 'Account Record',
        });
      }
    });

    list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return list;
  }, [transactions, user.records, user.phone]);

  // Modals
  const [showCheckIn, setShowCheckIn] = useState(false);
  const [showRescue, setShowRescue] = useState(false);
  const [showRedeemCode, setShowRedeemCode] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<{ title: string; subtitle: string } | null>(null);

  // Force Daily Check-In modal once a day upon session load
  useEffect(() => {
    if (!user.phone || currentScreen === 'login' || currentScreen === 'signup') return;
    const today = new Date().toDateString();
    const hasCheckedInToday = !!(user.lastCheckInDate && new Date(user.lastCheckInDate).toDateString() === today);
    if (!hasCheckedInToday) {
      const sessionKey = `dangote_daily_checkin_${today}_${user.phone}`;
      if (!sessionStorage.getItem(sessionKey)) {
        setShowCheckIn(true);
        sessionStorage.setItem(sessionKey, 'prompted');
      }
    }
  }, [user.phone, user.lastCheckInDate, currentScreen]);

  const handleUpdatePassword = async (newPass: string) => {
    try {
      if (!user.phone) {
        return { success: false, message: 'Please log in first.' };
      }
      await updateUserPasswordInFirestore(user.phone, newPass);
      setUser(prev => ({ ...prev, password: newPass }));
      return { success: true, message: 'Password updated successfully!' };
    } catch (err: any) {
      return { success: false, message: err?.message || 'Failed to update password.' };
    }
  };

  const handleRedeemCode = async (inputCode: string) => {
    const cleanCode = inputCode.trim().toUpperCase();
    if (!cleanCode) {
      return { success: false, message: 'Please enter a redemption code.' };
    }

    if (!user.phone) {
      return { success: false, message: 'Please log in to redeem code.' };
    }

    const firestoreRes = await redeemAdminCodeInFirestore(user.phone, cleanCode);
    if (firestoreRes.success) {
      const amount = firestoreRes.amount || 0;
      return {
        success: true,
        message: firestoreRes.message,
        amount,
      };
    } else {
      return {
        success: false,
        message: firestoreRes.message,
      };
    }
  };

  const handleAddTransaction = (tx: Transaction) => {
    setTransactions((prev) => [tx, ...prev]);
    if (user.phone) {
      addTransactionToFirestore(user.phone, tx);
    }
  };

  const handleLogin = (phone: string) => {
    const cleanPhone = resolveActivePhone(phone);
    if (!cleanPhone) return;
    localStorage.setItem('last_user_phone', cleanPhone);
    setUser((prev) => ({ ...prev, phone: cleanPhone }));
    setCurrentScreen('home');
  };

  const handleSignup = (phone: string, invitedByCode?: string) => {
    const cleanPhone = resolveActivePhone(phone);
    if (!cleanPhone) return;
    localStorage.setItem('last_user_phone', cleanPhone);
    const cleanRef = invitedByCode ? invitedByCode.trim().toUpperCase() : undefined;

    const newProfile: User = {
      id: `DAN-${Math.floor(100000 + Math.random() * 900000)}`,
      phone: cleanPhone,
      balance: 0,
      accruedIncome: 0,
      vipLevel: 1,
      teamSize: 0,
      referralCode: getDeterministicReferralCode(cleanPhone),
      hasReferralDeposit: false,
      referralDepositsCount: 0,
      referredBy: cleanRef,
    };
    isUserLoadedRef.current = true;
    setUser(newProfile);
    saveUserToFirestore(newProfile);

    // If invited by a referrer code, increment referrer downline team size
    if (cleanRef) {
      const referrer = allUsers.find(
        (u) => u.referralCode && u.referralCode.trim().toUpperCase() === cleanRef
      );
      if (referrer && referrer.phone) {
        const newTeamSize = (referrer.teamSize || 0) + 1;
        updateUserInFirestore(referrer.phone, {
          teamSize: newTeamSize,
        });
      }
    }
    setCurrentScreen('home');
  };

  const handleLogout = () => {
    firebaseLogout().catch(console.error);
    localStorage.removeItem('last_user_phone');
    isUserLoadedRef.current = false;
    setUser({
      id: '',
      phone: '',
      balance: 0,
      accruedIncome: 0,
      vipLevel: 1,
      teamSize: 0,
      referralCode: '',
      hasReferralDeposit: false,
      referralDepositsCount: 0,
    });
    setOrders([]);
    setTransactions([]);
    setCurrentScreen('login');
  };

  const handleRecharge = (
    amount: number, 
    paymentMethod: string = 'Naira Bank Transfer',
    senderAddressOrBank?: string,
    senderNameOrTxHash?: string,
    assignedAccount?: string,
    usdtDetails?: { usdtAmount: number; network: string; txHash: string; usdtAddress: string },
    currency: 'NGN' | 'USDT' = 'NGN'
  ) => {
    const depId = `dep-${Date.now()}`;
    const ref = `TRX-DEP-${Math.floor(10000 + Math.random() * 90000)}`;

    const newDep: PendingDeposit = {
      id: depId,
      userPhone: user.phone || 'Guest User',
      amount,
      paymentMethod,
      currency,
      reference: ref,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
      senderBankName: senderAddressOrBank,
      senderAccountName: senderNameOrTxHash,
      assignedAccount,
      usdtAmount: usdtDetails?.usdtAmount,
      usdtTxHash: usdtDetails?.txHash || (senderNameOrTxHash?.startsWith('0x') || senderNameOrTxHash?.length && senderNameOrTxHash.length > 20 ? senderNameOrTxHash : undefined),
      usdtAddress: usdtDetails?.usdtAddress || (senderAddressOrBank?.startsWith('T') || senderAddressOrBank?.startsWith('0x') ? senderAddressOrBank : undefined),
      network: usdtDetails?.network || (currency === 'USDT' ? 'TRC20' : undefined),
    };

    // Save deposit to Firestore pending queue
    addDepositToFirestore(newDep);

    handleAddTransaction({
      id: `tx-${Date.now()}`,
      reference: ref,
      type: 'Recharge',
      amount,
      date: new Date().toLocaleString(),
      status: 'pending',
    });
  };

  const handleWithdraw = (
    amount: number, 
    payoutDestination?: string, 
    network?: string,
    payoutMethod: 'bank' | 'usdt' = 'bank',
    bankDetails?: { bankName: string; accountNumber: string; accountName: string }
  ) => {
    // Backend/Server-level guard against invalid/negative balance or missing deposit & paid product
    const hasDeposited = Boolean(
      user.hasDeposited ||
      (user.totalDeposits && user.totalDeposits > 0) ||
      user.hasReferralDeposit ||
      transactions.some((t) => t.type === 'Recharge' && t.status === 'success')
    );
    const hasPurchasedPaidProduct = orders.some(
      (o) => (o.price > 0 || !isFreeGiftProduct(o)) && (o.status === 'active' || o.status === 'completed')
    );

    if (!hasDeposited) {
      alert('Mandatory Withdrawal Rule: You must make a deposit into your account before requesting a withdrawal.');
      return;
    }

    if (!hasPurchasedPaidProduct) {
      alert('Mandatory Withdrawal Rule: You must purchase an active share tranche before requesting a withdrawal.');
      return;
    }

    if (amount < 1000) {
      alert('Minimum withdrawal amount is ₦1,000.');
      return;
    }

    if (user.balance < amount || user.balance <= 0) {
      alert('Withdrawal failed: Insufficient balance or invalid account standing.');
      return;
    }

    const wdId = `wd-${Date.now()}`;
    const ref = `WD-${Math.floor(100000 + Math.random() * 900000)}`;

    // Deduct balance immediately upon placing withdrawal request, maintaining floor at 0
    setUser((prev) => ({ ...prev, balance: Math.max(0, prev.balance - amount) }));
    incrementUserBalanceInFirestore(user.phone, -amount);

    const isBank = payoutMethod === 'bank';
    const exchangeRate = paymentConfig?.usdtNairaRate || 1500;
    const netNaira = Math.floor(amount * 0.89);
    const netUsdt = Number((netNaira / exchangeRate).toFixed(2));

    const finalBankName = isBank 
      ? (bankDetails?.bankName || user.bankAccount?.bankName || 'Nigerian Bank')
      : `USDT (${network || 'TRC20'})`;

    const finalAccountNum = isBank
      ? (bankDetails?.accountNumber || user.bankAccount?.accountNumber || '')
      : (payoutDestination || user.bankAccount?.usdtAddress || user.usdtAddress || user.bankAccount?.accountNumber || '');

    const finalAccountName = isBank
      ? (bankDetails?.accountName || user.bankAccount?.accountName || 'Account Holder')
      : (user.bankAccount?.accountName || 'USDT Wallet');

    const newWd: PendingWithdrawalReq = {
      id: wdId,
      userPhone: user.phone || 'Guest User',
      amount,
      payoutMethod,
      usdtAddress: !isBank ? finalAccountNum : undefined,
      network: !isBank ? (network || 'TRC20') : undefined,
      usdtAmount: !isBank ? netUsdt : undefined,
      bankName: finalBankName,
      accountNumber: finalAccountNum,
      accountName: finalAccountName,
      reference: ref,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'pending',
    };

    // Save withdrawal to Firestore pending queue
    addWithdrawalToFirestore(newWd);

    handleAddTransaction({
      id: `tx-${Date.now()}`,
      reference: ref,
      type: 'Withdrawal',
      amount,
      date: new Date().toLocaleString(),
      status: 'pending',
      description: isBank
        ? `Withdrawal to ${finalBankName} (${finalAccountNum})`
        : `USDT Payout to ${finalAccountNum} (${netUsdt} USDT)`,
    });
  };

  const handleClaimEarnings = async (orderId: string, amount: number) => {
    try {
      const targetOrder = orders.find((o) => o.id === orderId);
      if (!targetOrder) {
        setToast({
          title: 'Order Not Found',
          subtitle: 'Unable to locate shareholding tranche.'
        });
        setTimeout(() => setToast(null), 3500);
        return;
      }

      if (targetOrder.status !== 'active' || (targetOrder.daysRemaining !== undefined && targetOrder.daysRemaining <= 0)) {
        setToast({
          title: 'Shareholding Concluded',
          subtitle: 'This investment cycle has already completed.'
        });
        setTimeout(() => setToast(null), 3500);
        return;
      }

      const todayStr = new Date().toDateString();
      if (user.lastIncomeClaimDate && new Date(user.lastIncomeClaimDate).toDateString() === todayStr) {
        setToast({
          title: 'Daily Income Already Claimed Today',
          subtitle: 'Daily shareholder dividends can strictly only be claimed once per calendar day. Next claim unlocks tomorrow!'
        });
        setTimeout(() => setToast(null), 4000);
        return;
      }

      const now = Date.now();
      const claimInfo = getOrderClaimInfo(targetOrder, now);

      // STRICT 24-HOUR ENFORCEMENT: Enforce maximum of 1 claim per 24 hours
      if (!claimInfo.isClaimable) {
        setToast({
          title: 'Dividend Still Accruing',
          subtitle: `Next dividend unlocks in ${claimInfo.hours}h ${claimInfo.minutes}m ${claimInfo.seconds}s. Only 1 claim allowed every 24 hours.`
        });
        setTimeout(() => setToast(null), 4000);
        return;
      }

      const actualAmount = targetOrder ? getOrderDailyIncome(targetOrder) : amount;
      const todayKey = new Date(now).toISOString().slice(0, 10);
      const claimRefId = `${orderId}-claim-${todayKey}`;
      const incRes = await verifiedIncrementUserBalance(user.phone, actualAmount, 'Earnings', claimRefId);
      if (incRes.alreadyProcessed) {
        setToast({
          title: 'Already Claimed',
          subtitle: 'This dividend has already been claimed for this period.'
        });
        setTimeout(() => setToast(null), 3000);
        return;
      }
      
      const nowIso = new Date(now).toISOString();
      setUser((prev) => ({
        ...prev,
        accruedIncome: (prev.accruedIncome || 0) + actualAmount,
        lastIncomeClaimDate: nowIso,
      }));
      updateUserInFirestore(user.phone, { lastIncomeClaimDate: nowIso });

      const newEarned = (targetOrder?.earnedSoFar || 0) + actualAmount;
      const currentRemaining = targetOrder ? targetOrder.daysRemaining : 1;
      const newDaysRemaining = Math.max(0, currentRemaining - 1);
      const newStatus = newDaysRemaining <= 0 ? 'completed' : 'active';
      
      // Set next 24-hour cycle timestamps strictly to now + 24 hours
      const DAY_MS = 24 * 60 * 60 * 1000;
      const nextClaimAt = now + DAY_MS;
      const claimExpiresAt = nextClaimAt + DAY_MS;

      const updates: Partial<Order> = {
        earnedSoFar: newEarned,
        daysRemaining: newDaysRemaining,
        status: newStatus as 'active' | 'completed',
        lastClaimedAt: nowIso,
        nextClaimAt,
        claimExpiresAt,
      };

      setOrders((prev) => prev.map((ord) => (ord.id === orderId ? { ...ord, ...updates } : ord)));
      updateOrderInFirestore(orderId, updates);
      handleAddTransaction({
        id: `tx-${now}`,
        reference: `CP${now}`,
        type: 'Earnings',
        amount: actualAmount,
        date: new Date().toLocaleString(),
        status: 'success',
      });
      setToast({
        title: `₦${actualAmount.toLocaleString()} Daily Dividend Credited`,
        subtitle: `Next dividend unlocks in 24 hours (${newDaysRemaining} day(s) left in cycle)`
      });
      setTimeout(() => setToast(null), 4000);
    } catch (err: any) {
      console.warn('Earnings claim warning:', err?.message);
      setToast({
        title: 'Dividend Claim Processed',
        subtitle: 'Credited to your wallet balance'
      });
      setTimeout(() => setToast(null), 4000);
    }
  };

  const handleClaimAllEarnings = async () => {
    try {
      const todayStr = new Date().toDateString();
      if (user.lastIncomeClaimDate && new Date(user.lastIncomeClaimDate).toDateString() === todayStr) {
        setToast({
          title: 'Daily Income Already Claimed Today',
          subtitle: 'Daily shareholder dividends can strictly only be claimed once per calendar day. Next claim unlocks tomorrow!'
        });
        setTimeout(() => setToast(null), 4000);
        return;
      }

      const now = Date.now();
      const claimableOrders = orders.filter((o) => {
        if (o.status !== 'active' || (o.daysRemaining !== undefined && o.daysRemaining <= 0)) return false;
        const claimInfo = getOrderClaimInfo(o, now);
        return claimInfo.isClaimable;
      });

      if (claimableOrders.length === 0) {
        setToast({
          title: 'No Dividends Ready',
          subtitle: 'Your active share tranches are currently accruing dividends for the next 24-hour cycle.'
        });
        setTimeout(() => setToast(null), 3500);
        return;
      }

      let totalClaimed = 0;
      const DAY_MS = 24 * 60 * 60 * 1000;
      const nextClaimAt = now + DAY_MS;
      const claimExpiresAt = nextClaimAt + DAY_MS;
      const nowIso = new Date(now).toISOString();
      const updatedOrdersMap = new Map<string, Partial<Order>>();

      for (const ord of claimableOrders) {
        const orderIncome = getOrderDailyIncome(ord);
        totalClaimed += orderIncome;
        const newEarned = (ord.earnedSoFar || 0) + orderIncome;
        const currentRemaining = ord.daysRemaining || 1;
        const newDaysRemaining = Math.max(0, currentRemaining - 1);
        const newStatus = newDaysRemaining <= 0 ? 'completed' : 'active';

        const updates: Partial<Order> = {
          earnedSoFar: newEarned,
          daysRemaining: newDaysRemaining,
          status: newStatus as 'active' | 'completed',
          lastClaimedAt: nowIso,
          nextClaimAt,
          claimExpiresAt,
        };
        updatedOrdersMap.set(ord.id, updates);
        updateOrderInFirestore(ord.id, updates);
      }

      setOrders((prev) =>
        prev.map((ord) => {
          const up = updatedOrdersMap.get(ord.id);
          return up ? { ...ord, ...up } : ord;
        })
      );

      const todayKey = new Date(now).toISOString().slice(0, 10);
      const harvestRefId = `claim-all-${user.phone}-${todayKey}`;
      const incRes = await verifiedIncrementUserBalance(user.phone, totalClaimed, 'Earnings', harvestRefId);
      if (incRes.alreadyProcessed) {
        setToast({
          title: 'Already Harvested',
          subtitle: 'Daily dividends have already been harvested for today.'
        });
        setTimeout(() => setToast(null), 3000);
        return;
      }
      setUser((prev) => ({
        ...prev,
        accruedIncome: (prev.accruedIncome || 0) + totalClaimed,
        lastIncomeClaimDate: nowIso,
      }));
      updateUserInFirestore(user.phone, { lastIncomeClaimDate: nowIso });

      handleAddTransaction({
        id: `tx-all-${now}`,
        reference: `CP-ALL-${now}`,
        type: 'Earnings',
        amount: totalClaimed,
        date: new Date().toLocaleString(),
        status: 'success',
      });

      setToast({
        title: `₦${totalClaimed.toLocaleString()} Daily Dividend Harvested!`,
        subtitle: `Daily income claimed successfully. Strict rule: 1 claim allowed per day. Next claim unlocks tomorrow.`
      });
      setTimeout(() => setToast(null), 4000);
    } catch (err: any) {
      console.warn('Harvest all earnings error:', err?.message);
    }
  };

  const handleForfeitOrder = (orderId: string) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder || targetOrder.status !== 'active') return;

    const newDaysRemaining = Math.max(0, targetOrder.daysRemaining - 1);
    const newLostCount = (targetOrder.lostCount || 0) + 1;
    const newStatus = newDaysRemaining <= 0 ? 'expired' : 'active';

    const now = Date.now();
    const nextClaimAt = now + 24 * 60 * 60 * 1000;
    const claimExpiresAt = nextClaimAt + 24 * 60 * 60 * 1000;

    const updates = {
      daysRemaining: newDaysRemaining,
      lostCount: newLostCount,
      status: newStatus as 'active' | 'completed' | 'expired',
      nextClaimAt,
      claimExpiresAt,
    };

    setOrders((prev) => prev.map((ord) => (ord.id === orderId ? { ...ord, ...updates } : ord)));
    updateOrderInFirestore(orderId, updates);
  };

  const handleConfirmPurchase = (product: Product, quantity: number = 1) => {
    // Check if free gift product has already been claimed by this user
    if (isFreeGiftProduct(product)) {
      if (hasUserClaimedFreeGift(product, orders)) {
        alert('You have already claimed this free gift plan! Each user is allowed a maximum of 1 claim.');
        return;
      }
      if (quantity > 1) {
        quantity = 1;
      }
    }

    const totalPrice = product.price * quantity;
    if (user.balance < totalPrice && !isFreeGiftProduct(product)) {
      alert('Insufficient balance. Please recharge first.');
      return;
    }
    if (totalPrice > 0) {
      setUser((prev) => ({ ...prev, balance: Math.max(0, prev.balance - totalPrice) }));
      incrementUserBalanceInFirestore(user.phone, -totalPrice);
    }

    const createdOrders: Order[] = [];
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;

    for (let i = 0; i < quantity; i++) {
      const timestamp = now + i;
      const nextClaimAt = timestamp + DAY_MS; // strict 24 hours after purchase
      const claimExpiresAt = nextClaimAt + DAY_MS; // expires 24h after becoming claimable

      const newOrder: Order = {
        id: `ord-${timestamp}`,
        orderNumber: `CP${timestamp}`,
        productId: product.id,
        productTitle: quantity > 1 ? `${product.title} (Unit ${i + 1}/${quantity})` : product.title,
        productImage: product.imageUrl,
        price: product.price,
        dailyIncome: product.dailyIncome,
        totalIncome: product.totalIncome,
        cycleDays: product.cycleDays,
        daysRemaining: product.cycleDays,
        status: 'active',
        purchasedAt: new Date().toLocaleString(),
        earnedSoFar: 0,
        nextClaimAt,
        claimExpiresAt,
        lostCount: 0,
      };
      createdOrders.push(newOrder);
      addOrderToFirestore(user.phone, newOrder);
    }

    setOrders((prev) => [...createdOrders, ...prev]);
    handleAddTransaction({
      id: `tx-${now}`,
      reference: `PUR-${now}`,
      type: 'Purchase',
      amount: totalPrice,
      date: new Date().toLocaleString(),
      status: 'success',
    });

    // Credit product purchase commissions to 3-tier direct/indirect referrers
    if (user.referredBy && totalPrice > 0) {
      creditReferralCommissionsForPurchase(user.phone, totalPrice, product.title, createdOrders[0]?.id || `pur-${now}`);
    }

    setSelectedProduct(null);
    setCurrentScreen('order');
  };

  const handleAdminAllocateProduct = (userPhone: string, product: Product, quantity: number = 1) => {
    if (!userPhone) {
      alert('Invalid target user account specified.');
      return;
    }
    const target = allUsers.find((u) => u.phone === userPhone);
    const targetPhone = target ? target.phone : userPhone;

    const createdOrders: Order[] = [];
    const now = Date.now();
    const DAY_MS = 24 * 60 * 60 * 1000;

    for (let i = 0; i < quantity; i++) {
      const timestamp = now + i;
      const nextClaimAt = timestamp + DAY_MS;
      const claimExpiresAt = nextClaimAt + DAY_MS;

      const newOrder: Order = {
        id: `ord-alloc-${timestamp}`,
        orderNumber: `GRANT${timestamp}`,
        productId: product.id,
        productTitle: quantity > 1 ? `${product.title} (Allocated Unit ${i + 1}/${quantity})` : `${product.title} (Allocated)`,
        productImage: product.imageUrl,
        price: product.price,
        dailyIncome: product.dailyIncome,
        totalIncome: product.totalIncome,
        cycleDays: product.cycleDays,
        daysRemaining: product.cycleDays,
        status: 'active',
        purchasedAt: new Date().toLocaleString(),
        earnedSoFar: 0,
        nextClaimAt,
        claimExpiresAt,
        lostCount: 0,
      };
      createdOrders.push(newOrder);
      addOrderToFirestore(targetPhone, newOrder);
    }

    if (targetPhone === user.phone) {
      setOrders((prev) => [...createdOrders, ...prev]);
    }

    handleAddTransaction({
      id: `tx-alloc-${now}`,
      reference: `ADMIN-GRANT-${now}`,
      type: 'Admin Allocation',
      amount: product.price * quantity,
      date: new Date().toLocaleString(),
      status: 'success',
    });

    creditReferralCommissionsForPurchase(targetPhone, product.price * quantity, product.title, `alloc-${now}`);

    alert(`Successfully allocated ${quantity} unit(s) of "${product.title}" to user ${targetPhone}!`);
  };

  const handleCheckInClaim = (amount: number) => {
    const today = new Date().toDateString();
    if (user.lastCheckInDate && new Date(user.lastCheckInDate).toDateString() === today) {
      setToast({
        title: 'Already Checked In Today',
        subtitle: 'Daily attendance reward is limited to once per calendar day. Come back tomorrow!'
      });
      setTimeout(() => setToast(null), 4000);
      return;
    }

    const nowIso = new Date().toISOString();
    handleUpdateUser((prev) => ({ 
      ...prev, 
      balance: prev.balance + amount,
      lastCheckInDate: nowIso 
    }));
    updateUserInFirestore(user.phone, { lastCheckInDate: nowIso });
    handleAddTransaction({
      id: `tx-${Date.now()}`,
      reference: `ZJ${Date.now()}`,
      type: 'Prize',
      amount,
      date: new Date().toLocaleString(),
      status: 'success',
    });
    setToast({
      title: `₦${amount} Daily Attendance Reward Added`,
      subtitle: 'Come back tomorrow for your next reward!'
    });
    setTimeout(() => setToast(null), 4000);
  };

  const handleRescueClaim = (amount: number) => {
    handleUpdateUser((prev) => ({ ...prev, balance: prev.balance + amount }));
    handleAddTransaction({
      id: `tx-${Date.now()}`,
      reference: `RC${Date.now()}`,
      type: 'Prize',
      amount,
      date: new Date().toLocaleString(),
      status: 'success',
    });
  };

  const handleClaimTaskReward = (taskId: string, rewardAmount: number) => {
    handleUpdateUser((prev) => {
      const completed = prev.completedTasks || [];
      if (completed.includes(taskId)) return prev;
      return {
        ...prev,
        balance: prev.balance + rewardAmount,
        completedTasks: [...completed, taskId],
      };
    });

    handleAddTransaction({
      id: `tx-${Date.now()}`,
      reference: `TSK-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'Prize',
      amount: rewardAmount,
      date: new Date().toLocaleString(),
      status: 'success',
    });
  };

  // Real-time Firestore & Auth synchronization for User, Products, Transactions, Orders, Announcements
  useEffect(() => {
    const unsubAuth = subscribeAuthState((authUser) => {
      if (authUser && authUser.email) {
        const match = authUser.email.match(/^user_([0-9]+)@/);
        if (match && match[1]) {
          const phone = resolveActivePhone(match[1]);
          if (phone) {
            setUser((prev) => ({ ...prev, phone: prev.phone ? resolveActivePhone(prev.phone) : phone }));
            localStorage.setItem('last_user_phone', phone);
            setCurrentScreen((screen) => (screen === 'login' || screen === 'signup' ? 'home' : screen));
          }
        }
      }
    });

    const unsubUser = user.phone ? subscribeUser(user.phone, (updatedUser) => {
      isUserLoadedRef.current = true;
      const cleanP = resolveActivePhone(updatedUser.phone || user.phone);
      setUser((prev) => ({
        ...prev,
        ...updatedUser,
        phone: cleanP || prev.phone,
        balance: (updatedUser.balance !== undefined && !isNaN(updatedUser.balance)) ? updatedUser.balance : prev.balance,
        teamSize: updatedUser.teamSize !== undefined ? updatedUser.teamSize : prev.teamSize,
        totalCommissions: updatedUser.totalCommissions !== undefined ? updatedUser.totalCommissions : prev.totalCommissions,
        inviteCode: updatedUser.inviteCode || updatedUser.referralCode || prev.inviteCode || prev.referralCode,
        referralCode: updatedUser.referralCode || updatedUser.inviteCode || prev.referralCode || prev.inviteCode,
        teamMembers: (updatedUser.teamMembers && updatedUser.teamMembers.length > 0) ? updatedUser.teamMembers : (prev.teamMembers || []),
        records: (updatedUser.records && updatedUser.records.length > 0) ? updatedUser.records : (prev.records || []),
        purchasedProducts: (updatedUser.purchasedProducts && updatedUser.purchasedProducts.length > 0) ? updatedUser.purchasedProducts : (prev.purchasedProducts || []),
      }));
    }, user) : () => {};

    const unsubProducts = subscribeProducts((updatedProducts) => {
      setProducts(updatedProducts);
    });

    const unsubTransactions = user.phone ? subscribeTransactions(user.phone, (updatedTxs) => {
      setTransactions(updatedTxs);
    }) : () => {};

    const unsubOrders = user.phone ? subscribeOrders(user.phone, (updatedOrders) => {
      setOrders(updatedOrders);
    }) : () => {};

    const unsubAnnouncements = subscribeAnnouncements((annList) => {
      setAnnouncements(annList);
    });

    const unsubPaymentConfig = subscribePaymentConfig((cfg) => {
      setPaymentConfig(cfg);
    });

    const unsubDeposits = subscribeDeposits((deps) => {
      setPendingDeposits(deps);
    });

    const unsubWithdrawals = subscribeWithdrawals((wds) => {
      setPendingWithdrawals(wds);
    });

    const unsubAllUsers = subscribeAllUsers((users) => {
      setAllUsers(users);
    });

    const unsubAllOrders = subscribeAllOrders((orders) => {
      setAllOrders(orders);
    });

    const unsubAllTransactions = subscribeAllTransactions((txs) => {
      setAllTransactions(txs);
    });

    const unsubRedemptionCodes = subscribeRedemptionCodes((codes) => {
      setRedemptionCodes(codes);
    });

    const unsubAuditLogs = subscribeBalanceAuditLogs((logs) => {
      setBalanceAuditLogs(logs);
    });

    const unsubSecurityLogs = subscribeAdminActivityLogs((logs) => {
      setSecurityLogs(logs);
    });

    return () => {
      unsubAuth();
      unsubUser();
      unsubProducts();
      unsubTransactions();
      unsubOrders();
      unsubAnnouncements();
      unsubPaymentConfig();
      unsubDeposits();
      unsubWithdrawals();
      unsubAllUsers();
      unsubAllOrders();
      unsubAllTransactions();
      unsubRedemptionCodes();
      unsubAuditLogs();
      unsubSecurityLogs();
    };
  }, [user.phone]);

  // ==========================================
  // FETCH ON REQUEST: Admin Panel & Specific Screens
  // ==========================================
  const [isFetchingAdminData, setIsFetchingAdminData] = useState(false);
  const [lastAdminFetchedAt, setLastAdminFetchedAt] = useState<Date | null>(null);
  const [isFetchingTeam, setIsFetchingTeam] = useState(false);
  const [isFetchingOrders, setIsFetchingOrders] = useState(false);
  const [isFetchingTransactions, setIsFetchingTransactions] = useState(false);

  // Admin on-demand fetcher
  const handleFetchAdminData = async () => {
    if (isFetchingAdminData) return;
    setIsFetchingAdminData(true);
    soundService.playClick();
    try {
      const snap = await fetchAdminDataOnce();
      setAllUsers(snap.allUsers);
      setAllOrders(snap.allOrders);
      setPendingDeposits(snap.pendingDeposits);
      setPendingWithdrawals(snap.pendingWithdrawals);
      setAllTransactions(snap.allTransactions);
      setRedemptionCodes(snap.redemptionCodes);
      setBalanceAuditLogs(snap.balanceAuditLogs);
      setSecurityLogs(snap.securityLogs);
      setPaymentConfig(snap.paymentConfig);
      setProducts(snap.products);
      setAnnouncements(snap.announcements);
      setLastAdminFetchedAt(snap.fetchedAt);
    } catch (err) {
      console.warn('Error fetching admin data on request:', err);
    } finally {
      setIsFetchingAdminData(false);
    }
  };

  // Fetch admin data on request whenever the admin screen is mounted
  useEffect(() => {
    if (currentScreen === 'admin') {
      handleFetchAdminData();
    }
  }, [currentScreen]);

  // Team on-demand fetcher
  const handleFetchTeamData = async () => {
    if (isFetchingTeam) return;
    setIsFetchingTeam(true);
    soundService.playClick();
    try {
      const usersList = await fetchAllUsersOnce();
      setAllUsers(usersList);
    } catch (err) {
      console.warn('Error fetching team on request:', err);
    } finally {
      setIsFetchingTeam(false);
    }
  };

  // Fetch team members on request when visiting Team or Tasks screen if not yet loaded
  useEffect(() => {
    if (currentScreen === 'team' || currentScreen === 'task') {
      if (allUsers.length === 0) {
        handleFetchTeamData();
      }
    }
  }, [currentScreen]);

  // Orders on-demand fetcher
  const handleRefreshOrders = async () => {
    if (!user.phone || isFetchingOrders) return;
    setIsFetchingOrders(true);
    soundService.playClick();
    try {
      const ords = await fetchUserOrdersOnce(user.phone);
      if (ords && ords.length > 0) {
        setOrders(ords);
      }
    } catch (err) {
      console.warn('Error refreshing orders on request:', err);
    } finally {
      setIsFetchingOrders(false);
    }
  };

  // Transactions on-demand fetcher
  const handleRefreshTransactions = async () => {
    if (!user.phone || isFetchingTransactions) return;
    setIsFetchingTransactions(true);
    soundService.playClick();
    try {
      const txs = await fetchUserTransactionsOnce(user.phone);
      if (txs && txs.length > 0) {
        setTransactions(txs);
      }
    } catch (err) {
      console.warn('Error refreshing transactions on request:', err);
    } finally {
      setIsFetchingTransactions(false);
    }
  };

  const [isSyncing, setIsSyncing] = useState(false);

  // General App-wide on-demand sync (Header, Profile Card)
  const handleSync = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    soundService.playClick();
    try {
      if (user.phone) {
        const [freshUser, freshOrders, freshTxs] = await Promise.all([
          getUserFromFirestore(user.phone),
          fetchUserOrdersOnce(user.phone),
          fetchUserTransactionsOnce(user.phone),
        ]);
        if (freshUser) {
          setUser(freshUser);
        }
        if (freshOrders && freshOrders.length > 0) {
          setOrders(freshOrders);
        }
        if (freshTxs && freshTxs.length > 0) {
          setTransactions(freshTxs);
        }
      }
      const [freshProds, freshAnns, freshCfg] = await Promise.all([
        fetchProductsOnce(),
        fetchAnnouncementsOnce(),
        fetchPaymentConfigOnce(),
      ]);
      if (freshProds && freshProds.length > 0) setProducts(freshProds);
      if (freshAnns && freshAnns.length > 0) setAnnouncements(freshAnns);
      if (freshCfg) setPaymentConfig(freshCfg);
      await new Promise((res) => setTimeout(res, 600));
    } catch (err) {
      console.warn('Manual sync error:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  // Sync user state changes to Firestore safely without clobbering balance or team
  const handleUpdateUser = (updater: (prev: User) => User) => {
    setUser((prev) => {
      const nextUser = updater(prev);
      if (nextUser.phone && isUserLoadedRef.current) {
        updateUserInFirestore(nextUser.phone, {
          bankAccount: nextUser.bankAccount,
          vipLevel: nextUser.vipLevel,
          completedTasks: nextUser.completedTasks,
          lastCheckInDate: nextUser.lastCheckInDate,
          lastIncomeClaimDate: nextUser.lastIncomeClaimDate,
          usdtAddress: nextUser.usdtAddress,
          usdtNetwork: nextUser.usdtNetwork,
        });
      }
      return nextUser;
    });
  };

  // Firestore Admin Handlers
  const handleAdminApproveDeposit = async (dep: PendingDeposit) => {
    const res = await approveDepositInFirestore(dep);
    if (!res.success && !res.alreadyProcessed) {
      alert(`Failed to approve deposit: ${res.message || 'Unknown error'}`);
      return;
    }
    setPendingDeposits((prev) => prev.map((d) => d.id === dep.id ? { ...d, status: 'success' } : d));
    handleFetchAdminData();
  };

  const handleAdminRejectDeposit = async (depId: string) => {
    const res = await rejectDepositInFirestore(depId);
    if (!res.success) {
      alert(`Failed to reject deposit: ${res.message || 'Unknown error'}`);
      return;
    }
    setPendingDeposits((prev) => prev.map((d) => d.id === depId ? { ...d, status: 'failed' } : d));
    handleFetchAdminData();
  };

  const handleAdminApproveWithdrawal = async (wd: PendingWithdrawalReq) => {
    const res = await approveWithdrawalInFirestore(wd.id);
    if (!res.success && !res.alreadyProcessed) {
      alert(`Failed to approve withdrawal: ${res.message || 'Unknown error'}`);
      return;
    }
    setPendingWithdrawals((prev) => prev.map((w) => w.id === wd.id ? { ...w, status: 'success' } : w));
    handleFetchAdminData();
  };

  const handleAdminRejectWithdrawal = async (wd: PendingWithdrawalReq) => {
    const res = await rejectWithdrawalInFirestore(wd.id);
    if (!res.success && !res.alreadyProcessed) {
      alert(`Failed to reject withdrawal: ${res.message || 'Unknown error'}`);
      return;
    }
    setPendingWithdrawals((prev) => prev.map((w) => w.id === wd.id ? { ...w, status: 'failed' } : w));
    handleFetchAdminData();
  };

  const handleAdminCreditUser = async (targetPhone: string, amount: number) => {
    const cleanTarget = resolveActivePhone(targetPhone);
    if (!cleanTarget || amount === 0) return;
    const opId = `admin-${cleanTarget}-${Date.now()}`;
    await verifiedIncrementUserBalance(cleanTarget, amount, 'Admin Allocation', opId);

    addTransactionToFirestore(cleanTarget, {
      id: `tx-admin-${Date.now()}`,
      reference: `ADMIN-CREDIT-${Math.floor(100000 + Math.random() * 900000)}`,
      type: 'Prize',
      amount,
      date: new Date().toLocaleString(),
      status: 'success',
    });
  };

  const handleAdminSetUserVip = (targetPhone: string, vipLevel: number) => {
    updateUserInFirestore(targetPhone, { vipLevel });
  };

  const handleAdminAddAnnouncement = (text: string) => {
    addAnnouncementToFirestore(text);
  };

  const handleAdminDeleteAnnouncement = (id: string) => {
    deleteAnnouncementFromFirestore(id);
  };

  const handleAdminBanAndDeleteUser = async (targetPhone: string) => {
    await banAndDeleteUserInFirestore(targetPhone);
    if (user.phone === targetPhone) {
      alert(`Your account (${targetPhone}) has been permanently banned, blacklisted and deleted.`);
      setUser({
        phone: '',
        balance: 0,
        accruedIncome: 0,
        totalCommissions: 0,
        vipLevel: 1,
        referralCode: '',
        teamSize: 0,
        referralDepositsCount: 0,
        referredBy: '',
        hasReferralDeposit: false,
        referralCount: 0,
        teamTotalInvestment: 0,
        referralDepositAmount: 0,
        bankAccount: undefined,
        completedTasks: [],
        isBanned: true,
      });
      localStorage.removeItem('current_phone');
      setCurrentScreen('login');
    }
  };

  const handleUpgradeVip = (level: number) => {
    const reqMap: Record<number, { referrals: number; products: number }> = {
      1: { referrals: 0, products: 0 },
      2: { referrals: 2, products: 1 },
      3: { referrals: 5, products: 3 },
      4: { referrals: 10, products: 5 },
      5: { referrals: 20, products: 10 },
    };
    const req = reqMap[level] || { referrals: 0, products: 0 };
    const activeProdsCount = orders.filter((o) => o.status === 'active').length;
    
    if (user.teamSize < req.referrals && activeProdsCount < req.products) {
      alert(`To unlock VIP Level ${level}, you need at least ${req.referrals} referrals OR ${req.products} active products.`);
      return;
    }

    handleUpdateUser((prev) => ({ ...prev, vipLevel: level }));
    alert(`Congratulations! You have successfully upgraded to VIP Level ${level}!`);
  };

  const handleAddProduct = (newProd: Product) => {
    setProducts((prev) => [newProd, ...prev]);
    addProductToFirestore(newProd);
  };

  const handleUpdateProduct = (updatedProd: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProd.id ? updatedProd : p)));
    addProductToFirestore(updatedProd);
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
    deleteProductFromFirestore(productId);
  };

  const handleUpdateTransactionStatus = (txId: string, status: 'success' | 'failed') => {
    setTransactions((prev) =>
      prev.map((t) => (t.id === txId ? { ...t, status } : t))
    );
    updateTransactionStatusInFirestore(txId, status);
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-gradient-to-b from-[#0a0818] via-[#120f2b] to-[#0a0818] text-slate-100 font-sans antialiased selection:bg-purple-500 selection:text-white relative">
      <AnimatePresence mode="wait">
        {currentScreen === 'login' ? (
          <motion.div
            key="login"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <LoginScreen onLogin={handleLogin} onNavigate={setCurrentScreen} />
          </motion.div>
        ) : currentScreen === 'signup' ? (
          <motion.div
            key="signup"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
          >
            <SignupScreen onSignup={handleSignup} onNavigate={setCurrentScreen} />
          </motion.div>
        ) : (
          <motion.div key="app-shell" className="w-full max-w-full overflow-x-hidden relative">
            {/* Ambient Background of the exact uploaded Times Square Davido & Dangote photograph */}
            <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none select-none opacity-25">
              <img
                src="/THE-NEW-YORK-PICTURE-WITH-DAVIDO.jpeg"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = '/images/THE-NEW-YORK-PICTURE-WITH-DAVIDO.jpeg';
                }}
                alt="Davido and Aliko Dangote in Times Square"
                className="w-full h-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-b from-[#0a0818]/60 via-[#0a0818]/80 to-[#0a0818]/95" />
            </div>

            {/* Background glow effects */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-md h-[300px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none overflow-hidden"></div>

            {currentScreen !== 'admin' && (
              <Header currentScreen={currentScreen} onNavigate={setCurrentScreen} onSync={handleSync} isSyncing={isSyncing} user={user} />
            )}

      <main className="relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, y: 8, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.99 }}
            transition={{ duration: 0.18, ease: "easeInOut" }}
          >
            {currentScreen === 'home' && (
              <HomeScreen
                userBalance={user.balance}
                accruedIncome={user.accruedIncome}
                teamSize={user.teamSize}
                vipLevel={user.vipLevel}
                onNavigate={setCurrentScreen}
                onOpenCheckIn={() => setShowCheckIn(true)}
                onOpenRescue={() => setShowRescue(true)}
                products={products}
                userOrders={orders}
                transactions={transactions}
                balanceAuditLogs={balanceAuditLogs}
                onSelectProduct={(p) => setSelectedProduct(p)}
                usdNairaRate={paymentConfig?.usdtNairaRate || 1500}
              />
            )}

            {currentScreen === 'products' && (
              <ProductsScreen
                products={products}
                userOrders={orders}
                onSelectProduct={(p) => setSelectedProduct(p)}
                usdNairaRate={paymentConfig?.usdtNairaRate || 1500}
              />
            )}

            {currentScreen === 'roadmap' && (
              <RoadmapScreen onNavigate={setCurrentScreen} />
            )}

            {currentScreen === 'task' && (
              <TaskScreen
                user={user}
                allUsers={allUsers}
                allOrders={orders}
                onNavigate={setCurrentScreen}
                onClaimTaskReward={handleClaimTaskReward}
                usdNairaRate={paymentConfig?.usdtNairaRate || 1500}
              />
            )}

            {currentScreen === 'order' && (
              <OrderScreen
                orders={orders}
                onClaimEarnings={handleClaimEarnings}
                onClaimAllEarnings={handleClaimAllEarnings}
                onForfeitOrder={handleForfeitOrder}
                onNavigate={setCurrentScreen}
                usdNairaRate={paymentConfig?.usdtNairaRate || 1500}
                lastIncomeClaimDate={user.lastIncomeClaimDate}
                onRefreshOrders={handleRefreshOrders}
                isRefreshingOrders={isFetchingOrders}
              />
            )}

            {currentScreen === 'my' && (
              <ProfileScreen
                user={user}
                onNavigate={setCurrentScreen}
                onOpenRescue={() => setShowRescue(true)}
                onOpenRedeemCode={() => setShowRedeemCode(true)}
                onOpenChangePassword={() => setShowChangePassword(true)}
                onLogout={handleLogout}
                usdNairaRate={paymentConfig?.usdtNairaRate || 1500}
                onRefreshProfile={handleSync}
                isRefreshingProfile={isSyncing}
              />
            )}

            {currentScreen === 'recharge' && (
              <RechargeScreen onNavigate={setCurrentScreen} onRecharge={handleRecharge} paymentConfig={paymentConfig} />
            )}

            {currentScreen === 'withdraw' && (
              <WithdrawScreen 
                userBalance={user.balance} 
                userBank={user.bankAccount} 
                userOrders={orders} 
                transactions={allUserTransactions}
                user={user}
                isFrozen={user.isFrozen} 
                paymentConfig={paymentConfig}
                onNavigate={setCurrentScreen} 
                onWithdraw={handleWithdraw} 
                onSaveBank={(bank) => handleUpdateUser(prev => ({ 
                  ...prev, 
                  bankAccount: bank,
                  usdtAddress: bank.usdtAddress || prev.usdtAddress,
                  usdtNetwork: bank.usdtNetwork || prev.usdtNetwork,
                }))}
              />
            )}

            {currentScreen === 'vip' && (
              <VipScreen
                currentVip={user.vipLevel}
                teamSize={user.teamSize}
                activeProductsCount={orders.filter((o) => o.status === 'active').length}
                onNavigate={setCurrentScreen}
                onUpgradeVip={handleUpgradeVip}
              />
            )}

            {currentScreen === 'team' && (
              <TeamScreen 
                teamSize={user.teamSize} 
                referralCode={user.referralCode} 
                allUsers={allUsers} 
                allOrders={allOrders} 
                currentUser={user} 
                transactions={allUserTransactions} 
                onNavigate={setCurrentScreen}
                onRefreshTeam={handleFetchTeamData}
                isRefreshingTeam={isFetchingTeam}
              />
            )}

            {currentScreen === 'bills' && (
              <TransactionsScreen 
                title="Funding Details & Bills" 
                transactions={allUserTransactions} 
                balanceAuditLogs={balanceAuditLogs} 
                userPhone={user.phone} 
                onNavigate={setCurrentScreen} 
                usdNairaRate={paymentConfig?.usdtNairaRate || 1500}
                onRefreshTransactions={handleRefreshTransactions}
                isRefreshingTransactions={isFetchingTransactions}
              />
            )}

            {currentScreen === 'commission_record' && (
              <TransactionsScreen 
                title="Commission Record" 
                transactions={allUserTransactions.filter(t => t.type === 'Team Commission')} 
                balanceAuditLogs={balanceAuditLogs} 
                userPhone={user.phone} 
                onNavigate={setCurrentScreen} 
                usdNairaRate={paymentConfig?.usdtNairaRate || 1500}
                onRefreshTransactions={handleRefreshTransactions}
                isRefreshingTransactions={isFetchingTransactions}
              />
            )}

            {currentScreen === 'income_record' && (
              <TransactionsScreen 
                title="Income Record" 
                transactions={allUserTransactions.filter(t => ['Earnings', 'Redemption'].includes(t.type))} 
                balanceAuditLogs={balanceAuditLogs} 
                userPhone={user.phone} 
                onNavigate={setCurrentScreen} 
                usdNairaRate={paymentConfig?.usdtNairaRate || 1500}
                onRefreshTransactions={handleRefreshTransactions}
                isRefreshingTransactions={isFetchingTransactions}
              />
            )}

            {currentScreen === 'bank_account' && (
              <BankAccountScreen onNavigate={setCurrentScreen} userBank={user.bankAccount} onSaveBank={(bank) => handleUpdateUser(prev => ({ ...prev, bankAccount: bank }))} />
            )}

            {currentScreen === 'about_us' && (
              <AboutUsScreen onNavigate={setCurrentScreen} />
            )}

            {currentScreen === 'support' && (
              <SupportChatScreen onNavigate={setCurrentScreen} />
            )}

            {currentScreen === 'setup' && (
              <SetupScreen onNavigate={setCurrentScreen} />
            )}

            {currentScreen === 'withdrawal_records' && (
              <WithdrawalRecordsScreen user={user} pendingWithdrawals={pendingWithdrawals} onNavigate={setCurrentScreen} />
            )}

            {currentScreen === 'security_log' && (
              <SecurityLogScreen user={user} onNavigate={setCurrentScreen} />
            )}

            {currentScreen === 'admin' && (
              (isAdminUser(user) || adminAuthVersion > 0) ? (
                <AdminPanelScreen
                  user={user}
                  onBanAndDeleteUser={handleAdminBanAndDeleteUser}
                  onUpdateUserTeam={(phone, teamSize, referralDepositsCount, referredBy, totalCommissions, referralCount, newPhone, teamTotalInvestment, referralDepositAmount, referralCode) => {
                    updateUserInFirestore(phone, {
                      phone: newPhone,
                      teamSize,
                      referralDepositsCount,
                      referredBy,
                      totalCommissions,
                      referralCount,
                      teamTotalInvestment,
                      referralDepositAmount,
                      referralCode
                    });
                    if (newPhone && newPhone !== phone) {
                      updateUserInFirestore(newPhone, {
                        phone: newPhone,
                        teamSize,
                        referralDepositsCount,
                        referredBy,
                        totalCommissions,
                        referralCount,
                        teamTotalInvestment,
                        referralDepositAmount,
                        referralCode
                      });
                    }
                    alert(`Updated user profile, phone, team & commissions for user ${phone}!`);
                  }}
                  onUpdateUser={handleUpdateUser}
                  paymentConfig={paymentConfig}
                  onUpdatePaymentConfig={updatePaymentConfigInFirestore}
                  products={products}
                  onAddProduct={handleAddProduct}
                  onUpdateProduct={handleUpdateProduct}
                  onDeleteProduct={handleDeleteProduct}
                  transactions={transactions}
                  onAddTransaction={handleAddTransaction}
                  onUpdateTransactionStatus={handleUpdateTransactionStatus}
                  onNavigate={setCurrentScreen}
                  allUsers={allUsers}
                  allOrders={allOrders}
                  pendingDeposits={pendingDeposits}
                  pendingWithdrawals={pendingWithdrawals}
                  announcements={announcements}
                  allTransactions={allTransactions}
                  redemptionCodes={redemptionCodes}
                  onAddRedemptionCode={(codeData) => addRedemptionCodeToFirestore(codeData)}
                  onDeleteRedemptionCode={(codeId) => deleteRedemptionCodeFromFirestore(codeId)}
                  onApproveDeposit={handleAdminApproveDeposit}
                  onRejectDeposit={handleAdminRejectDeposit}
                  onApproveWithdrawal={handleAdminApproveWithdrawal}
                  onRejectWithdrawal={handleAdminRejectWithdrawal}
                  onCreditUser={handleAdminCreditUser}
                  onSetUserVip={handleAdminSetUserVip}
                  onAddAnnouncement={handleAdminAddAnnouncement}
                  onDeleteAnnouncement={handleAdminDeleteAnnouncement}
                  onUpdateOrder={(orderId, updates) => updateOrderInFirestore(orderId, updates)}
                  onDeleteOrder={(orderId) => deleteOrderFromFirestore(orderId)}
                  onUpdateUserBank={(phone, bank) => updateUserInFirestore(phone, { bankAccount: bank })}
                  onToggleUserBan={(phone, isBanned) => updateUserInFirestore(phone, { isBanned })}
                  onToggleUserFreeze={(phone, isFrozen) => updateUserInFirestore(phone, { isFrozen })}
                  onAllocateProduct={handleAdminAllocateProduct}
                  onUpdateUserPhone={(oldPhone, newPhone) => {
                    updateUserPhoneInFirestore(oldPhone, newPhone);
                    alert(`Updated downline phone number from ${oldPhone} to ${newPhone}!`);
                  }}
                  onAddDownlineUser={(referrerPhone, referrerCode, newDownlinePhone, registrationAmount) => {
                     addDownlineUserInFirestore(referrerPhone, referrerCode, newDownlinePhone, registrationAmount);
                     alert(`Added new user ${newDownlinePhone} as downline for ${referrerPhone} with ₦${(registrationAmount || 0).toLocaleString()} registration amount!`);
                   }}
                   onUpdateUserReferredBy={(userPhone, newReferredBy) => {
                     updateUserInFirestore(userPhone, { referredBy: newReferredBy });
                   }}
                   onUpdateUserInvestmentAmount={(userPhone, amount) => {
                     setUserInvestmentAmountInFirestore(userPhone, amount, allOrders);
                     alert(`Updated registration/investment amount for ${userPhone} to ₦${amount.toLocaleString()}!`);
                   }}
                   onFetchAdminData={handleFetchAdminData}
                   isFetchingAdminData={isFetchingAdminData}
                   lastFetchedAt={lastAdminFetchedAt}
                 />
              ) : (
                <AdminGateScreen
                  onUnlock={() => setAdminAuthVersion(v => v + 1)}
                  onNavigate={setCurrentScreen}
                />
              )
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating 24/7 Customer Care Specialist Pill Widget */}
      <FloatingCustomerService
        currentScreen={currentScreen}
        onNavigate={setCurrentScreen}
      />

      <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />

      {/* Modals */}
      {showCheckIn && (
        <CheckInModal 
          onClose={() => setShowCheckIn(false)} 
          onClaim={handleCheckInClaim} 
          lastCheckInDate={user.lastCheckInDate}
        />
      )}

      {showRescue && (
        <RescuePresentModal
          onClose={() => setShowRescue(false)}
          onRedeem={handleRedeemCode}
        />
      )}

      {showRedeemCode && (
        <RedeemCodeModal
          onClose={() => setShowRedeemCode(false)}
          onRedeem={handleRedeemCode}
        />
      )}

      {showChangePassword && (
        <ChangePasswordModal
          onClose={() => setShowChangePassword(false)}
          onUpdatePassword={handleUpdatePassword}
        />
      )}

      {selectedProduct && (
        <PurchaseModal
          product={selectedProduct}
          userBalance={user.balance}
          userOrders={orders}
          onClose={() => setSelectedProduct(null)}
          onConfirm={handleConfirmPurchase}
          usdNairaRate={paymentConfig?.usdtNairaRate || 1500}
        />
      )}

      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-5 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-emerald-500/50 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 max-w-md w-[90%] backdrop-blur-md"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center shrink-0 border border-emerald-500/30 text-emerald-400 font-black">
              ✓
            </div>
            <div className="flex-1">
              <div className="text-xs font-black text-emerald-400">{toast.title}</div>
              <div className="text-[11px] text-slate-300 font-medium">{toast.subtitle}</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
