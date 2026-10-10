// Centralized input validation & sanitization utilities
import { Order } from '../types';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validates mobile phone numbers for registration/login
 */
export function validatePhone(phone: string): ValidationResult & { cleanPhone: string } {
  if (!phone || !phone.trim()) {
    return { isValid: false, cleanPhone: '', error: 'Phone number is required.' };
  }
  const digits = phone.replace(/[^0-9]/g, '');
  if (digits.length < 10) {
    return { isValid: false, cleanPhone: digits, error: 'Phone number must be at least 10 digits.' };
  }
  if (digits.length > 15) {
    return { isValid: false, cleanPhone: digits, error: 'Phone number is too long (max 15 digits).' };
  }
  return { isValid: true, cleanPhone: digits };
}

/**
 * Validates user authentication passwords
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required.' };
  }
  if (password.length < 6) {
    return { isValid: false, error: 'Password must be at least 6 characters long.' };
  }
  return { isValid: true };
}

/**
 * Validates USDT Wallet details (TRON TRC20 ONLY)
 */
export function validateUsdtWallet(wallet: {
  network?: string;
  address: string;
  walletName?: string;
}): ValidationResult & { fieldErrors: { network?: string; address?: string; walletName?: string } } {
  const fieldErrors: { network?: string; address?: string; walletName?: string } = {};

  const cleanAddr = (wallet.address || '').trim();
  if (!cleanAddr || cleanAddr.length < 24 || cleanAddr.length > 55) {
    fieldErrors.address = 'Please enter a valid USDT TRON (TRC20) wallet address.';
  } else if (!cleanAddr.startsWith('T')) {
    fieldErrors.address = 'Invalid network: USDT TRON (TRC20) addresses MUST start with "T".';
  }

  const isValid = Object.keys(fieldErrors).length === 0;
  const firstError = Object.values(fieldErrors)[0];

  return { isValid, error: firstError, fieldErrors };
}

/**
 * Validates bank account details (NUBAN 10-digit format for Nigeria)
 */
export function validateBankAccount(bank: {
  bankName: string;
  accountNumber: string;
  accountName: string;
}): ValidationResult & { fieldErrors: { bankName?: string; accountNumber?: string; accountName?: string } } {
  const fieldErrors: { bankName?: string; accountNumber?: string; accountName?: string } = {};

  if (!bank.bankName || !bank.bankName.trim() || bank.bankName.trim().length < 2) {
    fieldErrors.bankName = 'Please select or enter a valid bank name.';
  }

  const cleanAccNum = bank.accountNumber ? bank.accountNumber.replace(/[^0-9]/g, '') : '';
  if (!cleanAccNum || cleanAccNum.length !== 10) {
    fieldErrors.accountNumber = 'Account number must be exactly 10 digits (NUBAN format).';
  }

  if (!bank.accountName || !bank.accountName.trim() || bank.accountName.trim().length < 3) {
    fieldErrors.accountName = 'Please enter your full account holder name.';
  }

  const isValid = Object.keys(fieldErrors).length === 0;
  const firstError = Object.values(fieldErrors)[0];

  return { isValid, error: firstError, fieldErrors };
}

/**
 * Checks if the current time falls within the allowed withdrawal schedule:
 * Monday to Friday, 10:00 AM - 5:00 PM (10:00 - 17:00).
 */
export function isWithdrawalScheduleValid(now: Date = new Date()): ValidationResult {
  const day = now.getDay(); // 0 = Sunday, 6 = Saturday
  const hour = now.getHours(); // 0 - 23

  if (day === 0 || day === 6) {
    return {
      isValid: false,
      error: 'Withdrawal window is closed on weekends (Saturday & Sunday). Operating hours are Monday to Friday, 10:00 AM - 5:00 PM.',
    };
  }

  if (hour < 10 || hour >= 17) {
    return {
      isValid: false,
      error: 'Withdrawal window is currently closed. Operating hours are Monday to Friday, 10:00 AM to 5:00 PM.',
    };
  }

  return { isValid: true };
}

