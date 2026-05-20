-- ============================================================================
-- Migration 010: WhatsApp-based phone auth + role rework + Mario superadmin
-- Replaces email/password Supabase Auth with magic-link invites sent via wa.me.
-- Restaurants are created by Mario (platform superadmin via env-var credentials),
-- not by managers. Manager can be ejected, leaving the team in 'pending' state.
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Wipe existing data
-- ---------------------------------------------------------------------------
-- All restaurants, staff, tips, distributions, payouts, invites, QRs, push subs
-- are removed: the old auth model is being replaced and no data is migratable.
TRUNCATE TABLE
    push_subscription,
    qr_code,
    invite_code,
    payout,
    distribution,
    tip,
    staff,
    restaurant
RESTART IDENTITY CASCADE;

-- ---------------------------------------------------------------------------
-- 2. Drop auth.uid()-dependent helpers + their RLS policies
-- ---------------------------------------------------------------------------
DROP POLICY IF EXISTS restaurant_member_select ON restaurant;
DROP POLICY IF EXISTS staff_member_select       ON staff;
DROP POLICY IF EXISTS distribution_member_select ON distribution;
DROP POLICY IF EXISTS payout_owner_select       ON payout;
DROP POLICY IF EXISTS payout_self_select        ON payout;
DROP POLICY IF EXISTS invite_code_owner_select  ON invite_code;
DROP POLICY IF EXISTS qr_code_owner_select      ON qr_code;

DROP FUNCTION IF EXISTS get_my_staff_id()        CASCADE;
DROP FUNCTION IF EXISTS get_my_restaurant_ids()  CASCADE;
DROP FUNCTION IF EXISTS is_restaurant_owner(uuid) CASCADE;
DROP FUNCTION IF EXISTS is_restaurant_member(uuid) CASCADE;

-- All writes go through API routes using the service role. No anon access.
-- RLS stays enabled with no policies = deny-by-default for anon/authenticated.

-- ---------------------------------------------------------------------------
-- 3. Staff: drop email/auth/iban dependencies, add phone-unique + status
-- ---------------------------------------------------------------------------
DROP INDEX IF EXISTS idx_staff_auth_user;

-- Drop the old per-restaurant email uniqueness (Postgres auto-names the constraint
-- after the table+columns; try both common forms).
ALTER TABLE staff DROP CONSTRAINT IF EXISTS staff_restaurant_id_email_key;

ALTER TABLE staff DROP COLUMN IF EXISTS auth_user_id;
ALTER TABLE staff DROP COLUMN IF EXISTS iban;

-- email is kept but becomes optional (collected later for Stripe Connect).
ALTER TABLE staff ALTER COLUMN email DROP NOT NULL;

-- phone becomes mandatory and globally unique. One phone = one staff record.
ALTER TABLE staff ALTER COLUMN phone SET NOT NULL;
CREATE UNIQUE INDEX idx_staff_phone_unique ON staff(phone);

-- Lifecycle status: pending = manager ejected, team awaiting new manager.
CREATE TYPE staff_status_enum AS ENUM ('active', 'pending', 'inactive');
ALTER TABLE staff ADD COLUMN status staff_status_enum NOT NULL DEFAULT 'active';
CREATE INDEX idx_staff_status ON staff(restaurant_id, status);

-- ---------------------------------------------------------------------------
-- 4. Roles: rename 'owner' → 'manager', add 'kitchen'
-- ---------------------------------------------------------------------------
ALTER TABLE staff ALTER COLUMN role DROP DEFAULT;

ALTER TYPE staff_role_enum RENAME TO staff_role_enum_old;
CREATE TYPE staff_role_enum AS ENUM ('manager', 'waiter', 'kitchen');

ALTER TABLE staff
    ALTER COLUMN role TYPE staff_role_enum
    USING (CASE role::text
              WHEN 'owner' THEN 'manager'::staff_role_enum
              ELSE role::text::staff_role_enum
           END);

ALTER TABLE staff ALTER COLUMN role SET DEFAULT 'waiter'::staff_role_enum;

DROP TYPE staff_role_enum_old;

-- ---------------------------------------------------------------------------
-- 5. Restaurant: owner_id → manager_id
-- ---------------------------------------------------------------------------
ALTER TABLE restaurant DROP CONSTRAINT IF EXISTS fk_restaurant_owner;
ALTER TABLE restaurant RENAME COLUMN owner_id TO manager_id;
ALTER TABLE restaurant
    ADD CONSTRAINT fk_restaurant_manager
    FOREIGN KEY (manager_id) REFERENCES staff(id) ON DELETE SET NULL;

-- ---------------------------------------------------------------------------
-- 6. Invite codes: long token + role + phone NOT NULL
-- ---------------------------------------------------------------------------
ALTER TABLE invite_code DROP COLUMN code;
ALTER TABLE invite_code ADD COLUMN token text NOT NULL UNIQUE;
ALTER TABLE invite_code ADD COLUMN role staff_role_enum NOT NULL DEFAULT 'waiter';
ALTER TABLE invite_code ALTER COLUMN phone SET NOT NULL;

CREATE INDEX idx_invite_code_token ON invite_code(token);

COMMENT ON COLUMN invite_code.token IS 'Opaque magic-link token (UUID). One-time use.';
COMMENT ON COLUMN invite_code.role  IS 'Role to assign when this invite is accepted.';

-- ---------------------------------------------------------------------------
-- 7. Cleanup of comments referring to old model
-- ---------------------------------------------------------------------------
COMMENT ON COLUMN staff.email  IS 'Optional. Collected at first login from managers for Stripe Connect.';
COMMENT ON COLUMN staff.phone  IS 'WhatsApp-capable phone, globally unique. Used as login identity.';
COMMENT ON COLUMN staff.status IS 'active = normal; pending = orphaned by manager ejection; inactive = removed.';
COMMENT ON COLUMN restaurant.manager_id IS 'Current manager (was owner). NULL when restaurant has no manager.';

COMMIT;
