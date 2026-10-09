/**
 * Pure, rule-based auto-categorization function for SME transactions (PRD FR-06).
 * Analyzes transaction description keywords and returns the most relevant category.
 */

export interface CategoryRule {
  category: string;
  type: 'income' | 'expense';
  keywords: string[];
}

export const CATEGORY_RULES: CategoryRule[] = [
  // Expense Categories
  {
    category: 'Raw Materials',
    type: 'expense',
    keywords: [
      'flour', 'tepung', 'terigu', 'butter', 'mentega', 'egg', 'telur', 'sugar', 'gula',
      'yeast', 'ragi', 'milk', 'susu', 'cocoa', 'cokelat', 'chocolate', 'vanilla',
      'cheese', 'keju', 'baking', 'cream', 'garam', 'salt', 'oil', 'minyak', 'gandum'
    ],
  },
  {
    category: 'Packaging',
    type: 'expense',
    keywords: [
      'box', 'kotak', 'dus', 'kemasan', 'packaging', 'plastic', 'plastik', 'sticker',
      'stiker', 'bag', 'tas', 'paper', 'kertas', 'cup', 'liner', 'label', 'seal', 'pita'
    ],
  },
  {
    category: 'Logistics',
    type: 'expense',
    keywords: [
      'ongkir', 'delivery', 'kurir', 'courier', 'shipping', 'ekspedisi', 'jne', 'j&t',
      'sicepat', 'grab', 'gojek', 'gosend', 'grabexpress', 'antar', 'freight', 'bensin', 'fuel'
    ],
  },
  {
    category: 'Utilities',
    type: 'expense',
    keywords: [
      'gas', 'lpg', 'listrik', 'electricity', 'pln', 'air', 'pdam', 'water', 'internet',
      'wifi', 'indihome', 'telkom', 'token'
    ],
  },
  {
    category: 'Maintenance',
    type: 'expense',
    keywords: [
      'service', 'servis', 'perbaikan', 'repair', 'sparepart', 'seal', 'mixer',
      'oven repair', 'alat', 'maintenance', 'pisau', 'loyang'
    ],
  },
  {
    category: 'Marketing',
    type: 'expense',
    keywords: [
      'ads', 'iklan', 'promo', 'boost', 'endorse', 'instagram', 'facebook', 'tiktok',
      'flyer', 'brosur', 'banner'
    ],
  },
  {
    category: 'Labor',
    type: 'expense',
    keywords: [
      'gaji', 'salary', 'wage', 'upah', 'bonus', 'thr', 'lembur', 'staff', 'karyawan'
    ],
  },

  // Income Categories
  {
    category: 'Bakery Sales',
    type: 'income',
    keywords: [
      'bread', 'roti', 'cake', 'kue', 'pastry', 'croissant', 'sourdough', 'chiffon',
      'penjualan', 'sales', 'retail', 'kasir', 'counter', 'toko', 'morning batch', 'donat'
    ],
  },
  {
    category: 'Catering',
    type: 'income',
    keywords: [
      'catering', 'snack box', 'kotak snack', 'prasmanan', 'nasi kotak', 'kantor',
      'office', 'birthday', 'ulang tahun', 'wedding', 'arisan', 'acara', 'event'
    ],
  },
  {
    category: 'Online Orders',
    type: 'income',
    keywords: [
      'gofood', 'grabfood', 'shopeefood', 'tokopedia', 'shopee', 'marketplace', 'online',
      'order delivery', 'app order', 'preorder', 'po'
    ],
  },
  {
    category: 'Wholesale',
    type: 'income',
    keywords: [
      'wholesale', 'grosir', 'reseller', 'titip', 'konsinyasi', 'distributor', 'agen'
    ],
  },
];

/**
 * Predicts category and transaction type based on description text.
 * Pure function with no side effects.
 */
export function predictCategory(
  description: string,
  preferredType?: 'income' | 'expense'
): { category: string; type: 'income' | 'expense'; confidence: number } {
  if (!description || description.trim() === '') {
    return {
      category: preferredType === 'income' ? 'Bakery Sales' : 'Miscellaneous',
      type: preferredType || 'expense',
      confidence: 0,
    };
  }

  const text = description.toLowerCase();

  let bestMatch: { category: string; type: 'income' | 'expense'; score: number } | null = null;

  for (const rule of CATEGORY_RULES) {
    if (preferredType && rule.type !== preferredType) {
      continue;
    }

    let matchCount = 0;
    for (const kw of rule.keywords) {
      if (text.includes(kw)) {
        matchCount++;
      }
    }

    if (matchCount > 0) {
      const score = matchCount / rule.keywords.length + matchCount * 10;
      if (!bestMatch || score > bestMatch.score) {
        bestMatch = {
          category: rule.category,
          type: rule.type,
          score,
        };
      }
    }
  }

  if (bestMatch) {
    return {
      category: bestMatch.category,
      type: bestMatch.type,
      confidence: Math.min(0.95, 0.6 + bestMatch.score * 0.1),
    };
  }

  return {
    category: preferredType === 'income' ? 'Other Income' : 'Miscellaneous',
    type: preferredType || 'expense',
    confidence: 0.3,
  };
}