/**
 * Validates withdrawal requests
 */
export function validateWithdrawal(
  amount: number | string,
  userBalance: number,
  userBank?: { bankName?: string; accountNumber?: string; accountName?: string; usdtAddress?: string; usdtNetwork?: string } | { bankName: string; accountNumber: string; accountName: string },
  skipScheduleCheck: boolean = false,
  userOrders: Order[] = [],
  payoutMethod: 'bank' | 'usdt' = 'bank'
): ValidationResult & { fee: number; netReceive: number } {
  if (!skipScheduleCheck) {
    const scheduleCheck = isWithdrawalScheduleValid();
    if (!scheduleCheck.isValid && scheduleCheck.error) {
      return {
        isValid: false,
        error: scheduleCheck.error,
        fee: 0,
        netReceive: 0,
      };
    }
  }

  const numVal = typeof amount === 'number' ? amount : parseFloat(amount);

  const hasBank = !!(userBank && (userBank as any).bankName && (userBank as any).accountNumber && (userBank as any).accountNumber.length === 10);
  const hasUsdt = !!(userBank && ((userBank as any).usdtAddress || ((userBank as any).accountNumber?.length > 20 && (userBank as any).accountNumber?.startsWith('T'))));

  if (payoutMethod === 'bank' && !hasBank) {
    return {
      isValid: false,
      error: 'Please provide or bind your Nigerian bank account (10-digit NUBAN) before requesting a withdrawal.',
      fee: 0,
      netReceive: 0,
    };
  }

  if (payoutMethod === 'usdt' && !hasUsdt) {
    return {
      isValid: false,
      error: 'Please provide or bind your TRC20 USDT receiving wallet address before requesting a withdrawal.',
      fee: 0,
      netReceive: 0,
    };
  }

  if (!userBank || (!hasBank && !hasUsdt)) {
    return {
      isValid: false,
      error: 'Please bind your Nigerian bank account or USDT wallet before requesting a withdrawal.',
      fee: 0,
      netReceive: 0,
    };
  }

  if (isNaN(numVal) || numVal <= 0) {
    return { isValid: false, error: 'Please enter a valid positive withdrawal amount.', fee: 0, netReceive: 0 };
  }

  // Enforce paid product purchase requirement
  const hasPurchasedPaidProduct = userOrders.some(
    (o) => (o.price > 0 || !isFreeGiftProduct(o)) && (o.status === 'active' || o.status === 'completed')
  );
  if (!hasPurchasedPaidProduct) {
    return {
      isValid: false,
      error: 'Withdrawal restricted: You must deposit funds and purchase an active share tranche before making a withdrawal.',
      fee: 0,
      netReceive: 0,
    };
  }

  if (numVal < 1000) {
    return { isValid: false, error: 'Minimum withdrawal amount is ₦1,000.', fee: 0, netReceive: 0 };
  }

  if (numVal > 1000000) {
    return { isValid: false, error: 'Maximum withdrawal limit per transaction is ₦1,000,000.', fee: 0, netReceive: 0 };
  }

  if (userBalance < 0) {
    return {
      isValid: false,
      error: 'Withdrawal failed: Account has a negative balance.',
      fee: 0,
      netReceive: 0,
    };
  }

  if (numVal > userBalance) {
    return {
      isValid: false,
      error: `Insufficient balance. Available balance: ₦${Math.max(0, userBalance).toLocaleString()}`,
      fee: 0,
      netReceive: 0,
    };
  }

  const fee = numVal * 0.11; // 11% fee
  const netReceive = Math.max(0, numVal - fee);

  return { isValid: true, fee, netReceive };
}

/**
 * Validates recharge / deposit requests
 */
