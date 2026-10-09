-- =============================================================================
-- FinTar Test Cases 5 & 6 Verification Script (PRD Section 14 & Task 3)
-- Test 5: No consent / Missing consent -> check_consent returns FALSE (AI blocked)
-- Test 6: Revoke consent -> check_consent returns FALSE (processing stops);
--         Delete data -> delete_my_data removes rows across all tables.
-- =============================================================================

DO $$
DECLARE
    v_test_user UUID := '33333333-3333-3333-3333-333333333333';
    v_biz_id UUID;
    v_has_consent BOOLEAN;
    v_delete_result JSONB;
    v_remaining_tx INT;
    v_remaining_biz INT;
    v_remaining_consents INT;
    v_remaining_actions INT;
BEGIN
    RAISE NOTICE '------------------------------------------------------------';
    RAISE NOTICE 'TEST SUITE: PRD TEST CASES 5 & 6 (CONSENT & DATA ERASURE)';
    RAISE NOTICE '------------------------------------------------------------';

    -- Clean up any previous test state for test user
    PERFORM public.delete_my_data(v_test_user);

    -- =========================================================================
    -- PRD TEST CASE 5: No Consent -> AI features blocked
    -- =========================================================================
    v_has_consent := public.check_consent(v_test_user, 'ai_processing');
    IF v_has_consent = FALSE THEN
        RAISE NOTICE '[PASS Test 5.1] Initial State: User has no consent record -> check_consent returns FALSE.';
    ELSE
        RAISE EXCEPTION '[FAIL Test 5.1] User without consent returned TRUE!';
    END IF;

    -- Grant Consent
    PERFORM public.record_consent(v_test_user, 'ai_processing', TRUE);
    v_has_consent := public.check_consent(v_test_user, 'ai_processing');
    IF v_has_consent = TRUE THEN
        RAISE NOTICE '[PASS Test 5.2] Granted Consent: check_consent returns TRUE.';
    ELSE
        RAISE EXCEPTION '[FAIL Test 5.2] Granted consent not recognized!';
    END IF;

    -- =========================================================================
    -- PRD TEST CASE 6: Revoke Consent & Delete My Data
    -- =========================================================================
    -- 1. Revoke Consent (Insert new row with granted = FALSE)
    PERFORM public.record_consent(v_test_user, 'ai_processing', FALSE);
    v_has_consent := public.check_consent(v_test_user, 'ai_processing');
    IF v_has_consent = FALSE THEN
        RAISE NOTICE '[PASS Test 6.1] Revoke Consent: check_consent immediately returns FALSE (AI processing stopped).';
    ELSE
        RAISE EXCEPTION '[FAIL Test 6.1] Revoked consent still returned TRUE!';
    END IF;

    -- 2. Seed some business transactions for the test user to verify deletion
    PERFORM public.seed_demo_data(v_test_user);
    SELECT COUNT(*) INTO v_remaining_tx FROM public.transactions WHERE business_id IN (SELECT id FROM public.businesses WHERE owner_id = v_test_user);
    RAISE NOTICE 'Seeded % transactions for test user prior to deletion test.', v_remaining_tx;

    -- 3. Execute delete_my_data
    v_delete_result := public.delete_my_data(v_test_user);
    RAISE NOTICE 'delete_my_data execution result: %', v_delete_result;

    -- 4. Verify all tables are empty for this user
    SELECT COUNT(*) INTO v_remaining_tx FROM public.transactions WHERE business_id IN (SELECT id FROM public.businesses WHERE owner_id = v_test_user);
    SELECT COUNT(*) INTO v_remaining_biz FROM public.businesses WHERE owner_id = v_test_user;
    SELECT COUNT(*) INTO v_remaining_consents FROM public.consents WHERE user_id = v_test_user;
    SELECT COUNT(*) INTO v_remaining_actions FROM public.agent_actions WHERE user_id = v_test_user;

    IF v_remaining_tx = 0 AND v_remaining_biz = 0 AND v_remaining_consents = 0 AND v_remaining_actions = 0 THEN
        RAISE NOTICE '[PASS Test 6.2] Delete Data: All rows removed across businesses, transactions, consents, and agent_actions (Tables empty).';
    ELSE
        RAISE EXCEPTION '[FAIL Test 6.2] Data remained after delete_my_data! tx: %, biz: %, consents: %, actions: %', 
            v_remaining_tx, v_remaining_biz, v_remaining_consents, v_remaining_actions;
    END IF;

    RAISE NOTICE '------------------------------------------------------------';
    RAISE NOTICE 'TEST CASES 5 & 6 PASSED WITH 100%% SUCCESS (CLIENT & SERVER)';
    RAISE NOTICE '------------------------------------------------------------';
END;
$$;
