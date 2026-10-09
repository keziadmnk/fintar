import { supabase, isSupabaseConfigured } from './supabaseClient';
import { mockBusiness, mockTransactions, mockDebts, mockScheduledExpenses, mockAlerts, mockFinancingProducts, mockInsuranceProducts } from '../mock/vieraBakeryData';

/**
 * Server function simulation / Supabase RPC caller for seeding demo data.
 * Idempotently creates or resets the demo dataset (Viera Bakery & transactions) for the given user.
 */
export async function seedDemoDataForUser(userId: string = 'user_viera_owner') {
  try {
    if (isSupabaseConfigured) {
      // 1. Try calling the stored RPC function if available in database
      const { data, error } = await (supabase.rpc as any)('seed_demo_data', {
        p_user_id: userId,
      });

      if (!error && data) {
        return data;
      }

      if (error) {
        console.warn('Supabase RPC seed_demo_data error, falling back to direct table inserts:', error.message);
      }

      // 2. Direct Supabase Table Seeding Fallback (if RPC is not yet created in dashboard)
      // Check or create business
      let bizId = '';
      const { data: existingBiz } = await supabase
        .from('businesses')
        .select('id')
        .eq('owner_id', userId)
        .eq('name', 'Viera Bakery')
        .maybeSingle();

      if (existingBiz?.id) {
        bizId = existingBiz.id;
        // Clean existing demo transactions for idempotency
        await supabase.from('transactions').delete().eq('business_id', bizId);
      } else {
        const { data: newBiz, error: bizErr } = await supabase
          .from('businesses')
          .insert({
            owner_id: userId,
            name: 'Viera Bakery',
            category: 'Food & Beverage / Bakery',
            scale: 'micro',
            display_currency: 'IDR',
            avg_monthly_profit: 1100000,
            current_cash_balance: 1100000,
          } as any)
          .select('id')
          .single();

        if (bizErr) throw bizErr;
        bizId = newBiz.id;
      }

      // Insert mock transactions into Supabase table
      const rowsToInsert = mockTransactions.map((tx) => ({
        business_id: bizId,
        type: tx.type,
        amount: tx.amount,
        category: tx.category,
        description: tx.description,
        date: tx.date,
        source: tx.source,
      }));

      const { error: insertErr } = await supabase.from('transactions').insert(rowsToInsert as any);
      if (insertErr) throw insertErr;

      return {
        success: true,
        businessId: bizId,
        transactionsCount: rowsToInsert.length,
      };
    }
  } catch (err: any) {
    console.warn('Supabase seeding fallback to local demo data:', err?.message || err);
  }

  // Fallback in-memory return
  return {
    success: true,
    business: mockBusiness,
    transactionsCount: mockTransactions.length,
    debtsCount: mockDebts.length,
    scheduledExpensesCount: mockScheduledExpenses.length,
    alertsCount: mockAlerts.length,
    financingProductsCount: mockFinancingProducts.length,
    insuranceProductsCount: mockInsuranceProducts.length,
  };
}
