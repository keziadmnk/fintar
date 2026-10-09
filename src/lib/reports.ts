import { Transaction, Currency } from '../types';
import { formatCurrency, formatDate } from './formatters';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export type ReportPeriod = '7d' | 'month' | '3m' | 'year' | 'all';

export interface PnLStatement {
  revenue: number;
  cogs: number;
  grossProfit: number;
  operatingExpenses: number;
  netProfit: number;
  grossMarginPct: number;
  netMarginPct: number;
  revenueBreakdown: Record<string, number>;
  cogsBreakdown: Record<string, number>;
  opexBreakdown: Record<string, number>;
}

export interface CashFlowStatement {
  cashIn: number;
  cashOut: number;
  netCashFlow: number;
  operatingInflow: number;
  operatingOutflow: number;
  operatingNet: number;
  investingInflow: number;
  investingOutflow: number;
  investingNet: number;
  financingInflow: number;
  financingOutflow: number;
  financingNet: number;
}

export interface FullFinancialReport {
  period: ReportPeriod;
  periodLabel: string;
  startDate: string;
  endDate: string;
  transactionCount: number;
  pnl: PnLStatement;
  cashFlow: CashFlowStatement;
}

/**
 * Filters transactions based on selected period
 */
export function filterTransactionsByPeriod(
  transactions: Transaction[],
  period: ReportPeriod,
  referenceDate: Date = new Date('2026-10-08T12:00:00')
): Transaction[] {
  if (period === 'all') return transactions;

  const now = referenceDate;

  return transactions.filter((tx) => {
    const txDate = new Date(tx.date);

    if (period === '7d') {
      const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return txDate >= d7 && txDate <= now;
    }

    if (period === 'month') {
      // Matches current month (e.g. October 2026)
      return (
        txDate.getMonth() === now.getMonth() &&
        txDate.getFullYear() === now.getFullYear()
      );
    }

    if (period === '3m') {
      const d90 = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      return txDate >= d90 && txDate <= now;
    }

    if (period === 'year') {
      return txDate.getFullYear() === now.getFullYear();
    }

    return true;
  });
}

/**
 * Pure calculation for Profit and Loss Statement (PRD FR-08)
 */
export function calculatePnl(transactions: Transaction[]): PnLStatement {
  const revenueBreakdown: Record<string, number> = {};
  const cogsBreakdown: Record<string, number> = {};
  const opexBreakdown: Record<string, number> = {};

  let revenue = 0;
  let cogs = 0;
  let operatingExpenses = 0;

  for (const tx of transactions) {
    if (tx.type === 'income') {
      revenue += tx.amount;
      revenueBreakdown[tx.category] = (revenueBreakdown[tx.category] || 0) + tx.amount;
    } else if (tx.type === 'expense') {
      const catLower = tx.category.toLowerCase();
      // COGS: Raw materials and packaging
      if (
        catLower.includes('raw') ||
        catLower.includes('bahan') ||
        catLower.includes('packaging') ||
        catLower.includes('kemasan')
      ) {
        cogs += tx.amount;
        cogsBreakdown[tx.category] = (cogsBreakdown[tx.category] || 0) + tx.amount;
      } else {
        // OpEx: Logistics, Utilities, Maintenance, Marketing, Labor, Misc
        operatingExpenses += tx.amount;
        opexBreakdown[tx.category] = (opexBreakdown[tx.category] || 0) + tx.amount;
      }
    }
  }

  const grossProfit = revenue - cogs;
  const netProfit = grossProfit - operatingExpenses;
  const grossMarginPct = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  const netMarginPct = revenue > 0 ? (netProfit / revenue) * 100 : 0;

  return {
    revenue,
    cogs,
    grossProfit,
    operatingExpenses,
    netProfit,
    grossMarginPct,
    netMarginPct,
    revenueBreakdown,
    cogsBreakdown,
    opexBreakdown,
  };
}

/**
 * Pure calculation for Cash Flow Statement (PRD FR-08)
 */
