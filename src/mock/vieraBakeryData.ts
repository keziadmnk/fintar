import {
  Business,
  Transaction,
  Debt,
  ScheduledExpense,
  Alert,
  FinancingProduct,
  InsuranceProduct,
  AgentAction,
} from '../types';

export const mockBusiness: Business = {
  id: 'biz_viera_001',
  ownerId: 'user_viera_owner',
  name: 'Viera Bakery',
  category: 'Food & Beverage / Bakery',
  scale: 'micro',
  displayCurrency: 'IDR',
  avgMonthlyProfit: 1_100_000,
  currentCashBalance: 1_100_000,
};

// 24 transactions summing to: Income 2,907,000, Expense 1,807,000, Profit 1,100,000
export const mockTransactions: Transaction[] = [
  // Income (Total: 2,907,000)
  { id: 'tx_01', businessId: 'biz_viera_001', type: 'income', amount: 350000, category: 'Bakery Sales', description: 'Morning pastry batch & custom cake', date: '2026-10-01', source: 'manual' },
  { id: 'tx_02', businessId: 'biz_viera_001', type: 'income', amount: 185000, category: 'Bakery Sales', description: 'Retail breads & croissants', date: '2026-10-02', source: 'manual' },
  { id: 'tx_03', businessId: 'biz_viera_001', type: 'income', amount: 420000, category: 'Catering', description: 'Local office tea break snack boxes', date: '2026-10-03', source: 'manual' },
  { id: 'tx_04', businessId: 'biz_viera_001', type: 'income', amount: 210000, category: 'Bakery Sales', description: 'Artisan sourdough & milk breads', date: '2026-10-03', source: 'ocr' },
  { id: 'tx_05', businessId: 'biz_viera_001', type: 'income', amount: 195000, category: 'Bakery Sales', description: 'Afternoon coffee and pastry combos', date: '2026-10-04', source: 'manual' },
  { id: 'tx_06', businessId: 'biz_viera_001', type: 'income', amount: 310000, category: 'Bakery Sales', description: 'Weekend special chiffon & rolls', date: '2026-10-05', source: 'manual' },
  { id: 'tx_07', businessId: 'biz_viera_001', type: 'income', amount: 280000, category: 'Online Orders', description: 'Delivery app bakery orders', date: '2026-10-05', source: 'ocr' },
  { id: 'tx_08', businessId: 'biz_viera_001', type: 'income', amount: 450000, category: 'Catering', description: 'Birthday dessert table order', date: '2026-10-06', source: 'manual' },
  { id: 'tx_09', businessId: 'biz_viera_001', type: 'income', amount: 247000, category: 'Bakery Sales', description: 'Daily retail counter sales', date: '2026-10-07', source: 'manual' },
  { id: 'tx_10', businessId: 'biz_viera_001', type: 'income', amount: 260000, category: 'Online Orders', description: 'Marketplace pastry pre-orders', date: '2026-10-08', source: 'csv' },

  // Expenses (Total: 1,807,000)
  { id: 'tx_11', businessId: 'biz_viera_001', type: 'expense', amount: 450000, category: 'Raw Materials', description: 'High-protein wheat flour 25kg & butter', date: '2026-10-01', source: 'ocr' },
  { id: 'tx_12', businessId: 'biz_viera_001', type: 'expense', amount: 120000, category: 'Packaging', description: 'Eco bakery boxes & parchment liners', date: '2026-10-01', source: 'ocr' },
  { id: 'tx_13', businessId: 'biz_viera_001', type: 'expense', amount: 85000, category: 'Utilities', description: 'LPG gas cylinder refill for oven', date: '2026-10-02', source: 'manual' },
  { id: 'tx_14', businessId: 'biz_viera_001', type: 'expense', amount: 210000, category: 'Raw Materials', description: 'Dairy cream, milk, and farm eggs', date: '2026-10-02', source: 'ocr' },
  { id: 'tx_15', businessId: 'biz_viera_001', type: 'expense', amount: 160000, category: 'Logistics', description: 'Courier & courier delivery fees (+18% spike)', date: '2026-10-03', source: 'ocr' },
  { id: 'tx_16', businessId: 'biz_viera_001', type: 'expense', amount: 95000, category: 'Raw Materials', description: 'Belgian cocoa powder & chocolate chips', date: '2026-10-04', source: 'manual' },
  { id: 'tx_17', businessId: 'biz_viera_001', type: 'expense', amount: 75000, category: 'Packaging', description: 'Custom printed stickers & carry bags', date: '2026-10-04', source: 'manual' },
  { id: 'tx_18', businessId: 'biz_viera_001', type: 'expense', amount: 180000, category: 'Logistics', description: 'Expedited ingredient shipping', date: '2026-10-05', source: 'manual' },
  { id: 'tx_19', businessId: 'biz_viera_001', type: 'expense', amount: 130000, category: 'Logistics', description: 'Delivery logistics for catering order', date: '2026-10-06', source: 'manual' },
  { id: 'tx_20', businessId: 'biz_viera_001', type: 'expense', amount: 110000, category: 'Raw Materials', description: 'Yeast, vanilla beans, and baking powder', date: '2026-10-06', source: 'ocr' },
  { id: 'tx_21', businessId: 'biz_viera_001', type: 'expense', amount: 52000, category: 'Utilities', description: 'Water utility weekly top-up', date: '2026-10-07', source: 'manual' },
  { id: 'tx_22', businessId: 'biz_viera_001', type: 'expense', amount: 40000, category: 'Maintenance', description: 'Mixer silicone seal replacement', date: '2026-10-07', source: 'manual' },
  { id: 'tx_23', businessId: 'biz_viera_001', type: 'expense', amount: 50000, category: 'Marketing', description: 'Social media promo post boost', date: '2026-10-08', source: 'manual' },
  { id: 'tx_24', businessId: 'biz_viera_001', type: 'expense', amount: 50000, category: 'Miscellaneous', description: 'Kitchen cleaning & hygiene supplies', date: '2026-10-08', source: 'manual' },
];

