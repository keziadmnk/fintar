// Data models based on PRD Section 10

export type Currency = 'IDR' | 'USD' | 'CNY';

export type PermissionTier = 'T0' | 'T1' | 'T2' | 'T3';

export type AlertLevel = 'critical' | 'warning' | 'positive';

export interface Business {
  id: string;
  ownerId: string;
  name: string;
  category: string;
  scale: 'micro' | 'small' | 'medium';
  displayCurrency: Currency;
  avgMonthlyProfit?: number;
  currentCashBalance?: number;
}

export interface Consent {
  id: string;
  userId: string;
  type: 'ai_processing' | 'anonymous_insights';
  granted: boolean;
  timestamp: string;
}

export interface Transaction {
  id: string;
  businessId: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string; // ISO date
  source: 'manual' | 'ocr' | 'csv';
  receiptId?: string;
}

export interface ReceiptItem {
  name: string;
  qty: number;
  price: number;
  confidence?: number;
}

export interface Receipt {
  id: string;
  businessId: string;
  imageRef?: string;
  merchantName: string;
  date: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  total: number;
  computedTotal: number;
  confidence: number;
  status: 'pending' | 'confirmed' | 'rejected';
}

export interface Debt {
  id: string;
  businessId: string;
  supplier: string;
  amount: number;
  dueDate: string;
  status: 'unpaid' | 'paid' | 'overdue';
}

export interface ScheduledExpense {
  id: string;
  businessId: string;
  label: string;
  amount: number;
  date: string;
}

export interface Alert {
  id: string;
  businessId: string;
  level: AlertLevel;
  title: string;
  detail: string;
  suggestedAction: string;
  actionRoute?: string;
  createdAt: string;
  resolved: boolean;
  metrics?: {
    daysUntilDeficit?: number;
    amount?: number;
    percentageChange?: number;
  };
}

export interface FinancingProduct {
  id: string;
  name: string;
  provider: string;
  type: 'micro_loan' | 'cooperative' | 'digital_loan' | 'supplier_financing';
  annualRate: number; // e.g. 0.06 for 6%
  collateral: string;
  maxAmount: number;
  tenors: number[]; // e.g. [6, 12, 24]
  speedDays: number;
  score?: number;
  matchReasons?: string[];
  riskWarning?: boolean;
  isSimulated: boolean;
}

export interface InsuranceProduct {
  id: string;
  name: string;
  provider: string;
  covers: string[];
  monthlyPremium: number;
  score?: number;
  premiumBurdenPct?: number;
  matchReasons?: string[];
  isSimulated: boolean;
}

export interface AgentAction {
  id: string;
  userId: string;
  tool: string;
  input: Record<string, any>;
  output: Record<string, any>;
  tier: PermissionTier;
  status: 'pending_approval' | 'approved' | 'rejected' | 'completed' | 'blocked';
  approvalId?: string;
  timestamp: string;
}

export interface Proposal {
  id: string;
  businessId: string;
  productId: string;
  productName: string;
  amount: number;
  tenor: number;
  monthlyInstallment: number;
  pdfRef?: string;
  status: 'draft' | 'submitted_sandbox' | 'approved';
  createdAt: string;
}