export function calculateCashFlow(transactions: Transaction[]): CashFlowStatement {
  let cashIn = 0;
  let cashOut = 0;

  let operatingInflow = 0;
  let operatingOutflow = 0;
  let investingInflow = 0;
  let investingOutflow = 0;
  let financingInflow = 0;
  let financingOutflow = 0;

  for (const tx of transactions) {
    const catLower = tx.category.toLowerCase();
    const descLower = tx.description.toLowerCase();

    const isInvesting =
      catLower.includes('invest') ||
      catLower.includes('equipment') ||
      catLower.includes('mesin') ||
      descLower.includes('beli oven') ||
      descLower.includes('beli mixer');

    const isFinancing =
      catLower.includes('loan') ||
      catLower.includes('pinjaman') ||
      catLower.includes('modal') ||
      catLower.includes('debt');

    if (tx.type === 'income') {
      cashIn += tx.amount;
      if (isFinancing) financingInflow += tx.amount;
      else if (isInvesting) investingInflow += tx.amount;
      else operatingInflow += tx.amount;
    } else {
      cashOut += tx.amount;
      if (isFinancing) financingOutflow += tx.amount;
      else if (isInvesting) investingOutflow += tx.amount;
      else operatingOutflow += tx.amount;
    }
  }

  const operatingNet = operatingInflow - operatingOutflow;
  const investingNet = investingInflow - investingOutflow;
  const financingNet = financingInflow - financingOutflow;
  const netCashFlow = cashIn - cashOut;

  return {
    cashIn,
    cashOut,
    netCashFlow,
    operatingInflow,
    operatingOutflow,
    operatingNet,
    investingInflow,
    investingOutflow,
    investingNet,
    financingInflow,
    financingOutflow,
    financingNet,
  };
}

/**
 * Generates full financial report package
 */
export function generateFullReport(
  transactions: Transaction[],
  period: ReportPeriod,
  referenceDate?: Date
): FullFinancialReport {
  const periodLabels: Record<ReportPeriod, string> = {
    '7d': 'Last 7 Days',
    'month': 'This Month (October 2026)',
    '3m': 'Last 3 Months',
    'year': 'This Year (2026)',
    'all': 'All Recorded History',
  };

  const filtered = filterTransactionsByPeriod(transactions, period, referenceDate);
  const pnl = calculatePnl(filtered);
  const cashFlow = calculateCashFlow(filtered);

  return {
    period,
    periodLabel: periodLabels[period],
    startDate: filtered.length > 0 ? filtered[filtered.length - 1].date : '2026-10-01',
    endDate: filtered.length > 0 ? filtered[0].date : '2026-10-08',
    transactionCount: filtered.length,
    pnl,
    cashFlow,
  };
}

/**
 * Export report to formatted PDF (PRD FR-09)
 */
