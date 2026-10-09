/**
 * Pure business logic for loan installment calculation.
 * Formula from PRD Section 9:
 * Installment (flat interest) = P * (1 + annual_rate * tenor_months / 12) / tenor_months
 * Example: 5,000,000 at 6% for 24 months = 233,333.33 -> 233,333
 */
export function calculateInstallment(
  principal: number,
  annualRate: number,
  tenorMonths: number
): number {
  if (tenorMonths <= 0) return 0;
  const totalRepayment = principal * (1 + (annualRate * tenorMonths) / 12);
  return Math.round(totalRepayment / tenorMonths);
}

/**
 * Healthy installment cap = 30% of average monthly profit (PRD Section 9, 15)
 */
export function calculateHealthyInstallmentCap(avgMonthlyProfit: number): number {
  if (avgMonthlyProfit <= 0) return 0;
  return Math.round(0.30 * avgMonthlyProfit);
}
