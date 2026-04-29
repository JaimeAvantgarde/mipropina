-- ============================================================================
-- Migration 008: Security hardening
-- Locks down direct client writes to financial tables, protects invite/push data,
-- and adds fields needed for safer payout idempotency and restaurant archival.
-- ============================================================================

-- Keep helper functions aligned with active staff only.
CREATE OR REPLACE FUNCTION get_my_staff_id()
RETURNS uuid AS $$
    SELECT id FROM staff
    WHERE auth_user_id = auth.uid()
      AND active = true
    LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION get_my_restaurant_ids()
RETURNS SETOF uuid AS $$
    SELECT restaurant_id FROM staff
    WHERE auth_user_id = auth.uid()
      AND active = true;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_restaurant_owner(p_restaurant_id uuid)
RETURNS boolean AS $$
    SELECT EXISTS (
        SELECT 1 FROM staff
        WHERE auth_user_id = auth.uid()
          AND restaurant_id = p_restaurant_id
          AND role = 'owner'
          AND active = true
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_restaurant_member(p_restaurant_id uuid)
RETURNS boolean AS $$
    SELECT EXISTS (
        SELECT 1 FROM staff
        WHERE auth_user_id = auth.uid()
          AND restaurant_id = p_restaurant_id
          AND active = true
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Restaurants are archived instead of physically deleted.
ALTER TABLE restaurant
  ADD COLUMN IF NOT EXISTS deleted_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_restaurant_deleted_at
  ON restaurant(deleted_at)
  WHERE deleted_at IS NULL;

-- Stable request hash used by payout creation to block duplicate transfers.
ALTER TABLE distribution
  ADD COLUMN IF NOT EXISTS request_hash text;

CREATE UNIQUE INDEX IF NOT EXISTS idx_distribution_restaurant_request_hash
  ON distribution(restaurant_id, request_hash)
  WHERE request_hash IS NOT NULL;

COMMENT ON COLUMN restaurant.deleted_at IS 'Soft-delete/archive timestamp. Null means active.';
COMMENT ON COLUMN distribution.request_hash IS 'Stable hash of a payout request for idempotency.';

-- Push subscriptions contain browser endpoint keys. Protect them with RLS.
ALTER TABLE push_subscription ENABLE ROW LEVEL SECURITY;

-- Remove direct public/client writes to financial and operational tables.
DROP POLICY IF EXISTS tip_public_insert ON tip;
DROP POLICY IF EXISTS tip_owner_update ON tip;

DROP POLICY IF EXISTS restaurant_owner_all ON restaurant;
DROP POLICY IF EXISTS restaurant_staff_select ON restaurant;
CREATE POLICY restaurant_member_select ON restaurant
    FOR SELECT
    USING (deleted_at IS NULL AND is_restaurant_member(id));

DROP POLICY IF EXISTS staff_owner_all ON staff;
DROP POLICY IF EXISTS staff_member_select ON staff;
DROP POLICY IF EXISTS staff_self_update ON staff;
CREATE POLICY staff_member_select ON staff
    FOR SELECT
    USING (is_restaurant_member(restaurant_id));

DROP POLICY IF EXISTS distribution_owner_all ON distribution;
DROP POLICY IF EXISTS distribution_member_select ON distribution;
CREATE POLICY distribution_member_select ON distribution
    FOR SELECT
    USING (is_restaurant_member(restaurant_id));

DROP POLICY IF EXISTS payout_owner_all ON payout;
DROP POLICY IF EXISTS payout_member_select ON payout;
DROP POLICY IF EXISTS payout_self_select ON payout;
CREATE POLICY payout_owner_select ON payout
    FOR SELECT
    USING (
        is_restaurant_owner(
            (SELECT restaurant_id FROM distribution WHERE id = payout.distribution_id)
        )
    );
CREATE POLICY payout_self_select ON payout
    FOR SELECT
    USING (staff_id = get_my_staff_id());

DROP POLICY IF EXISTS invite_code_owner_all ON invite_code;
DROP POLICY IF EXISTS invite_code_public_select ON invite_code;
CREATE POLICY invite_code_owner_select ON invite_code
    FOR SELECT
    USING (is_restaurant_owner(restaurant_id));

DROP POLICY IF EXISTS qr_code_owner_all ON qr_code;
DROP POLICY IF EXISTS qr_code_public_select ON qr_code;
CREATE POLICY qr_code_owner_select ON qr_code
    FOR SELECT
    USING (is_restaurant_owner(restaurant_id));

-- API routes use the service role for mutations after explicit server-side auth.
REVOKE INSERT, UPDATE, DELETE ON restaurant FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON staff FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON tip FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON distribution FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON payout FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON invite_code FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON qr_code FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE ON push_subscription FROM anon, authenticated;
