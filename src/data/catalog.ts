import { Product, Transaction } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-micro-5k',
    title: 'Dangote Express Micro Share Tranche (₦5,000)',
    category: 'Public IPO',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
    ],
    price: 5000,
    totalIncome: 36000,
    dailyIncome: 600,
    cycleDays: 60,
    quota: 5,
    countdown: { hours: 23, minutes: 59, seconds: 59 },
    hot: true,
  },
  {
    id: 'prod-starter-gift',
    title: 'Dangote Starter Share Grant - Free Welcome ISO Allocation',
    category: 'Public IPO',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
    ],
    price: 0,
    totalIncome: 200,
    dailyIncome: 200,
    cycleDays: 1,
    quota: 1,
    countdown: { hours: 23, minutes: 59, seconds: 50 },
    hot: true,
  },
  {
    id: 'prod-retail-5usd',
    title: 'Dangote Retail Class-A Shares (Lekki Single-Train)',
    category: 'Public IPO',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    ],
    price: 7500, // $5.00 USDT @ 1500 rate
    totalIncome: 54000, // $36.00
    dailyIncome: 900, // $0.60/day
    cycleDays: 60,
    quota: 2,
    countdown: { hours: 2, minutes: 15, seconds: 24 },
    hot: true,
  },
  {
    id: 'prod-cdu-10usd',
    title: 'Lekki CDU Crude Distillation Equity Unit',
    category: 'Public IPO',
    imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    ],
    price: 15000, // $10.00 USDT
    totalIncome: 67500, // $45.00
    dailyIncome: 1500, // $1.00/day
    cycleDays: 45,
    quota: 3,
    countdown: { hours: 5, minutes: 45, seconds: 0 },
    hot: true,
  },
  {
    id: 'prod-pms-15usd',
    title: 'Premium Motor Spirit (PMS Petrol) Yield Tranche',
    category: 'Public IPO',
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
    ],
    price: 22500, // $15.00 USDT
    totalIncome: 135000, // $90.00
    dailyIncome: 2250, // $1.50/day
    cycleDays: 60,
    quota: 2,
    countdown: { hours: 3, minutes: 4, seconds: 24 },
    hot: true,
  },
  {
    id: 'prod-diesel-25usd',
    title: 'Automotive Gas Oil (AGO Diesel) Refining Pool',
    category: 'Petrochemical',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    ],
    price: 37500, // $25.00 USDT
    totalIncome: 168750, // $112.50
    dailyIncome: 3375, // $2.25/day
    cycleDays: 50,
    quota: 3,
    countdown: { hours: 7, minutes: 20, seconds: 0 },
    hot: true,
  },
  {
    id: 'prod-polyprop-35usd',
    title: 'Polypropylene & Petrochemicals Industrial Share Pool',
    category: 'Petrochemical',
    imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    ],
    price: 52500, // $35.00 USDT
    totalIncome: 210000, // $140.00
    dailyIncome: 4200, // $2.80/day
    cycleDays: 50,
    quota: 3,
    countdown: { hours: 6, minutes: 20, seconds: 12 },
    hot: true,
  },
  {
    id: 'prod-aviation-50usd',
    title: 'Aviation Jet A1 Turbine Fuel Guaranteed Tranche',
    category: 'Petrochemical',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    ],
    price: 75000, // $50.00 USDT
    totalIncome: 337500, // $225.00
    dailyIncome: 6750, // $4.50/day
    cycleDays: 50,
    quota: 2,
    countdown: { hours: 11, minutes: 10, seconds: 0 },
    hot: true,
  },
  {
    id: 'prod-fractionation-66usd',
    title: 'Lekki Main Fractionation Column Allotment',
    category: 'Petrochemical',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
    ],
    price: 99000, // $66.00 USDT
    totalIncome: 321750, // $214.50
    dailyIncome: 6435, // $4.29/day
    cycleDays: 50,
    quota: 3,
    countdown: { hours: 9, minutes: 43, seconds: 58 },
    hot: true,
  },
  {
    id: 'prod-single-train-85usd',
    title: '650,000 BPD Single-Train Mega Block',
    category: 'VIP Institutional',
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    ],
    price: 127500, // $85.00 USDT
    totalIncome: 446250, // $297.50
    dailyIncome: 8925, // $5.95/day
    cycleDays: 50,
    quota: 3,
    countdown: { hours: 10, minutes: 24, seconds: 15 },
    hot: true,
  },
  {
    id: 'prod-crude-120usd',
    title: 'Subsea Marine Pipeline & Export Terminal Shares',
    category: 'VIP Institutional',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    ],
    price: 180000, // $120.00 USDT
    totalIncome: 630000, // $420.00
    dailyIncome: 12600, // $8.40/day
    cycleDays: 50,
    quota: 2,
    countdown: { hours: 12, minutes: 10, seconds: 0 },
    hot: true,
  },
  {
    id: 'prod-ngx-128usd',
    title: 'NGX Sovereign Listing Guaranteed Shares (10-Day Accelerated)',
    category: 'Public IPO',
    imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    ],
    price: 192000, // $128.00 USDT
    totalIncome: 360000, // $240.00
    dailyIncome: 36000, // $24.00/day
    cycleDays: 10,
    quota: 3,
    countdown: { hours: 22, minutes: 32, seconds: 8 },
    hot: true,
  },
  {
    id: 'prod-fertilizer-180usd',
    title: 'Dangote Fertilizer & Polypropylene Integration Bond',
    category: 'Petrochemical',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    price: 270000, // $180.00 USDT
    totalIncome: 945000, // $630.00
    dailyIncome: 18900, // $12.60/day
    cycleDays: 50,
    quota: 2,
    countdown: { hours: 14, minutes: 50, seconds: 0 },
    hot: true,
  },
  {
    id: 'prod-vip-250usd',
    title: 'Dangote Institutional Syndicate Tranche (Tier 1)',
    category: 'VIP Institutional',
    imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    ],
    price: 375000, // $250.00 USDT
    totalIncome: 1125000, // $750.00
    dailyIncome: 28125, // $18.75/day
    cycleDays: 40,
    quota: 2,
    countdown: { hours: 15, minutes: 45, seconds: 30 },
    hot: true,
  },
  {
    id: 'prod-founder-350usd',
    title: 'Aliko Dangote Founder Syndicate Equity Pool',
    category: 'VIP Institutional',
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    price: 525000, // $350.00 USDT
    totalIncome: 1575000, // $1,050.00
    dailyIncome: 39375, // $26.25/day
    cycleDays: 40,
    quota: 2,
    countdown: { hours: 16, minutes: 30, seconds: 20 },
    hot: true,
  },
  {
    id: 'prod-mega-500usd',
    title: 'Lekki Free Trade Zone Sovereign Energy Portfolio',
    category: 'VIP Institutional',
    imageUrl: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
    ],
    price: 750000, // $500.00 USDT
    totalIncome: 2400000, // $1,600.00
    dailyIncome: 60000, // $40.00/day
    cycleDays: 40,
    quota: 1,
    countdown: { hours: 18, minutes: 0, seconds: 0 },
    hot: true,
  },
  {
    id: 'prod-lse-750usd',
    title: 'Dual NGX-LSE Global Institutional Allocation',
    category: 'VIP Institutional',
    imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    price: 1125000, // $750.00 USDT
    totalIncome: 3600000, // $2,400.00
    dailyIncome: 90000, // $60.00/day
    cycleDays: 40,
    quota: 1,
    countdown: { hours: 21, minutes: 10, seconds: 5 },
    hot: true,
  },
  {
    id: 'prod-chairman-1000usd',
    title: 'Executive Chairman Grand Consortium Shares',
    category: 'VIP Institutional',
    imageUrl: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    galleryImages: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&w=800&q=80',
    ],
    price: 1500000, // $1,000.00 USDT
    totalIncome: 4050000, // $2,700.00
    dailyIncome: 135000, // $90.00/day
    cycleDays: 30,
    quota: 1,
    countdown: { hours: 20, minutes: 15, seconds: 0 },
    hot: true,
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const ANNOUNCEMENTS = [
  '⚡ Official: Dangote Petroleum Refinery & Petrochemicals PLC ISO (Initial Share Offering) live on NGX: DANGREFINERY.',
  '⛽ Milestone: 650,000 BPD single-train production achieved at Lekki Free Trade Zone.',
  '📜 Operating Guidelines: Dividend withdrawals operate Monday to Friday, 10:00 AM - 5:00 PM with 11% fee across borders.',
  '🇳🇬 Welcome to Dangote Refinery PLC Official Shareholder & IPO Investment Portal.',
];