export function exportReportToPdf(
  report: FullFinancialReport,
  businessName: string,
  currency: Currency = 'IDR'
) {
  const doc = new jsPDF();
  const generationDate = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // Header Banner
  doc.setFillColor(0, 102, 255);
  doc.rect(0, 0, 210, 26, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('FinTar Financial Statement', 14, 12);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`${businessName} • ${report.periodLabel}`, 14, 19);

  // Metadata Box
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.text(`Generated on: ${generationDate} | Currency: ${currency}`, 14, 33);
  doc.text(`Transactions Analyzed: ${report.transactionCount} entries`, 14, 38);

  // Section 1: Profit and Loss
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Profit & Loss Statement (P&L)', 14, 48);

  const pnlTableData = [
    ['Gross Revenue (Income)', formatCurrency(report.pnl.revenue, currency), '100.0%'],
    ['Cost of Goods Sold (COGS)', `-${formatCurrency(report.pnl.cogs, currency)}`, `${((report.pnl.cogs / (report.pnl.revenue || 1)) * 100).toFixed(1)}%`],
    ['GROSS PROFIT', formatCurrency(report.pnl.grossProfit, currency), `${report.pnl.grossMarginPct.toFixed(1)}%`],
    ['Operating Expenses (OpEx)', `-${formatCurrency(report.pnl.operatingExpenses, currency)}`, `${((report.pnl.operatingExpenses / (report.pnl.revenue || 1)) * 100).toFixed(1)}%`],
    ['NET PROFIT', formatCurrency(report.pnl.netProfit, currency), `${report.pnl.netMarginPct.toFixed(1)}%`],
  ];

  autoTable(doc, {
    startY: 52,
    head: [['Item', 'Amount', '% of Revenue']],
    body: pnlTableData,
    theme: 'striped',
    headStyles: { fillColor: [0, 102, 255], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  // Section 2: Cash Flow Statement
  const lastY = (doc as any).lastAutoTable.finalY + 12;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Cash Flow Statement', 14, lastY);

  const cashFlowTableData = [
    ['Operating Cash Inflow', `+${formatCurrency(report.cashFlow.operatingInflow, currency)}`],
    ['Operating Cash Outflow', `-${formatCurrency(report.cashFlow.operatingOutflow, currency)}`],
    ['Net Operating Cash Flow', formatCurrency(report.cashFlow.operatingNet, currency)],
    ['Investing Cash Flow (Equipment/Assets)', formatCurrency(report.cashFlow.investingNet, currency)],
    ['Financing Cash Flow (Loans/Capital)', formatCurrency(report.cashFlow.financingNet, currency)],
    ['NET CASH SURPLUS / (BURN)', formatCurrency(report.cashFlow.netCashFlow, currency)],
  ];

  autoTable(doc, {
    startY: lastY + 4,
    head: [['Cash Flow Category', 'Net Amount']],
    body: cashFlowTableData,
    theme: 'striped',
    headStyles: { fillColor: [14, 23, 38], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 },
  });

  // Footer Disclaimer
  const finalY = (doc as any).lastAutoTable.finalY + 12;
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text(
    'FinTar Autonomous SME Copilot • All financial calculations are mathematically tied to primary transactions.',
    14,
    finalY
  );

  doc.save(`FinTar_Report_${businessName.replace(/\s+/g, '_')}_${report.period}.pdf`);
}

/**
 * Export report to formatted Excel Workbook (.xlsx) (PRD FR-09)
 */
export function exportReportToExcel(
  report: FullFinancialReport,
  businessName: string,
  currency: Currency = 'IDR'
) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: Executive Summary & P&L
  const pnlSheetData = [
    ['FinTar Financial Statement'],
    ['Business Name:', businessName],
    ['Report Period:', report.periodLabel],
    ['Generated Date:', new Date().toISOString()],
    ['Currency:', currency],
    [''],
    ['PROFIT & LOSS STATEMENT'],
    ['Line Item', 'Amount', '% of Revenue'],
    ['Gross Revenue', report.pnl.revenue, '100.0%'],
    ['Cost of Goods Sold (COGS)', -report.pnl.cogs, `${((report.pnl.cogs / (report.pnl.revenue || 1)) * 100).toFixed(1)}%`],
    ['Gross Profit', report.pnl.grossProfit, `${report.pnl.grossMarginPct.toFixed(1)}%`],
    ['Operating Expenses (OpEx)', -report.pnl.operatingExpenses, `${((report.pnl.operatingExpenses / (report.pnl.revenue || 1)) * 100).toFixed(1)}%`],
    ['Net Profit', report.pnl.netProfit, `${report.pnl.netMarginPct.toFixed(1)}%`],
    [''],
    ['CASH FLOW STATEMENT'],
    ['Category', 'Amount'],
    ['Operating Cash Inflow', report.cashFlow.operatingInflow],
    ['Operating Cash Outflow', -report.cashFlow.operatingOutflow],
    ['Net Operating Cash Flow', report.cashFlow.operatingNet],
    ['Investing Cash Flow', report.cashFlow.investingNet],
    ['Financing Cash Flow', report.cashFlow.financingNet],
    ['Net Cash Flow', report.cashFlow.netCashFlow],
  ];

  const ws = XLSX.utils.aoa_to_sheet(pnlSheetData);
  XLSX.utils.book_append_sheet(wb, ws, 'Financial Statement');

  XLSX.writeFile(wb, `FinTar_Report_${businessName.replace(/\s+/g, '_')}_${report.period}.xlsx`);
}