export function validateDeposit(
  amount: number | string,
  senderName?: string,
  proofRef?: string
): ValidationResult {
  const numVal = typeof amount === 'number' ? amount : parseFloat(amount);

  if (isNaN(numVal) || numVal <= 0) {
    return { isValid: false, error: 'Please enter a valid deposit amount.' };
  }

  if (numVal < 5000) {
    return { isValid: false, error: 'Minimum deposit amount is ₦5,000.' };
  }

  if (numVal > 5000000) {
    return { isValid: false, error: 'Maximum single deposit amount is ₦5,000,000.' };
  }

  if (senderName !== undefined && (!senderName.trim() || senderName.trim().length < 2)) {
    return { isValid: false, error: 'Please provide the account holder name used for transfer.' };
  }

  if (proofRef !== undefined && proofRef.trim().length > 0 && proofRef.trim().length < 4) {
    return { isValid: false, error: 'Transaction reference or session ID must be at least 4 characters.' };
  }

  return { isValid: true };
}

/**
 * Validates admin custom share tranche addition
 */
export function validatePropertyCreation(data: {
  title: string;
  price: number | string;
  dailyReturn: number | string;
  cycleDays: number | string;
}): ValidationResult {
  if (!data.title || !data.title.trim() || data.title.trim().length < 3) {
    return { isValid: false, error: 'Share tranche title must be at least 3 characters long.' };
  }

  const price = Number(data.price);
  if (isNaN(price) || price < 7500) {
    return { isValid: false, error: 'Share tranche price must be at least $5.00 (₦7,500).' };
  }

  const dailyReturn = Number(data.dailyReturn);
  if (isNaN(dailyReturn) || dailyReturn <= 0) {
    return { isValid: false, error: 'Daily dividend return must be greater than ₦0.' };
  }

  const cycleDays = Number(data.cycleDays);
  if (isNaN(cycleDays) || cycleDays < 1 || cycleDays > 365) {
    return { isValid: false, error: 'Yield cycle duration must be between 1 and 365 days.' };
  }

  return { isValid: true };
}

/**
 * Validates Admin Balance Adjustments
 */
export function validateAdminCredit(phone: string, amount: number | string): ValidationResult & { cleanPhone: string } {
  const phoneVal = validatePhone(phone);
  if (!phoneVal.isValid) {
    return { isValid: false, cleanPhone: '', error: `Invalid user phone: ${phoneVal.error}` };
  }

  const numVal = Number(amount);
  if (isNaN(numVal) || numVal <= 0) {
    return { isValid: false, cleanPhone: phoneVal.cleanPhone, error: 'Please enter a positive credit amount.' };
  }

  if (numVal > 50000000) {
    return { isValid: false, cleanPhone: phoneVal.cleanPhone, error: 'Single credit amount cannot exceed ₦50,000,000.' };
  }

  return { isValid: true, cleanPhone: phoneVal.cleanPhone };
}

/**
 * Checks if a product is a free gift or 0-price promotional item
 */
export function isFreeGiftProduct(product: { price?: number; title?: string; id?: string }): boolean {
  if (!product) return false;
  if (product.price === 0) return true;
  const title = (product.title || '').toLowerCase();
  const id = (product.id || '').toLowerCase();
  return title.includes('free gift') || title.includes('free-gift') || title.includes('starter') || title.includes('welcome') || title.includes('grant') || title.includes('jaipur greens') || id.includes('jaipur') || id.includes('free') || id.includes('starter');
}

/**
 * Checks if the user has already purchased/claimed a free gift product
 */
export function hasUserClaimedFreeGift(product: { price?: number; title?: string; id?: string }, userOrders: Order[] = []): boolean {
  if (!product || !isFreeGiftProduct(product)) return false;
  return userOrders.some((o) => {
    if (o.productId === product.id) return true;
    if (isFreeGiftProduct({ price: o.price, title: o.productTitle, id: o.productId })) return true;
    return false;
  });
}

/**
 * Computes the correct daily income for an order, preventing cases where dailyIncome was incorrectly set to totalIncome.
 */
