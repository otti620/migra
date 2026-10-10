export type UserRole = 'guest' | 'user' | 'admin';

export interface User {
  id: string;
  phone: string;
  email?: string;
  isAdmin?: boolean;
  role?: UserRole;
  password?: string;
  balance: number;
  accruedIncome: number;
  vipLevel: number;
  teamSize: number;
  referralCode: string;
  hasReferralDeposit: boolean;
  referralDepositsCount: number;
  hasDeposited?: boolean;
  totalDeposits?: number;
  referredBy?: string;
  createdAt?: string;
  completedTasks?: string[];
  isBanned?: boolean;
  isFrozen?: boolean;
  adminNotes?: string;
  totalCommissions?: number;
  referralCount?: number;
  teamTotalInvestment?: number;
  referralDepositAmount?: number;
  lastCheckInDate?: string;
  lastIncomeClaimDate?: string;
  inviteCode?: string;
  invitedBy?: string;
  teamMembers?: Array<{
    id?: string;
    phone: string;
    level?: number;
    inviteCode?: string;
    invested?: number;
    commission?: number;
    joinDate?: string;
    status?: string;
  }>;
  records?: Array<{
    id?: string;
    title?: string;
    type?: string;
    amount?: number;
    details?: string;
    timestamp?: number;
    status?: string;
    fee?: number;
    bankAccount?: any;
  }>;
  purchasedProducts?: Array<{
    productId?: string;
    instanceId?: string;
    title?: string;
    dailyIncome?: number;
    totalIncome?: number;
    purchaseDate?: number;
    lastClaimDate?: number;
    validityDays?: number;
    daysActive?: number;
    vipLevel?: string;
    image?: string;
  }>;
  cumulativeIncome?: number;
  usdtAddress?: string;
  usdtNetwork?: string;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
    usdtAddress?: string;
    usdtNetwork?: string;
  };
  nigerianBank?: {
    bankName: string;
    accountNumber: string;
    accountName: string;
  };
}

export interface PaymentConfig {
  id?: string;
  usdtAddress: string;
  usdtNetwork: 'TRC20';
  qrCodeUrl?: string;
  minDepositUsdt: number;
  minDepositNaira?: number;
  usdtNairaRate?: number;
  paymentNotice?: string;
  nairaBankName?: string;
  nairaAccountNumber?: string;
  nairaAccountName?: string;
  nairaPaymentNotice?: string;
  updatedAt?: string;
}

export interface Product {
  id: string;
  title: string;
  category: 'Public IPO' | 'Petrochemical' | 'VIP Institutional' | 'VIP';
  imageUrl: string;
  price: number;
  totalIncome: number;
  dailyIncome: number;
  cycleDays: number;
  quota: number;
  countdown: {
    hours: number;
    minutes: number;
    seconds: number;
  };
  hot?: boolean;
  galleryImages?: string[];
  isExpired?: boolean;
  expiresAtTimestamp?: number;
}

export interface RedemptionCode {
  id: string;
  code: string;
  rewardAmount: number;
  maxUses: number;
  usedCount: number;
  usedByPhones: string[];
  createdAt: string;
  isActive: boolean;
}

export interface Order {
  id: string;
  orderNumber: string;
  userPhone?: string;
  productId: string;
  productTitle: string;
  productImage: string;
  price: number;
  dailyIncome: number;
  totalIncome: number;
  cycleDays: number;
  daysRemaining: number;
  status: 'active' | 'completed' | 'expired';
  purchasedAt: string;
  createdAt?: string;
  earnedSoFar: number;
  nextClaimAt?: number;
  claimExpiresAt?: number;
  lastClaimedAt?: string;
  lostCount?: number;
}

export interface Transaction {
  id: string;
  reference: string;
  userPhone?: string;
  type: 'Recharge' | 'Withdrawal' | 'Earnings' | 'Redemption' | 'Team Commission' | 'Prize' | 'Purchase' | 'Task Bonus' | 'Admin Allocation';
  amount: number;
  date: string;
  status: 'success' | 'pending' | 'failed';
  description?: string;
}

export interface PendingDeposit {
  id: string;
  userPhone: string;
  amount: number;
  paymentMethod: string;
  currency?: 'NGN' | 'USDT';
  reference: string;
  time: string;
  status: 'pending' | 'success' | 'failed';
  usdtAddress?: string;
  usdtTxHash?: string;
  network?: string;
  usdtAmount?: number;
  senderBankName?: string;
  senderAccountName?: string;
  assignedAccount?: string;
  proofUrl?: string;
}

export interface PendingWithdrawalReq {
  id: string;
  userPhone: string;
  amount: number;
  payoutMethod?: 'bank' | 'usdt';
  usdtAddress?: string;
  network?: string;
  usdtAmount?: number;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  reference: string;
  time: string;
  status: 'pending' | 'success' | 'failed';
}

export interface AnnouncementItem {
  id: string;
  text: string;
  createdAt: string;
}

export interface BalanceAuditLog {
  id: string;
  phone: string;
  deltaAmount: number;
  eventType: string;
  referenceId?: string;
  verifiedAt: string;
  status: string;
}

export interface AdminActivityLog {
  id: string;
  adminPhone: string;
  action: 'approve' | 'reject';
  targetType: 'deposit' | 'withdrawal';
  recordId: string;
  userPhone?: string;
  amount?: number;
  timestamp: string;
}

export type ActiveScreen = 
  | 'login'
  | 'signup'
  | 'home'
  | 'products'
  | 'roadmap'
  | 'task'
  | 'order'
  | 'my'
  | 'recharge'
  | 'withdraw'
  | 'vip'
  | 'team'
  | 'bills'
  | 'income_record'
  | 'commission_record'
  | 'bank_account'
  | 'about_us'
  | 'support'
  | 'setup'
  | 'withdrawal_records'
  | 'security_log'
  | 'admin';
