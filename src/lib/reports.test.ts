/**
 * Unit tests for reports.ts (PRD Test Case 13 — FR-08, FR-09)
 * Verifies: Report totals MUST equal dashboard totals for the same period.
 * Run with: npm test
 */
import { describe, it, expect } from 'vitest';
import { mockTransactions } from '../mock/vieraBakeryData';
import {
  generateFullReport,
  calculatePnl,
  calculateCashFlow,
  filterTransactionsByPeriod,
} from './reports';

// ── Shared benchmark (simulates Home dashboard logic for October 2026) ──────
const refDate = new Date('2026-10-08T12:00:00');
const thisMonthTx = mockTransactions.filter((t) => t.date.startsWith('2026-10'));
const dashboardRevenue = thisMonthTx
  .filter((t) => t.type === 'income')
  .reduce((s, t) => s + t.amount, 0);
const dashboardExpenses = thisMonthTx
  .filter((t) => t.type === 'expense')
  .reduce((s, t) => s + t.amount, 0);
const dashboardProfit = dashboardRevenue - dashboardExpenses;

describe('filterTransactionsByPeriod', () => {
  it('returns all transactions for "all" period', () => {
    const filtered = filterTransactionsByPeriod(mockTransactions, 'all', refDate);
    expect(filtered.length).toBe(mockTransactions.length);
  });

  it('returns only current-month transactions for "month"', () => {
    const filtered = filterTransactionsByPeriod(mockTransactions, 'month', refDate);
    filtered.forEach((tx) => {
      expect(tx.date.startsWith('2026-10')).toBe(true);
    });
    expect(filtered.length).toBe(thisMonthTx.length);
  });

  it('returns transactions within last 7 days for "7d"', () => {
    const filtered = filterTransactionsByPeriod(mockTransactions, '7d', refDate);
    const cutoff = new Date(refDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    filtered.forEach((tx) => {
      const d = new Date(tx.date);
      expect(d >= cutoff).toBe(true);
    });
  });
});

describe('calculatePnl', () => {
  it('revenue equals sum of all income transactions', () => {
    const pnl = calculatePnl(thisMonthTx);
    expect(pnl.revenue).toBe(dashboardRevenue);
  });

  it('COGS + OpEx equals total expenses', () => {
    const pnl = calculatePnl(thisMonthTx);
    expect(pnl.cogs + pnl.operatingExpenses).toBe(dashboardExpenses);
  });

  it('netProfit equals dashboard profit', () => {
    const pnl = calculatePnl(thisMonthTx);
    expect(pnl.netProfit).toBe(dashboardProfit);
  });

  it('grossProfit = revenue - COGS', () => {
    const pnl = calculatePnl(thisMonthTx);
    expect(pnl.grossProfit).toBe(pnl.revenue - pnl.cogs);
  });

  it('netProfit = grossProfit - operatingExpenses', () => {
    const pnl = calculatePnl(thisMonthTx);
    expect(pnl.netProfit).toBe(pnl.grossProfit - pnl.operatingExpenses);
  });
});

describe('calculateCashFlow', () => {
  it('cashIn equals total income', () => {
    const cf = calculateCashFlow(thisMonthTx);
    expect(cf.cashIn).toBe(dashboardRevenue);
  });

  it('cashOut equals total expenses', () => {
    const cf = calculateCashFlow(thisMonthTx);
    expect(cf.cashOut).toBe(dashboardExpenses);
  });

  it('netCashFlow = cashIn - cashOut', () => {
    const cf = calculateCashFlow(thisMonthTx);
    expect(cf.netCashFlow).toBe(cf.cashIn - cf.cashOut);
  });

  it('sub-category inflows sum to total cashIn', () => {
    const cf = calculateCashFlow(thisMonthTx);
    expect(cf.operatingInflow + cf.investingInflow + cf.financingInflow).toBe(cf.cashIn);
  });

  it('sub-category outflows sum to total cashOut', () => {
    const cf = calculateCashFlow(thisMonthTx);
    expect(cf.operatingOutflow + cf.investingOutflow + cf.financingOutflow).toBe(cf.cashOut);
  });
});

// ── PRD Test Case 13: Report totals MUST equal dashboard totals ───────────
describe('Test Case 13 — generateFullReport matches dashboard (FR-08)', () => {
  const report = generateFullReport(mockTransactions, 'month', refDate);

  it('[TC-13.1] Report revenue equals dashboard revenue', () => {
    expect(report.pnl.revenue).toBe(dashboardRevenue);
  });

  it('[TC-13.2] Report total expenses (COGS + OpEx) equals dashboard expenses', () => {
    expect(report.pnl.cogs + report.pnl.operatingExpenses).toBe(dashboardExpenses);
  });

  it('[TC-13.3] Report net profit equals dashboard profit', () => {
    expect(report.pnl.netProfit).toBe(dashboardProfit);
  });

  it('[TC-13.4] P&L internal integrity: grossProfit = revenue - COGS', () => {
    expect(report.pnl.grossProfit).toBe(report.pnl.revenue - report.pnl.cogs);
  });

  it('[TC-13.5] Cash flow netCashFlow equals P&L net profit', () => {
    expect(report.cashFlow.netCashFlow).toBe(report.pnl.netProfit);
  });

  it('[TC-13.6] Transaction count is correct (24 seed rows)', () => {
    expect(report.transactionCount).toBe(24);
  });

  it('[TC-13.7] Revenue is exactly Rp 2,907,000 (seed verification)', () => {
    expect(report.pnl.revenue).toBe(2_907_000);
  });

  it('[TC-13.8] Expenses are exactly Rp 1,807,000 (seed verification)', () => {
    expect(report.pnl.cogs + report.pnl.operatingExpenses).toBe(1_807_000);
  });

  it('[TC-13.9] Net profit is exactly Rp 1,100,000 (seed verification)', () => {
    expect(report.pnl.netProfit).toBe(1_100_000);
  });
});
