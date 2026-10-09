-- =============================================================================
-- FinTar Seed Data & Demo Seeding Stored Procedure (PRD Section 13)
-- Idempotent script
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. SEED FX RATES
-- -----------------------------------------------------------------------------
INSERT INTO public.fx_rates (currency, rate_to_idr, as_of)
VALUES 
    ('IDR', 1.0000, NOW()),
    ('USD', 16000.0000, NOW()),
    ('CNY', 2200.0000, NOW())
ON CONFLICT (currency) DO UPDATE 
SET rate_to_idr = EXCLUDED.rate_to_idr,
    as_of = EXCLUDED.as_of;

-- -----------------------------------------------------------------------------
-- 2. SEED SIMULATED FINANCING PRODUCTS
-- -----------------------------------------------------------------------------
INSERT INTO public.financing_products (id, name, provider, type, annual_rate, collateral, max_amount, tenors, speed_days, is_simulated)
VALUES
    ('a0000000-0000-0000-0000-000000000001', 'SME Micro Loan (KUR)', 'Bank Rakyat Mandiri (Simulated)', 'micro_loan', 0.0600, 'No collateral up to IDR 10,000,000', 10000000, '[6, 12, 24]'::jsonb, 3, TRUE),
    ('a0000000-0000-0000-0000-000000000002', 'Cooperative Working Capital', 'Koperasi Usaha Sejahtera (Simulated)', 'cooperative', 0.1200, 'Business license & simple bank statement', 15000000, '[6, 12]'::jsonb, 2, TRUE),
    ('a0000000-0000-0000-0000-000000000003', 'Instant Digital SME Line', 'Fintech Cepat SME (Simulated)', 'digital_loan', 0.2400, 'QRIS / POS Transaction history', 20000000, '[3, 6, 12]'::jsonb, 1, TRUE),
    ('a0000000-0000-0000-0000-000000000004', 'Supplier Restock Financing', 'SupplyLink Partner (Simulated)', 'supplier_financing', 0.0800, 'Direct supplier invoice settlement', 8000000, '[2, 3, 6]'::jsonb, 1, TRUE)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    annual_rate = EXCLUDED.annual_rate,
    collateral = EXCLUDED.collateral,
    max_amount = EXCLUDED.max_amount,
    tenors = EXCLUDED.tenors,
    speed_days = EXCLUDED.speed_days;

-- -----------------------------------------------------------------------------
-- 3. SEED SIMULATED INSURANCE PRODUCTS
-- -----------------------------------------------------------------------------
INSERT INTO public.insurance_products (id, name, provider, covers, monthly_premium, is_simulated)
VALUES
    ('b0000000-0000-0000-0000-000000000001', 'Basic SME Protection', 'Amanah Shield (Simulated)', '["Fire & Oven Explosion", "Basic Equipment Breakdown"]'::jsonb, 15000, TRUE),
    ('b0000000-0000-0000-0000-000000000002', 'Bakery Plus Shield', 'Amanah Shield (Simulated)', '["Fire & Explosion", "Raw Material Spoilage", "Electrical Surge / Oven", "Cash in Transit"]'::jsonb, 20000, TRUE),
    ('b0000000-0000-0000-0000-000000000003', 'Comprehensive Business Shield', 'Guardia Commercial (Simulated)', '["Fire & Natural Disaster", "Complete Ingredient Spoilage", "Third-party Liability", "Temporary Business Interruption"]'::jsonb, 30000, TRUE)
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    covers = EXCLUDED.covers,
    monthly_premium = EXCLUDED.monthly_premium;

-- -----------------------------------------------------------------------------
-- 4. RPC SERVER FUNCTION: seed_demo_data(target_user_id)
-- Creates Viera Bakery & 24 Transactions for the authenticated user
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.seed_demo_data(p_user_id UUID DEFAULT auth.uid())
RETURNS JSONB AS $$
DECLARE
    v_business_id UUID;
    v_user_id UUID;
