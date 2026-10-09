/**
 * Unit tests for categorization.ts and csvParser.ts
 * Run with: npm test
 */
import { describe, it, expect } from 'vitest';
import { predictCategory } from './categorization';
import { parseTransactionsCsv, normalizeDate } from './csvParser';

describe('predictCategory (auto-categorization)', () => {
  it('maps tepung/flour to Raw Materials expense', () => {
    const res = predictCategory('Beli tepung terigu segitiga biru 25kg');
    expect(res.category).toBe('Raw Materials');
    expect(res.type).toBe('expense');
  });

  it('maps dus/kemasan to Packaging expense', () => {
    const res = predictCategory('Dus kemasan & stiker box roti');
    expect(res.category).toBe('Packaging');
    expect(res.type).toBe('expense');
  });

  it('maps ongkir/grabexpress to Logistics expense', () => {
    const res = predictCategory('Ongkos kirim grabexpress bahan baku');
    expect(res.category).toBe('Logistics');
    expect(res.type).toBe('expense');
  });

  it('maps croissant/sourdough to Bakery Sales income', () => {
    const res = predictCategory('Penjualan retail croissant dan sourdough');
    expect(res.category).toBe('Bakery Sales');
    expect(res.type).toBe('income');
  });

  it('maps snack box/catering to Catering income', () => {
    const res = predictCategory('Pesanan snack box catering kantor');
    expect(res.category).toBe('Catering');
    expect(res.type).toBe('income');
  });
});

describe('normalizeDate (CSV date parsing)', () => {
  it('ISO date normalizes correctly', () => {
    expect(normalizeDate('2026-10-09')).toBe('2026-10-09');
  });

  it('DD/MM/YYYY normalizes correctly', () => {
    expect(normalizeDate('09/10/2026')).toBe('2026-10-09');
  });

  it('invalid date returns null', () => {
    expect(normalizeDate('2026-99-99')).toBeNull();
  });
});

describe('parseTransactionsCsv (CSV import with 2 bad rows)', () => {
  const sampleCsv = `date,type,amount,category,description
2026-10-09,income,320000,Bakery Sales,Pesanan roti manis pagi 40 pcs
2026-10-09,expense,150000,Raw Materials,Pembelian margarin & ragi instan
2026-99-99,expense,85000,Utilities,Refill gas LPG (INVALID DATE)
2026-10-10,income,480000,Catering,Snack box rapat kantor
2026-10-10,expense,NOT_A_NUMBER,Packaging,Dus kemasan (INVALID AMOUNT)
2026-10-11,income,210000,Online Orders,Pesanan pastry delivery`;

  const result = parseTransactionsCsv(sampleCsv, 'biz_test');

  it('imports exactly 4 valid rows', () => {
    expect(result.validRows.length).toBe(4);
  });

  it('catches exactly 2 bad rows', () => {
    expect(result.invalidRows.length).toBe(2);
  });

  it('first bad row is at line 4 (invalid date)', () => {
    expect(result.invalidRows[0].rowNumber).toBe(4);
  });

  it('second bad row is at line 6 (invalid amount)', () => {
    expect(result.invalidRows[1].rowNumber).toBe(6);
  });
});