export const mockDebts: Debt[] = [
  {
    id: 'debt_01',
    businessId: 'biz_viera_001',
    supplier: 'PT Pangan Flour Supply',
    amount: 750_000,
    dueDate: '2026-10-13', // in 5 days
    status: 'unpaid',
  },
];

export const mockScheduledExpenses: ScheduledExpense[] = [
  {
    id: 'sched_01',
    businessId: 'biz_viera_001',
    label: 'Ramadan Pre-Season Restock (Flour, Butter, Sugar)',
    amount: 1_400_000,
    date: '2026-10-17', // in 9 days
  },
];

export const mockAlerts: Alert[] = [
  {
    id: 'alt_01',
    businessId: 'biz_viera_001',
    level: 'critical',
    title: 'Cash Deficit Alert in 9 Days',
    detail: 'Ramadan Restock (IDR 1,400,000) on Oct 17 exceeds your projected cash balance (IDR 1,100,000). Estimated shortage: ~IDR 630,000.',
    suggestedAction: 'Review fast disbursement funding or adjust supplier terms',
    actionRoute: '/funding',
    createdAt: '2026-10-08T09:00:00Z',
    resolved: false,
    metrics: {
      daysUntilDeficit: 9,
      amount: 1400000,
    },
  },
  {
    id: 'alt_02',
    businessId: 'biz_viera_001',
    level: 'warning',
    title: 'Supplier Debt Due in 5 Days',
    detail: 'PT Pangan Flour Supply invoice of IDR 750,000 is due on Oct 13, 2026.',
    suggestedAction: 'Schedule payment or request 14-day extension',
    actionRoute: '/reports',
    createdAt: '2026-10-08T08:30:00Z',
    resolved: false,
    metrics: {
      amount: 750000,
    },
  },
  {
    id: 'alt_03',
    businessId: 'biz_viera_001',
    level: 'warning',
    title: 'Shipping Cost Anomaly (+18%)',
    detail: 'Logistics expense rose to 26% of total operating expenses (IDR 470,000 this month).',
    suggestedAction: 'Consider bulk delivery consolidation or local route optimization',
    actionRoute: '/reports',
    createdAt: '2026-10-07T14:15:00Z',
    resolved: false,
    metrics: {
      percentageChange: 18,
    },
  },
  {
    id: 'alt_04',
    businessId: 'biz_viera_001',
    level: 'positive',
    title: 'Bakery Sales Up +10% This Week',
    detail: 'Morning pastry batch sales grew 10% week-over-week, boosting healthy cash margin to 37.8%.',
    suggestedAction: 'Increase morning batch volume to capture peak demand',
    actionRoute: '/reports',
    createdAt: '2026-10-06T10:00:00Z',
    resolved: false,
    metrics: {
      percentageChange: 10,
    },
  },
];

