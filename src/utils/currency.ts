/**
 * Universal Currency & Dual-Denomination (USD / USDT & NGN Naira) formatting utility
 */

export const DEFAULT_USD_RATE = 1500; // 1 USD / USDT = ₦1,500 NGN

/**
 * Converts a Naira amount to USD / USDT equivalent
 */
export function nairaToUsd(naira: number, rate: number = DEFAULT_USD_RATE): number {
  if (!naira || isNaN(naira) || naira <= 0) return 0;
  return Number((naira / (rate || DEFAULT_USD_RATE)).toFixed(2));
}

/**
 * Converts a USD / USDT amount to Naira equivalent
 */
export function usdToNaira(usd: number, rate: number = DEFAULT_USD_RATE): number {
  if (!usd || isNaN(usd) || usd <= 0) return 0;
  return Math.round(usd * (rate || DEFAULT_USD_RATE));
}

/**
 * Formats a USD amount nicely (e.g. $5.00, $1,250.00)
 */
export function formatUSD(usd: number, minDecimals = 2): string {
  if (usd === undefined || usd === null || isNaN(usd)) return '$0.00';
  return `$${usd.toLocaleString('en-US', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Formats a Naira amount nicely (e.g. ₦7,500, ₦1,500,000)
 */
export function formatNaira(naira: number, showDecimals = false): string {
  if (naira === undefined || naira === null || isNaN(naira)) return '₦0';
  return `₦${naira.toLocaleString('en-US', {
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Returns formatted dual currency string: "$5.00 (₦7,500)" or "$0.00 (₦0)"
 */
export function formatDualPrice(naira: number, rate: number = DEFAULT_USD_RATE): string {
  if (naira === 0) return '$0.00 (₦0)';
  const usd = nairaToUsd(naira, rate);
  return `${formatUSD(usd)} (${formatNaira(naira)})`;
}

/**
 * Returns formatted dual currency string with Naira first: "₦7,500 ($5.00)"
 */
export function formatDualPriceNairaFirst(naira: number, rate: number = DEFAULT_USD_RATE): string {
  if (naira === 0) return '₦0 ($0.00)';
  const usd = nairaToUsd(naira, rate);
  return `${formatNaira(naira)} (${formatUSD(usd)})`;
}

export const NIGERIAN_BANKS = [
  'Access Bank',
  'Guaranty Trust Bank (GTBank)',
  'Zenith Bank',
  'First Bank of Nigeria',
  'United Bank for Africa (UBA)',
  'OPay (PayCom)',
  'PalmPay',
  'Kuda Microfinance Bank',
  'Moniepoint Microfinance Bank',
  'Fidelity Bank',
  'Stanbic IBTC Bank',
  'First City Monument Bank (FCMB)',
  'Sterling Bank',
  'Union Bank of Nigeria',
  'Wema Bank (ALAT)',
  'Polaris Bank',
  'Ecobank Nigeria',
  'Keystone Bank',
  'Jaiz Bank',
  'Providus Bank',
  'Taj Bank',
  'Titan Trust Bank',
  'Standard Chartered Bank',
  'Other Commercial Bank',
];


/**
 * Returns structured dual display objects for UI rendering
 */
export function getDualCurrencyDisplay(naira: number, rate: number = DEFAULT_USD_RATE) {
  const usd = nairaToUsd(naira, rate);
  return {
    usdFormatted: formatUSD(usd),
    nairaFormatted: formatNaira(naira),
    rawUsd: usd,
    rawNaira: naira,
    compact: `${formatUSD(usd)} / ${formatNaira(naira)}`,
    badge: `${formatUSD(usd)} (≈ ${formatNaira(naira)})`,
  };
}