BEGIN
    v_user_id := COALESCE(p_user_id, auth.uid());
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Target user ID must be provided or user must be authenticated';
    END IF;

    -- 1. Create or fetch demo business
    SELECT id INTO v_business_id FROM public.businesses WHERE owner_id = v_user_id AND name = 'Viera Bakery' LIMIT 1;
    
    IF v_business_id IS NULL THEN
        INSERT INTO public.businesses (owner_id, name, category, scale, display_currency, avg_monthly_profit, current_cash_balance)
        VALUES (v_user_id, 'Viera Bakery', 'Food & Beverage / Bakery', 'micro', 'IDR', 1100000.00, 1100000.00)
        RETURNING id INTO v_business_id;
    ELSE
        -- Reset existing data for idempotency
        DELETE FROM public.transactions WHERE business_id = v_business_id;
        DELETE FROM public.debts WHERE business_id = v_business_id;
        DELETE FROM public.scheduled_expenses WHERE business_id = v_business_id;
        DELETE FROM public.alerts WHERE business_id = v_business_id;
    END IF;

    -- 2. Add Consent
    INSERT INTO public.consents (user_id, type, granted, timestamp)
    VALUES 
        (v_user_id, 'ai_processing', TRUE, NOW()),
        (v_user_id, 'anonymous_insights', TRUE, NOW());

    -- 3. Insert 24 Transactions (Income: 2,907,000 | Expense: 1,807,000 | Profit: 1,100,000)
    INSERT INTO public.transactions (business_id, type, amount, category, description, date, source) VALUES
        -- Income (Total: 2,907,000)
        (v_business_id, 'income', 350000, 'Bakery Sales', 'Morning pastry batch & custom cake', '2026-10-01', 'manual'),
        (v_business_id, 'income', 185000, 'Bakery Sales', 'Retail breads & croissants', '2026-10-02', 'manual'),
        (v_business_id, 'income', 420000, 'Catering', 'Local office tea break snack boxes', '2026-10-03', 'manual'),
        (v_business_id, 'income', 210000, 'Bakery Sales', 'Artisan sourdough & milk breads', '2026-10-03', 'ocr'),
        (v_business_id, 'income', 195000, 'Bakery Sales', 'Afternoon coffee and pastry combos', '2026-10-04', 'manual'),
        (v_business_id, 'income', 310000, 'Bakery Sales', 'Weekend special chiffon & rolls', '2026-10-05', 'manual'),
        (v_business_id, 'income', 280000, 'Online Orders', 'Delivery app bakery orders', '2026-10-05', 'ocr'),
        (v_business_id, 'income', 450000, 'Catering', 'Birthday dessert table order', '2026-10-06', 'manual'),
        (v_business_id, 'income', 247000, 'Bakery Sales', 'Daily retail counter sales', '2026-10-07', 'manual'),
        (v_business_id, 'income', 260000, 'Online Orders', 'Marketplace pastry pre-orders', '2026-10-08', 'csv'),

        -- Expenses (Total: 1,807,000)
        (v_business_id, 'expense', 450000, 'Raw Materials', 'High-protein wheat flour 25kg & butter', '2026-10-01', 'ocr'),
        (v_business_id, 'expense', 120000, 'Packaging', 'Eco bakery boxes & parchment liners', '2026-10-01', 'ocr'),
        (v_business_id, 'expense', 85000, 'Utilities', 'LPG gas cylinder refill for oven', '2026-10-02', 'manual'),
        (v_business_id, 'expense', 210000, 'Raw Materials', 'Dairy cream, milk, and farm eggs', '2026-10-02', 'ocr'),
        (v_business_id, 'expense', 160000, 'Logistics', 'Courier & courier delivery fees (+18% spike)', '2026-10-03', 'ocr'),
        (v_business_id, 'expense', 95000, 'Raw Materials', 'Belgian cocoa powder & chocolate chips', '2026-10-04', 'manual'),
        (v_business_id, 'expense', 75000, 'Packaging', 'Custom printed stickers & carry bags', '2026-10-04', 'manual'),
        (v_business_id, 'expense', 180000, 'Logistics', 'Expedited ingredient shipping', '2026-10-05', 'manual'),
        (v_business_id, 'expense', 130000, 'Logistics', 'Delivery logistics for catering order', '2026-10-06', 'manual'),
        (v_business_id, 'expense', 110000, 'Raw Materials', 'Yeast, vanilla beans, and baking powder', '2026-10-06', 'ocr'),
        (v_business_id, 'expense', 52000, 'Utilities', 'Water utility weekly top-up', '2026-10-07', 'manual'),
        (v_business_id, 'expense', 40000, 'Maintenance', 'Mixer silicone seal replacement', '2026-10-07', 'manual'),
        (v_business_id, 'expense', 50000, 'Marketing', 'Social media promo post boost', '2026-10-08', 'manual'),
        (v_business_id, 'expense', 50000, 'Miscellaneous', 'Kitchen cleaning & hygiene supplies', '2026-10-08', 'manual');

    -- 4. Supplier Debts (750k due in 5 days)
    INSERT INTO public.debts (business_id, supplier, amount, due_date, status)
    VALUES (v_business_id, 'PT Pangan Flour Supply', 750000, '2026-10-13', 'unpaid');

    -- 5. Scheduled Restock Expense (1.4M Ramadan Restock in 9 days)
    INSERT INTO public.scheduled_expenses (business_id, label, amount, date)
    VALUES (v_business_id, 'Ramadan Pre-Season Restock (Flour, Butter, Sugar)', 1400000, '2026-10-17');

    -- 6. Alerts
    INSERT INTO public.alerts (business_id, level, title, detail, suggested_action, action_route, resolved)
    VALUES
        (v_business_id, 'critical', 'Cash Deficit Alert in 9 Days', 'Ramadan Restock (IDR 1,400,000) on Oct 17 exceeds your projected cash balance (IDR 1,100,000). Estimated shortage: ~IDR 630,000.', 'Review fast disbursement funding or adjust supplier terms', '/funding', FALSE),
        (v_business_id, 'warning', 'Supplier Debt Due in 5 Days', 'PT Pangan Flour Supply invoice of IDR 750,000 is due on Oct 13, 2026.', 'Schedule payment or request 14-day extension', '/reports', FALSE),
        (v_business_id, 'warning', 'Shipping Cost Anomaly (+18%)', 'Logistics expense rose to 26% of total operating expenses (IDR 470,000 this month).', 'Consider bulk delivery consolidation or local route optimization', '/reports', FALSE),
        (v_business_id, 'positive', 'Bakery Sales Up +10% This Week', 'Morning pastry batch sales grew 10% week-over-week, boosting healthy cash margin to 37.8%.', 'Increase morning batch volume to capture peak demand', '/reports', FALSE);

    -- 7. Audit Log Seed
    INSERT INTO public.agent_actions (user_id, tool, input, output, tier, status, timestamp)
    VALUES
        (v_user_id, 'get_summary', '{"period": "this_month"}'::jsonb, '{"income": 2907000, "expense": 1807000, "profit": 1100000, "margin": 0.378}'::jsonb, 'T0', 'completed', NOW() - INTERVAL '3 hours'),
        (v_user_id, 'forecast_cash', '{"currentBalance": 1100000, "projectionDays": 30}'::jsonb, '{"daysUntilDeficit": 9, "shortageAmount": 630000}'::jsonb, 'T0', 'completed', NOW() - INTERVAL '2 hours'),
        (v_user_id, 'create_alert', '{"level": "critical", "trigger": "deficit_day_9"}'::jsonb, '{"notified": true}'::jsonb, 'T1', 'completed', NOW() - INTERVAL '2 hours');

    RETURN jsonb_build_object(
        'success', TRUE,
        'business_id', v_business_id,
        'transactions_count', 24,
        'debts_count', 1,
        'scheduled_expenses_count', 1,
        'alerts_count', 4
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