export const mockFinancingProducts: FinancingProduct[] = [
  {
    id: 'prod_micro_01',
    name: 'SME Micro Loan (KUR)',
    provider: 'Bank Rakyat Mandiri (Simulated)',
    type: 'micro_loan',
    annualRate: 0.06, // 6% flat/yr
    collateral: 'No collateral up to IDR 10,000,000',
    maxAmount: 10_000_000,
    tenors: [6, 12, 24],
    speedDays: 3,
    isSimulated: true,
  },
  {
    id: 'prod_coop_02',
    name: 'Cooperative Working Capital',
    provider: 'Koperasi Usaha Sejahtera (Simulated)',
    type: 'cooperative',
    annualRate: 0.12, // 12% flat/yr
    collateral: 'Business license & simple bank statement',
    maxAmount: 15_000_000,
    tenors: [6, 12],
    speedDays: 2,
    isSimulated: true,
  },
  {
    id: 'prod_digital_03',
    name: 'Instant Digital SME Line',
    provider: 'Fintech Cepat SME (Simulated)',
    type: 'digital_loan',
    annualRate: 0.24, // 24% flat/yr
    collateral: 'QRIS / POS Transaction history',
    maxAmount: 20_000_000,
    tenors: [3, 6, 12],
    speedDays: 1,
    isSimulated: true,
  },
  {
    id: 'prod_supplier_04',
    name: 'Supplier Restock Financing',
    provider: 'SupplyLink Partner (Simulated)',
    type: 'supplier_financing',
    annualRate: 0.08, // 8% flat/yr
    collateral: 'Direct supplier invoice settlement',
    maxAmount: 8_000_000,
    tenors: [2, 3, 6],
    speedDays: 1,
    isSimulated: true,
  },
];

export const mockInsuranceProducts: InsuranceProduct[] = [
  {
    id: 'ins_basic_01',
    name: 'Basic SME Protection',
    provider: 'Amanah Shield (Simulated)',
    covers: ['Fire & Oven Explosion', 'Basic Equipment Breakdown'],
    monthlyPremium: 15_000,
    isSimulated: true,
  },
  {
    id: 'ins_plus_02',
    name: 'Bakery Plus Shield',
    provider: 'Amanah Shield (Simulated)',
    covers: ['Fire & Explosion', 'Raw Material Spoilage', 'Electrical Surge / Oven', 'Cash in Transit'],
    monthlyPremium: 20_000,
    isSimulated: true,
  },
  {
    id: 'ins_complete_03',
    name: 'Comprehensive Business Shield',
    provider: 'Guardia Commercial (Simulated)',
    covers: ['Fire & Natural Disaster', 'Complete Ingredient Spoilage', 'Third-party Liability', 'Temporary Business Interruption'],
    monthlyPremium: 30_000,
    isSimulated: true,
  },
];

export const mockAuditActions: AgentAction[] = [
  {
    id: 'act_001',
    userId: 'user_viera_owner',
    tool: 'get_summary',
    input: { businessId: 'biz_viera_001', period: 'this_month' },
    output: { income: 2907000, expense: 1807000, profit: 1100000, margin: 0.378 },
    tier: 'T0',
    status: 'completed',
    timestamp: '2026-10-08T07:10:00Z',
  },
  {
    id: 'act_002',
    userId: 'user_viera_owner',
    tool: 'forecast_cash',
    input: { currentBalance: 1100000, projectionDays: 30 },
    output: { daysUntilDeficit: 9, criticalRestock: 1400000, projectedDeficit: 630000 },
    tier: 'T0',
    status: 'completed',
    timestamp: '2026-10-08T07:11:00Z',
  },
  {
    id: 'act_003',
    userId: 'user_viera_owner',
    tool: 'create_alert',
    input: { level: 'critical', trigger: 'deficit_day_9' },
    output: { alertId: 'alt_01', notified: true },
    tier: 'T1',
    status: 'completed',
    timestamp: '2026-10-08T07:11:05Z',
  },
  {
    id: 'act_004',
    userId: 'user_viera_owner',
    tool: 'parse_receipt',
    input: { imageRef: 'receipt_flour_butter_oct01.jpg' },
    output: { merchant: 'PT Toko Bahan Kue', total: 450000, confidence: 0.94 },
    tier: 'T0',
    status: 'completed',
    timestamp: '2026-10-08T08:00:00Z',
  },
  {
    id: 'act_005',
    userId: 'user_viera_owner',
    tool: 'save_transaction',
    input: { type: 'expense', amount: 450000, category: 'Raw Materials' },
    output: { transactionId: 'tx_11', saved: true },
    tier: 'T2',
    status: 'approved',
    approvalId: 'appr_9921',
    timestamp: '2026-10-08T08:01:20Z',
  },
];
