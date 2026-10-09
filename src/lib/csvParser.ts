import { Transaction } from '../types';
import { predictCategory } from './categorization';

export interface CsvValidationResult {
  validRows: Omit<Transaction, 'id' | 'businessId'>[];
  invalidRows: {
    rowNumber: number;
    rawData: string;
    reason: string;
  }[];
  totalProcessed: number;
}

/**
 * Validates and parses transaction date string.
 * Supports YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, YYYY/MM/DD
 */
export function normalizeDate(dateStr: string): string | null {
  if (!dateStr) return null;
  const clean = dateStr.trim();

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    const d = new Date(clean);
    if (!isNaN(d.getTime())) return clean;
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    const iso = `${year}-${month}-${day}`;
    const d = new Date(iso);
    if (!isNaN(d.getTime())) return iso;
  }

  return null;
}

/**
 * Parses and validates CSV text into transactions (PRD FR-05).
 * Tolerates headers in English and Indonesian.
 * Separates valid transactions from invalid error rows.
 */
export function parseTransactionsCsv(
  csvContent: string,
  businessId: string = 'biz_default'
): CsvValidationResult {
  const lines = csvContent
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  const validRows: Omit<Transaction, 'id' | 'businessId'>[] = [];
  const invalidRows: { rowNumber: number; rawData: string; reason: string }[] = [];

  if (lines.length === 0) {
    return { validRows, invalidRows, totalProcessed: 0 };
  }

  // Check header line
  let startIndex = 0;
  const firstLine = lines[0].toLowerCase();
  const hasHeader =
    firstLine.includes('date') ||
    firstLine.includes('tanggal') ||
    firstLine.includes('amount') ||
    firstLine.includes('nominal') ||
    firstLine.includes('type') ||
    firstLine.includes('tipe') ||
    firstLine.includes('description') ||
    firstLine.includes('keterangan');

  if (hasHeader) {
    startIndex = 1;
  }

  for (let i = startIndex; i < lines.length; i++) {
    const rowNumber = i + 1;
    const rawLine = lines[i];

    // Split by comma or semicolon
    const separator = rawLine.includes(';') ? ';' : ',';
    const cols = rawLine.split(separator).map((c) => c.trim().replace(/^["']|["']$/g, ''));

    if (cols.length < 3) {
      invalidRows.push({
        rowNumber,
        rawData: rawLine,
        reason: 'Jumlah kolom tidak lengkap (minimal tanggal, tipe/kategori, nominal, keterangan).',
      });
      continue;
    }

    // Attempt to extract: Date, Type, Amount, Category, Description
    // Standard format 1: Date, Type, Amount, Category, Description
    // Standard format 2: Date, Description, Amount, Type
    let dateRaw = cols[0];
    let typeRaw = '';
    let amountRaw = '';
    let categoryRaw = '';
    let descRaw = '';

    if (cols.length >= 5) {
      dateRaw = cols[0];
      typeRaw = cols[1];
      amountRaw = cols[2];
      categoryRaw = cols[3];
      descRaw = cols[4];
    } else if (cols.length === 4) {
      dateRaw = cols[0];
      typeRaw = cols[1];
      amountRaw = cols[2];
      descRaw = cols[3];
    } else {
      dateRaw = cols[0];
      descRaw = cols[1];
      amountRaw = cols[2];
    }

    // 1. Validate Date
    const normalizedDate = normalizeDate(dateRaw);
    if (!normalizedDate) {
      invalidRows.push({
        rowNumber,
        rawData: rawLine,
        reason: `Format tanggal tidak valid: "${dateRaw}". Gunakan format YYYY-MM-DD atau DD/MM/YYYY.`,
      });
      continue;
    }

    // 2. Validate Amount
    const cleanAmountStr = amountRaw.replace(/[^0-9.-]/g, '');
    const amount = parseFloat(cleanAmountStr);
    if (isNaN(amount) || amount <= 0) {
      invalidRows.push({
        rowNumber,
        rawData: rawLine,
        reason: `Nominal tidak valid atau nol: "${amountRaw}".`,
      });
      continue;
    }

    // 3. Normalize Type (income / expense)
    let type: 'income' | 'expense' = 'expense';
    const lowerType = typeRaw.toLowerCase();
    if (
      lowerType === 'income' ||
      lowerType === 'pemasukan' ||
      lowerType === 'masuk' ||
      lowerType === 'cr' ||
      lowerType === 'credit'
    ) {
      type = 'income';
    } else if (
      lowerType === 'expense' ||
      lowerType === 'pengeluaran' ||
      lowerType === 'keluar' ||
      lowerType === 'dr' ||
      lowerType === 'debit'
    ) {
      type = 'expense';
    } else {
      // If type not specified, infer from category or description
      const predicted = predictCategory(descRaw || categoryRaw);
      type = predicted.type;
    }

    // 4. Category & Description
    const description = descRaw || categoryRaw || 'Transaksi Pembukuan';
    const category = categoryRaw || predictCategory(description, type).category;

    validRows.push({
      type,
      amount,
      category,
      description,
      date: normalizedDate,
      source: 'csv',
    });
  }

  return {
    validRows,
    invalidRows,
    totalProcessed: lines.length - (hasHeader ? 1 : 0),
  };
}
