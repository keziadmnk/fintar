-- =============================================================================
-- FinTar Database Schema (PRD Section 10)
-- PostgreSQL with strict Row Level Security (RLS) on EVERY table
-- =============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. BUSINESSES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.businesses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    scale VARCHAR(50) DEFAULT 'micro' CHECK (scale IN ('micro', 'small', 'medium')),
    display_currency VARCHAR(10) DEFAULT 'IDR' CHECK (display_currency IN ('IDR', 'USD', 'CNY')),
    avg_monthly_profit NUMERIC(15, 2) DEFAULT 0,
    current_cash_balance NUMERIC(15, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses(owner_id);

-- -----------------------------------------------------------------------------
-- 2. CONSENTS TABLE (Insert-only for users, revocable via new row or flag)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.consents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('ai_processing', 'anonymous_insights')),
    granted BOOLEAN NOT NULL DEFAULT TRUE,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consents_user ON public.consents(user_id);

-- -----------------------------------------------------------------------------
-- 3. RECEIPTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.receipts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    image_ref TEXT,
    parsed_json JSONB NOT NULL DEFAULT '{}'::jsonb,
    confidence NUMERIC(4, 3) DEFAULT 1.000,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_receipts_business ON public.receipts(business_id);

-- -----------------------------------------------------------------------------
-- 4. TRANSACTIONS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    category VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    source VARCHAR(50) DEFAULT 'manual' CHECK (source IN ('manual', 'ocr', 'csv')),
    receipt_id UUID REFERENCES public.receipts(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_transactions_business ON public.transactions(business_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON public.transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);

-- -----------------------------------------------------------------------------
-- 5. DEBTS TABLE (Supplier Debts)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.debts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    supplier VARCHAR(255) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    due_date DATE NOT NULL,
    status VARCHAR(50) DEFAULT 'unpaid' CHECK (status IN ('unpaid', 'paid', 'overdue')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_debts_business ON public.debts(business_id);
CREATE INDEX IF NOT EXISTS idx_debts_due_date ON public.debts(due_date);

-- -----------------------------------------------------------------------------
-- 6. SCHEDULED_EXPENSES TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.scheduled_expenses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    label VARCHAR(255) NOT NULL,
    amount NUMERIC(15, 2) NOT NULL CHECK (amount >= 0),
    date DATE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_expenses_business ON public.scheduled_expenses(business_id);

-- -----------------------------------------------------------------------------
-- 7. ALERTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    level VARCHAR(20) NOT NULL CHECK (level IN ('critical', 'warning', 'positive')),
    title VARCHAR(255) NOT NULL,
    detail TEXT NOT NULL,
    suggested_action TEXT,
    action_route VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved BOOLEAN DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_alerts_business ON public.alerts(business_id);
CREATE INDEX IF NOT EXISTS idx_alerts_resolved ON public.alerts(resolved);

-- -----------------------------------------------------------------------------
-- 8. FINANCING_PRODUCTS TABLE (Simulated - Read-only for users)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.financing_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    annual_rate NUMERIC(6, 4) NOT NULL, -- e.g. 0.0600 for 6%
    collateral TEXT NOT NULL,
    max_amount NUMERIC(15, 2) NOT NULL,
    tenors JSONB NOT NULL DEFAULT '[6, 12, 24]'::jsonb,
    speed_days INT NOT NULL DEFAULT 3,
    is_simulated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 9. PROPOSALS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.proposals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_id UUID NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.financing_products(id) ON DELETE RESTRICT,
    amount NUMERIC(15, 2) NOT NULL,
    tenor INT NOT NULL,
    pdf_ref TEXT,
    status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'submitted_sandbox', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_proposals_business ON public.proposals(business_id);

-- -----------------------------------------------------------------------------
-- 10. INSURANCE_PRODUCTS TABLE (Simulated - Read-only for users)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.insurance_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    provider VARCHAR(255) NOT NULL,
    covers JSONB NOT NULL DEFAULT '[]'::jsonb,
    monthly_premium NUMERIC(15, 2) NOT NULL,
    is_simulated BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- -----------------------------------------------------------------------------
-- 11. AGENT_ACTIONS TABLE (Immutable Audit Log - Insert-Only for users)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.agent_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    tool VARCHAR(100) NOT NULL,
    input JSONB NOT NULL DEFAULT '{}'::jsonb,
    output JSONB NOT NULL DEFAULT '{}'::jsonb,
    tier VARCHAR(10) NOT NULL CHECK (tier IN ('T0', 'T1', 'T2', 'T3')),
    status VARCHAR(50) DEFAULT 'completed' CHECK (status IN ('pending_approval', 'approved', 'rejected', 'completed', 'blocked')),
    approval_id UUID,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_agent_actions_user ON public.agent_actions(user_id);
CREATE INDEX IF NOT EXISTS idx_agent_actions_timestamp ON public.agent_actions(timestamp);

-- -----------------------------------------------------------------------------
-- 12. APPROVALS TABLE (Tier-2 Action Approvals)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.approvals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    action_id UUID REFERENCES public.agent_actions(id) ON DELETE CASCADE,
    decision VARCHAR(20) NOT NULL CHECK (decision IN ('approved', 'rejected', 'pending')),
    decided_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_approvals_user ON public.approvals(user_id);

-- -----------------------------------------------------------------------------
-- 13. FX_RATES TABLE (Read-Only for users)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.fx_rates (
    currency VARCHAR(10) PRIMARY KEY,
    rate_to_idr NUMERIC(15, 4) NOT NULL,
    as_of TIMESTAMPTZ DEFAULT NOW()
);

-- =============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES ON EVERY TABLE
-- =============================================================================

-- Enable RLS on every table
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financing_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.insurance_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fx_rates ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current auth.uid() owns a business
CREATE OR REPLACE FUNCTION public.is_business_owner(biz_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.businesses
        WHERE id = biz_id AND owner_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 1. Businesses Policies: User can only access their own business
DROP POLICY IF EXISTS "Users can view own business" ON public.businesses;
CREATE POLICY "Users can view own business"
    ON public.businesses FOR SELECT
    USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can create own business" ON public.businesses;
CREATE POLICY "Users can create own business"
    ON public.businesses FOR INSERT
    WITH CHECK (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can update own business" ON public.businesses;
CREATE POLICY "Users can update own business"
    ON public.businesses FOR UPDATE
    USING (owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete own business" ON public.businesses;
CREATE POLICY "Users can delete own business"
    ON public.businesses FOR DELETE
    USING (owner_id = auth.uid());

-- 2. Consents Policies: User can SELECT and INSERT (NO UPDATE/DELETE => Insert-Only)
DROP POLICY IF EXISTS "Users can view own consents" ON public.consents;
CREATE POLICY "Users can view own consents"
    ON public.consents FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert own consents" ON public.consents;
CREATE POLICY "Users can insert own consents"
    ON public.consents FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- 3. Receipts Policies: Scoped by business ownership
DROP POLICY IF EXISTS "Users can manage own receipts" ON public.receipts;
CREATE POLICY "Users can manage own receipts"
    ON public.receipts FOR ALL
    USING (public.is_business_owner(business_id))
    WITH CHECK (public.is_business_owner(business_id));

-- 4. Transactions Policies: Scoped by business ownership
DROP POLICY IF EXISTS "Users can manage own transactions" ON public.transactions;
CREATE POLICY "Users can manage own transactions"
    ON public.transactions FOR ALL
    USING (public.is_business_owner(business_id))
    WITH CHECK (public.is_business_owner(business_id));

-- 5. Debts Policies: Scoped by business ownership
DROP POLICY IF EXISTS "Users can manage own debts" ON public.debts;
CREATE POLICY "Users can manage own debts"
    ON public.debts FOR ALL
    USING (public.is_business_owner(business_id))
    WITH CHECK (public.is_business_owner(business_id));

-- 6. Scheduled Expenses Policies: Scoped by business ownership
DROP POLICY IF EXISTS "Users can manage own scheduled expenses" ON public.scheduled_expenses;
CREATE POLICY "Users can manage own scheduled expenses"
    ON public.scheduled_expenses FOR ALL
    USING (public.is_business_owner(business_id))
    WITH CHECK (public.is_business_owner(business_id));

-- 7. Alerts Policies: Scoped by business ownership
DROP POLICY IF EXISTS "Users can manage own alerts" ON public.alerts;
CREATE POLICY "Users can manage own alerts"
    ON public.alerts FOR ALL
    USING (public.is_business_owner(business_id))
    WITH CHECK (public.is_business_owner(business_id));

-- 8. Financing Products: Read-Only for all authenticated users
DROP POLICY IF EXISTS "Authenticated users can view financing products" ON public.financing_products;
CREATE POLICY "Authenticated users can view financing products"
    ON public.financing_products FOR SELECT
    TO authenticated
    USING (true);

-- 9. Proposals Policies: Scoped by business ownership
DROP POLICY IF EXISTS "Users can manage own proposals" ON public.proposals;
CREATE POLICY "Users can manage own proposals"
    ON public.proposals FOR ALL
    USING (public.is_business_owner(business_id))
    WITH CHECK (public.is_business_owner(business_id));

-- 10. Insurance Products: Read-Only for all authenticated users
DROP POLICY IF EXISTS "Authenticated users can view insurance products" ON public.insurance_products;
CREATE POLICY "Authenticated users can view insurance products"
    ON public.insurance_products FOR SELECT
    TO authenticated
    USING (true);

-- 11. Agent Actions Policies: Insert-Only for users (NO UPDATE, NO DELETE => Immutable Audit Log)
DROP POLICY IF EXISTS "Users can view own agent actions" ON public.agent_actions;
CREATE POLICY "Users can view own agent actions"
    ON public.agent_actions FOR SELECT
    USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Users can insert agent actions" ON public.agent_actions;
CREATE POLICY "Users can insert agent actions"
    ON public.agent_actions FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- 12. Approvals Policies: Users manage approvals for their own user_id
DROP POLICY IF EXISTS "Users can manage own approvals" ON public.approvals;
CREATE POLICY "Users can manage own approvals"
    ON public.approvals FOR ALL
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- 13. FX Rates: Read-Only for all authenticated users
DROP POLICY IF EXISTS "Authenticated users can view fx rates" ON public.fx_rates;
CREATE POLICY "Authenticated users can view fx rates"
    ON public.fx_rates FOR SELECT
    TO authenticated
    USING (true);
