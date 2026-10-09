-- =============================================================================
-- FinTar Auth, Consent Management & Data Erasure Functions (PRD FR-01, FR-02, FR-23)
-- =============================================================================

-- 1. Helper function to check latest consent status for a user (Server-side Enforcement)
CREATE OR REPLACE FUNCTION public.check_consent(
    p_user_id UUID DEFAULT auth.uid(),
    p_type VARCHAR(50) DEFAULT 'ai_processing'
)
RETURNS BOOLEAN AS $$
DECLARE
    v_granted BOOLEAN;
BEGIN
    -- Query the most recent consent record for this user and type
    SELECT granted INTO v_granted
    FROM public.consents
    WHERE user_id = p_user_id AND type = p_type
    ORDER BY timestamp DESC
    LIMIT 1;

    -- Return FALSE if no record exists or if latest is FALSE
    RETURN COALESCE(v_granted, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Insert-only consent recording function (Auditable & Revocable)
CREATE OR REPLACE FUNCTION public.record_consent(
    p_user_id UUID,
    p_type VARCHAR(50),
    p_granted BOOLEAN
)
RETURNS JSONB AS $$
DECLARE
    v_consent_id UUID;
BEGIN
    IF p_user_id IS NULL THEN
        RAISE EXCEPTION 'User ID is required';
    END IF;

    -- Always INSERT a new row to maintain immutable audit trail of consent grants/revocations
    INSERT INTO public.consents (user_id, type, granted, timestamp)
    VALUES (p_user_id, p_type, p_granted, NOW())
    RETURNING id INTO v_consent_id;

    -- Log to agent_actions as audit record
    INSERT INTO public.agent_actions (user_id, tool, input, output, tier, status)
    VALUES (
        p_user_id,
        'update_consent',
        jsonb_build_object('type', p_type, 'granted', p_granted),
        jsonb_build_object('consent_id', v_consent_id, 'effective_immediately', TRUE),
        'T0',
        'completed'
    );

    RETURN jsonb_build_object('success', TRUE, 'consent_id', v_consent_id, 'granted', p_granted);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Complete Data Erasure (GDPR / PDP Right to Erasure - PRD FR-23)
-- Deletes user data across all tables in a single transaction
CREATE OR REPLACE FUNCTION public.delete_my_data(p_user_id UUID DEFAULT auth.uid())
RETURNS JSONB AS $$
DECLARE
    v_target_user UUID;
    v_biz_ids UUID[];
    v_deleted_counts JSONB;
    v_tx_count INT;
    v_debts_count INT;
    v_expenses_count INT;
    v_alerts_count INT;
    v_proposals_count INT;
    v_receipts_count INT;
BEGIN
    v_target_user := COALESCE(p_user_id, auth.uid());
    
    IF v_target_user IS NULL THEN
        RAISE EXCEPTION 'Unauthorized: User ID must be provided';
    END IF;

    -- Fetch all business IDs owned by this user
    SELECT ARRAY_AGG(id) INTO v_biz_ids
    FROM public.businesses
    WHERE owner_id = v_target_user;

    IF v_biz_ids IS NOT NULL THEN
        -- 1. Delete transactions
        DELETE FROM public.transactions WHERE business_id = ANY(v_biz_ids);
        GET DIAGNOSTICS v_tx_count = ROW_COUNT;

        -- 2. Delete debts
        DELETE FROM public.debts WHERE business_id = ANY(v_biz_ids);
        GET DIAGNOSTICS v_debts_count = ROW_COUNT;

        -- 3. Delete scheduled expenses
        DELETE FROM public.scheduled_expenses WHERE business_id = ANY(v_biz_ids);
        GET DIAGNOSTICS v_expenses_count = ROW_COUNT;

        -- 4. Delete alerts
        DELETE FROM public.alerts WHERE business_id = ANY(v_biz_ids);
        GET DIAGNOSTICS v_alerts_count = ROW_COUNT;

        -- 5. Delete proposals
        DELETE FROM public.proposals WHERE business_id = ANY(v_biz_ids);
        GET DIAGNOSTICS v_proposals_count = ROW_COUNT;

        -- 6. Delete receipts
        DELETE FROM public.receipts WHERE business_id = ANY(v_biz_ids);
        GET DIAGNOSTICS v_receipts_count = ROW_COUNT;

        -- 7. Delete businesses
        DELETE FROM public.businesses WHERE owner_id = v_target_user;
    END IF;

    -- 8. Delete user approvals
    DELETE FROM public.approvals WHERE user_id = v_target_user;

    -- 9. Delete user agent actions
    DELETE FROM public.agent_actions WHERE user_id = v_target_user;

    -- 10. Delete user consent records
    DELETE FROM public.consents WHERE user_id = v_target_user;

    RETURN jsonb_build_object(
        'success', TRUE,
        'user_id', v_target_user,
        'deleted', jsonb_build_object(
            'transactions', COALESCE(v_tx_count, 0),
            'debts', COALESCE(v_debts_count, 0),
            'scheduled_expenses', COALESCE(v_expenses_count, 0),
            'alerts', COALESCE(v_alerts_count, 0),
            'proposals', COALESCE(v_proposals_count, 0),
            'receipts', COALESCE(v_receipts_count, 0)
        )
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
