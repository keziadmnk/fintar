import { FinancingProduct, InsuranceProduct } from '../types';
import { calculateInstallment, calculateHealthyInstallmentCap } from './installment';

export interface FinancingScoreResult {
  product: FinancingProduct;
  score: number;
  repaymentCapacityScore: number;
  purposeTenorFitScore: number;
  collateralScore: number;
  costScore: number;
  speedScore: number;
  monthlyInstallment: number;
  healthyCap: number;
  riskWarning: boolean;
  reasons: string[];
}

/**
 * Financing match scoring (PRD Section 9)
 * - Total Score (100):
 *   Repayment capacity (40), Purpose & tenor fit (20), Collateral/documents (20), Cost (10), Speed (10)
 * - Guardrail: If monthly installment > healthy cap (30% avg monthly profit), score is capped below 30 and riskWarning = true.
 */
export function scoreFinancingProduct(
  product: FinancingProduct,
  requestedAmount: number,
  requestedTenor: number,
  avgMonthlyProfit: number
): FinancingScoreResult {
  const healthyCap = calculateHealthyInstallmentCap(avgMonthlyProfit);
  const monthlyInstallment = calculateInstallment(requestedAmount, product.annualRate, requestedTenor);
  const riskWarning = monthlyInstallment > healthyCap;

  const reasons: string[] = [];

  // 1. Repayment capacity (40 pts)
  let repaymentCapacityScore = 0;
  if (monthlyInstallment <= healthyCap * 0.7) {
    repaymentCapacityScore = 40;
    reasons.push(`Low repayment burden (${Math.round((monthlyInstallment / (avgMonthlyProfit || 1)) * 100)}% of monthly profit)`);
  } else if (monthlyInstallment <= healthyCap) {
    repaymentCapacityScore = 30;
    reasons.push('Comfortable installment within healthy 30% profit buffer');
  } else {
    repaymentCapacityScore = 5;
    reasons.push(`High risk: Installment exceeds recommended 30% profit cap (Cap: ${healthyCap.toLocaleString('id-ID')})`);
  }

  // 2. Purpose and tenor fit (20 pts)
  let purposeTenorFitScore = product.tenors.includes(requestedTenor) ? 20 : 10;
  if (product.tenors.includes(requestedTenor)) {
    reasons.push(`Exact tenor match (${requestedTenor} months available)`);
  } else {
    reasons.push(`Tenor requires adjustment`);
  }

  // 3. Collateral/documents (20 pts)
  let collateralScore = 0;
  if (product.collateral.toLowerCase().includes('no collateral') || requestedAmount <= 10_000_000) {
    collateralScore = 20;
    reasons.push('No physical collateral required for requested amount');
  } else {
    collateralScore = 12;
    reasons.push(`Requires simple verification (${product.collateral})`);
  }

  // 4. Cost score (10 pts)
  let costScore = 10;
  if (product.annualRate <= 0.08) {
    costScore = 10;
    reasons.push(`Subsidized competitive interest rate (${(product.annualRate * 100).toFixed(1)}% flat/yr)`);
  } else if (product.annualRate <= 0.15) {
    costScore = 7;
    reasons.push(`Moderate rate (${(product.annualRate * 100).toFixed(1)}% flat/yr)`);
  } else {
    costScore = 4;
    reasons.push(`Higher commercial interest rate (${(product.annualRate * 100).toFixed(1)}% flat/yr)`);
  }

  // 5. Speed score (10 pts)
  let speedScore = product.speedDays <= 1 ? 10 : product.speedDays <= 3 ? 8 : 5;
  reasons.push(`Disbursement in ~${product.speedDays} day${product.speedDays > 1 ? 's' : ''}`);

  let totalScore = repaymentCapacityScore + purposeTenorFitScore + collateralScore + costScore + speedScore;

  // Enforce PRD Section 9 Rule: If installment > cap: score capped below 30 and risk_warning = true.
  if (riskWarning) {
    totalScore = Math.min(28, Math.round(totalScore * 0.28));
  }

  return {
    product,
    score: Math.min(100, Math.max(0, totalScore)),
    repaymentCapacityScore,
    purposeTenorFitScore,
    collateralScore,
    costScore,
    speedScore,
    monthlyInstallment,
    healthyCap,
    riskWarning,
    reasons,
  };
}

export interface InsuranceScoreResult {
  product: InsuranceProduct;
  score: number;
  coverageMatchScore: number;
  premiumVsProfitScore: number;
  assetCoverageScore: number;
  premiumBurdenPct: number;
  reasons: string[];
}

/**
 * Insurance match scoring (PRD Section 9)
 * - Total Score (100):
 *   Risk coverage match (50), Premium vs profit (30), Coverage vs asset value (20)
 * - Premium burden % = monthly premium / avg monthly profit
 */
export function scoreInsuranceProduct(
  product: InsuranceProduct,
  selectedRisks: string[],
  estimatedAssetValue: number,
  avgMonthlyProfit: number
): InsuranceScoreResult {
  const reasons: string[] = [];
  const premiumBurdenPct = avgMonthlyProfit > 0 ? (product.monthlyPremium / avgMonthlyProfit) : 0;

  // 1. Risk coverage match (50 pts)
  const matchedRisks = selectedRisks.filter((risk) =>
    product.covers.some((c) => c.toLowerCase().includes(risk.toLowerCase()))
  );
  const coverageRatio = selectedRisks.length > 0 ? matchedRisks.length / selectedRisks.length : 1;
  const coverageMatchScore = Math.round(coverageRatio * 50);
  reasons.push(`Covers ${matchedRisks.length} of ${selectedRisks.length} selected risk scenarios`);

  // 2. Premium vs profit (30 pts)
  let premiumVsProfitScore = 0;
  if (premiumBurdenPct <= 0.02) {
    premiumVsProfitScore = 30;
    reasons.push(`Affordable premium (< 2% of profit: ${(premiumBurdenPct * 100).toFixed(2)}%)`);
  } else if (premiumBurdenPct <= 0.05) {
    premiumVsProfitScore = 20;
    reasons.push(`Moderate premium (${(premiumBurdenPct * 100).toFixed(1)}% of monthly profit)`);
  } else {
    premiumVsProfitScore = 10;
    reasons.push(`Higher premium impact (${(premiumBurdenPct * 100).toFixed(1)}% of profit)`);
  }

  // 3. Asset coverage fit (20 pts)
  const assetCoverageScore = estimatedAssetValue > 0 ? 20 : 15;
  reasons.push(`Protects equipment and bakery inventory`);

  const score = coverageMatchScore + premiumVsProfitScore + assetCoverageScore;

  return {
    product,
    score: Math.min(100, Math.max(0, score)),
    coverageMatchScore,
    premiumVsProfitScore,
    assetCoverageScore,
    premiumBurdenPct,
    reasons,
  };
}