export function getOrderDailyIncome(order: { dailyIncome?: number; totalIncome?: number; cycleDays?: number }): number {
  if (!order) return 0;
  const cycle = Math.max(1, order.cycleDays || 1);
  const total = order.totalIncome || 0;
  const daily = order.dailyIncome || 0;

  if (cycle > 1 && (daily >= total || daily === 0 || daily > total) && total > 0) {
    return Math.round(total / cycle);
  }
  if (!daily && total > 0) {
    return Math.round(total / cycle);
  }
  return daily;
}

export function getProductDailyIncome(product: { dailyIncome?: number; totalIncome?: number; cycleDays?: number }): number {
  if (!product) return 0;
  const cycle = Math.max(1, product.cycleDays || 1);
  const total = product.totalIncome || 0;
  const daily = product.dailyIncome || 0;

  if (cycle > 1 && (daily >= total || daily === 0 || daily > total) && total > 0) {
    return Math.round(total / cycle);
  }
  if (!daily && total > 0) {
    return Math.round(total / cycle);
  }
  return daily;
}

export interface OrderClaimInfo {
  isClaimable: boolean;
  isFinished: boolean;
  isExpired: boolean;
  nextClaimAt: number;
  claimExpiresAt: number;
  remainingMs: number;
  hours: number;
  minutes: number;
  seconds: number;
  formattedCountdown: string;
  hasClaimedToday: boolean;
}

/**
 * Calculates dividend claim eligibility strictly ensuring users can only claim profits ONCE per 24 hours.
 */
export function getOrderClaimInfo(order: Order, now: number = Date.now()): OrderClaimInfo {
  const isFinished = order.status === 'completed' || order.status === 'expired' || (order.daysRemaining !== undefined && order.daysRemaining <= 0);
  const isExpired = order.status === 'expired';

  if (isFinished) {
    return {
      isClaimable: false,
      isFinished: true,
      isExpired,
      nextClaimAt: 0,
      claimExpiresAt: 0,
      remainingMs: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      formattedCountdown: '00:00:00',
      hasClaimedToday: false,
    };
  }

  const DAY_MS = 24 * 60 * 60 * 1000;

  // Determine next eligible claim timestamp
  let nextClaimAt = typeof order.nextClaimAt === 'number' && !isNaN(order.nextClaimAt) ? order.nextClaimAt : 0;

  // If lastClaimedAt exists, next claim is STRICTLY at least 24 hours after lastClaimedAt
  if (order.lastClaimedAt) {
    const lastClaimMs = new Date(order.lastClaimedAt).getTime();
    if (!isNaN(lastClaimMs)) {
      const minNextClaim = lastClaimMs + DAY_MS;
      if (!nextClaimAt || nextClaimAt < minNextClaim) {
        nextClaimAt = minNextClaim;
      }
    }
  }

  // If nextClaimAt is still missing, fallback to purchasedAt + 24 hours
  if (!nextClaimAt) {
    const purchaseMs = order.purchasedAt ? new Date(order.purchasedAt).getTime() : 0;
    if (purchaseMs && !isNaN(purchaseMs)) {
      nextClaimAt = purchaseMs + DAY_MS;
    } else {
      // If no valid timestamps exist at all, make it claimable once
      nextClaimAt = now;
    }
  }

  const claimExpiresAt = typeof order.claimExpiresAt === 'number' && !isNaN(order.claimExpiresAt)
    ? order.claimExpiresAt
    : nextClaimAt + DAY_MS;

  const remainingMs = Math.max(0, nextClaimAt - now);
  const isClaimable = remainingMs === 0;

  const totalSeconds = Math.floor(remainingMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const formattedCountdown = `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  let hasClaimedToday = false;
  if (order.lastClaimedAt) {
    const lastMs = new Date(order.lastClaimedAt).getTime();
    if (!isNaN(lastMs) && now - lastMs < DAY_MS) {
      hasClaimedToday = true;
    }
  }

  return {
    isClaimable,
    isFinished: false,
    isExpired: false,
    nextClaimAt,
    claimExpiresAt,
    remainingMs,
    hours,
    minutes,
    seconds,
    formattedCountdown,
    hasClaimedToday,
  };
}

