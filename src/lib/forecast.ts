import { Debt, ScheduledExpense, Transaction } from '../types';

export interface ForecastDay {
  day: number;
  date: string;
  projectedBalance: number;
  scheduledOutflow: number;
  isDeficit: boolean;
}

export interface ForecastResult {
  currentBalance: number;
  avgDailyIncome: number;
  avgDailyExpense: number;
  netDailyBurn: number;
  daysUntilDeficit: number | null; // null if no deficit within projection window
  timeline: ForecastDay[];
  totalScheduledDebt: number;
  totalScheduledExpenses: number;
  hasCriticalShortage: boolean;
}

/**
 * 30-day cash forecast including scheduled expenses and supplier debts (PRD Section 9 & 10)
 * - Net daily burn = average daily expense - average daily income (last 30 days)
 * - Projected balance on day t = current balance + income_daily*t - expense_daily*t - scheduled expenses and debts due up to day t
 * - Days until deficit = first day with projected balance < 0. If none, no Critical alert.
 */
export function calculateCashForecast(
  currentBalance: number,
  transactions: Transaction[],
  debts: Debt[],
  scheduledExpenses: ScheduledExpense[],
  projectionDays: number = 30
): ForecastResult {
  // Compute daily income & expense over the last 30 days of transactions (or total available history)
  const now = new Date();
  const past30Days = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const recentTx = transactions.filter((t) => new Date(t.date) >= past30Days);
  const totalIncome = recentTx
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpense = recentTx
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const daysCount = Math.max(1, Math.min(30, Math.ceil((now.getTime() - past30Days.getTime()) / (1000 * 60 * 60 * 24))));
  const avgDailyIncome = Math.round(totalIncome / daysCount);
  const avgDailyExpense = Math.round(totalExpense / daysCount);
  const netDailyBurn = avgDailyExpense - avgDailyIncome;

  const timeline: ForecastDay[] = [];
  let daysUntilDeficit: number | null = null;

  const totalScheduledDebt = debts
    .filter((d) => d.status === 'unpaid')
    .reduce((sum, d) => sum + d.amount, 0);

  const totalScheduledExpenses = scheduledExpenses.reduce((sum, e) => sum + e.amount, 0);

  for (let t = 1; t <= projectionDays; t++) {
    const targetDate = new Date(now.getTime() + t * 24 * 60 * 60 * 1000);
    const targetDateStr = targetDate.toISOString().split('T')[0];

    // Debts due up to day t
    const debtsDue = debts
      .filter((d) => d.status === 'unpaid' && new Date(d.dueDate) <= targetDate)
      .reduce((sum, d) => sum + d.amount, 0);

    // Scheduled expenses up to day t
    const expensesDue = scheduledExpenses
      .filter((e) => new Date(e.date) <= targetDate)
      .reduce((sum, e) => sum + e.amount, 0);

    // Single day outflow specifically on day t for timeline breakdown
    const dayDebts = debts
      .filter((d) => d.status === 'unpaid' && d.dueDate.startsWith(targetDateStr))
      .reduce((sum, d) => sum + d.amount, 0);
    const dayExpenses = scheduledExpenses
      .filter((e) => e.date.startsWith(targetDateStr))
      .reduce((sum, e) => sum + e.amount, 0);

    const projectedBalance = Math.round(
      currentBalance + (avgDailyIncome * t) - (avgDailyExpense * t) - debtsDue - expensesDue
    );

    const isDeficit = projectedBalance < 0;

    if (isDeficit && daysUntilDeficit === null) {
      daysUntilDeficit = t;
    }

    timeline.push({
      day: t,
      date: targetDateStr,
      projectedBalance,
      scheduledOutflow: dayDebts + dayExpenses,
      isDeficit,
    });
  }

  // Critical shortage condition: deficit within 14 days (PRD Section 7 FR-11)
  const hasCriticalShortage = daysUntilDeficit !== null && daysUntilDeficit <= 14;

  return {
    currentBalance,
    avgDailyIncome,
    avgDailyExpense,
    netDailyBurn,
    daysUntilDeficit,
    timeline,
    totalScheduledDebt,
    totalScheduledExpenses,
    hasCriticalShortage,
  };
}
