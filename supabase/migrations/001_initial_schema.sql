-- ============================================================================
-- MiPropina.es - Initial Database Schema
-- Migration 001: Core tables, enums, indexes, RLS policies, demo seed
-- ============================================================================

-- ---------------------------------------------------------------------------
-- 0. Extensions
-- ---------------------------------------------------------------------------
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- 1. Enum types
-- ---------------------------------------------------------------------------
CREATE TYPE staff_role_enum AS ENUM ('owner', 'waiter');
CREATE TYPE tip_status_enum AS ENUM ('pending', 'completed', 'failed');
CREATE TYPE distribution_method_enum AS ENUM ('equal', 'hours', 'custom');
CREATE TYPE distribution_status_enum AS ENUM ('pending', 'distributed');
CREATE TYPE payout_status_enum AS ENUM ('pending', 'sent', 'failed');

-- ---------------------------------------------------------------------------
-- 2. Tables
-- ---------------------------------------------------------------------------

-- 2.1 RESTAURANT
CREATE TABLE restaurant (
    id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    name             text        NOT NULL,
    slug             text        UNIQUE NOT NULL,
    logo_emoji       text        DEFAULT '🍽️',
    theme_color      text        DEFAULT '#2ECC87',
    owner_id         uuid,                          -- FK added after staff exists
    stripe_account_id text,
    created_at       timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE restaurant IS 'Each registered restaurant/bar on the platform';

-- 2.2 STAFF
CREATE TABLE staff (
    id              uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id   uuid            NOT NULL REFERENCES restaurant(id) ON DELETE CASCADE,
    auth_user_id    uuid,           -- FK to auth.users, nullable until user signs up
    name            text            NOT NULL,
    email           text            NOT NULL,
    phone           text,
    avatar_emoji    text            DEFAULT '🧑‍🍳',
    role            staff_role_enum NOT NULL DEFAULT 'waiter',
    iban            text,
    stripe_payout_id text,
    active          boolean         NOT NULL DEFAULT true,
    created_at      timestamptz     NOT NULL DEFAULT now(),

    UNIQUE (restaurant_id, email)
);

COMMENT ON TABLE staff IS 'Waiters and owners belonging to a restaurant';

-- Now add the deferred FK from restaurant.owner_id -> staff.id
ALTER TABLE restaurant
    ADD CONSTRAINT fk_restaurant_owner
    FOREIGN KEY (owner_id) REFERENCES staff(id)
    ON DELETE SET NULL;

-- 2.3 TIP
CREATE TABLE tip (
    id                 uuid            PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id      uuid            NOT NULL REFERENCES restaurant(id) ON DELETE CASCADE,
    amount_cents       integer         NOT NULL CHECK (amount_cents > 0),
    stripe_payment_id  text            UNIQUE,
    status             tip_status_enum NOT NULL DEFAULT 'pending',
    customer_session   text,
    created_at         timestamptz     NOT NULL DEFAULT now()
);

COMMENT ON TABLE tip IS 'Individual tip payments from customers';

-- 2.4 DISTRIBUTION
CREATE TABLE distribution (
    id              uuid                     PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id   uuid                     NOT NULL REFERENCES restaurant(id) ON DELETE CASCADE,
    week_start      date                     NOT NULL,
    week_end        date                     NOT NULL,
    total_cents     integer                  NOT NULL CHECK (total_cents >= 0),
    method          distribution_method_enum NOT NULL,
    status          distribution_status_enum NOT NULL DEFAULT 'pending',
    created_by      uuid                     REFERENCES staff(id) ON DELETE SET NULL,
    created_at      timestamptz              NOT NULL DEFAULT now(),

    CHECK (week_end >= week_start)
);

COMMENT ON TABLE distribution IS 'Weekly tip distribution batches';

-- 2.5 PAYOUT
CREATE TABLE payout (
    id                 uuid              PRIMARY KEY DEFAULT gen_random_uuid(),
    distribution_id    uuid              NOT NULL REFERENCES distribution(id) ON DELETE CASCADE,
    staff_id           uuid              NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
    amount_cents       integer           NOT NULL CHECK (amount_cents > 0),
    stripe_transfer_id text,
    status             payout_status_enum NOT NULL DEFAULT 'pending',
    paid_at            timestamptz
);

COMMENT ON TABLE payout IS 'Individual payout to a staff member within a distribution';

-- 2.6 INVITE_CODE
CREATE TABLE invite_code (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id   uuid        NOT NULL REFERENCES restaurant(id) ON DELETE CASCADE,
    code            text        UNIQUE NOT NULL,
    phone           text,
    name            text        NOT NULL,
    used            boolean     NOT NULL DEFAULT false,
    expires_at      timestamptz NOT NULL,
    created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE invite_code IS 'One-time invite codes for staff onboarding';

-- 2.7 QR_CODE
CREATE TABLE qr_code (
    id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
    restaurant_id   uuid        NOT NULL REFERENCES restaurant(id) ON DELETE CASCADE,
    table_label     text        NOT NULL,
    url             text        NOT NULL,
    created_at      timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE qr_code IS 'QR codes placed on tables linking to the tipping page';

-- ---------------------------------------------------------------------------
-- 3. Indexes
-- ---------------------------------------------------------------------------

-- Staff lookups
CREATE INDEX idx_staff_restaurant  ON staff(restaurant_id);
CREATE INDEX idx_staff_auth_user   ON staff(auth_user_id) WHERE auth_user_id IS NOT NULL;
CREATE INDEX idx_staff_active      ON staff(restaurant_id, active);

-- Tip queries (dashboard, aggregations)
CREATE INDEX idx_tip_restaurant          ON tip(restaurant_id);
CREATE INDEX idx_tip_restaurant_status   ON tip(restaurant_id, status);
CREATE INDEX idx_tip_created_at          ON tip(created_at);
CREATE INDEX idx_tip_restaurant_created  ON tip(restaurant_id, created_at);

-- Distribution lookups
CREATE INDEX idx_distribution_restaurant ON distribution(restaurant_id);
CREATE INDEX idx_distribution_week       ON distribution(restaurant_id, week_start, week_end);

-- Payout lookups
CREATE INDEX idx_payout_distribution     ON payout(distribution_id);
CREATE INDEX idx_payout_staff            ON payout(staff_id);

-- Invite code lookups
CREATE INDEX idx_invite_code_restaurant  ON invite_code(restaurant_id);
CREATE INDEX idx_invite_code_used        ON invite_code(used) WHERE used = false;

-- QR code lookups
CREATE INDEX idx_qr_code_restaurant      ON qr_code(restaurant_id);

-- Restaurant slug (already has UNIQUE index, but explicit for clarity)
-- slug UNIQUE constraint handles this

-- ---------------------------------------------------------------------------
-- 4. Trigger: auto-set created_at
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION set_created_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.created_at IS NULL THEN
        NEW.created_at = now();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_restaurant_created_at
    BEFORE INSERT ON restaurant
    FOR EACH ROW EXECUTE FUNCTION set_created_at();

CREATE TRIGGER trg_staff_created_at
    BEFORE INSERT ON staff
    FOR EACH ROW EXECUTE FUNCTION set_created_at();

CREATE TRIGGER trg_tip_created_at
    BEFORE INSERT ON tip
    FOR EACH ROW EXECUTE FUNCTION set_created_at();

CREATE TRIGGER trg_distribution_created_at
    BEFORE INSERT ON distribution
    FOR EACH ROW EXECUTE FUNCTION set_created_at();

CREATE TRIGGER trg_invite_code_created_at
    BEFORE INSERT ON invite_code
    FOR EACH ROW EXECUTE FUNCTION set_created_at();

CREATE TRIGGER trg_qr_code_created_at
    BEFORE INSERT ON qr_code
    FOR EACH ROW EXECUTE FUNCTION set_created_at();

-- ---------------------------------------------------------------------------
-- 5. Helper functions for RLS
-- ---------------------------------------------------------------------------

-- Returns the staff row for the currently authenticated user in a given restaurant
CREATE OR REPLACE FUNCTION get_my_staff_id()
RETURNS uuid AS $$
    SELECT id FROM staff
    WHERE auth_user_id = auth.uid()
    LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Returns the restaurant_id(s) the authenticated user belongs to
CREATE OR REPLACE FUNCTION get_my_restaurant_ids()
RETURNS SETOF uuid AS $$
    SELECT restaurant_id FROM staff
    WHERE auth_user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is owner of a specific restaurant
CREATE OR REPLACE FUNCTION is_restaurant_owner(p_restaurant_id uuid)
RETURNS boolean AS $$
    SELECT EXISTS (
        SELECT 1 FROM staff
        WHERE auth_user_id = auth.uid()
          AND restaurant_id = p_restaurant_id
          AND role = 'owner'
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check if user is member (any role) of a specific restaurant
CREATE OR REPLACE FUNCTION is_restaurant_member(p_restaurant_id uuid)
RETURNS boolean AS $$
    SELECT EXISTS (
        SELECT 1 FROM staff
        WHERE auth_user_id = auth.uid()
          AND restaurant_id = p_restaurant_id
    );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ---------------------------------------------------------------------------
-- 6. Row Level Security
-- ---------------------------------------------------------------------------

-- ---- RESTAURANT ----
ALTER TABLE restaurant ENABLE ROW LEVEL SECURITY;

-- Owner can do everything
CREATE POLICY restaurant_owner_all ON restaurant
    FOR ALL
    USING (is_restaurant_owner(id))
    WITH CHECK (is_restaurant_owner(id));

-- Staff can read their own restaurant
CREATE POLICY restaurant_staff_select ON restaurant
    FOR SELECT
    USING (is_restaurant_member(id));

-- ---- STAFF ----
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;

-- Owner of the restaurant can CRUD all staff in their restaurant
CREATE POLICY staff_owner_all ON staff
    FOR ALL
    USING (is_restaurant_owner(restaurant_id))
    WITH CHECK (is_restaurant_owner(restaurant_id));

-- Staff can read other staff in their restaurant
CREATE POLICY staff_member_select ON staff
    FOR SELECT
    USING (is_restaurant_member(restaurant_id));

-- Staff can update their own record (name, phone, avatar, iban)
CREATE POLICY staff_self_update ON staff
    FOR UPDATE
    USING (auth_user_id = auth.uid())
    WITH CHECK (auth_user_id = auth.uid());

-- ---- TIP ----
ALTER TABLE tip ENABLE ROW LEVEL SECURITY;

-- Anyone can insert tips (customers paying via public QR page)
CREATE POLICY tip_public_insert ON tip
    FOR INSERT
    WITH CHECK (true);

-- Restaurant members can read their tips
CREATE POLICY tip_member_select ON tip
    FOR SELECT
    USING (is_restaurant_member(restaurant_id));

-- Owner can update tip status
CREATE POLICY tip_owner_update ON tip
    FOR UPDATE
    USING (is_restaurant_owner(restaurant_id))
    WITH CHECK (is_restaurant_owner(restaurant_id));

-- ---- DISTRIBUTION ----
ALTER TABLE distribution ENABLE ROW LEVEL SECURITY;

-- Owner can create and manage distributions
CREATE POLICY distribution_owner_all ON distribution
    FOR ALL
    USING (is_restaurant_owner(restaurant_id))
    WITH CHECK (is_restaurant_owner(restaurant_id));

-- Members can read distributions
CREATE POLICY distribution_member_select ON distribution
    FOR SELECT
    USING (is_restaurant_member(restaurant_id));

-- ---- PAYOUT ----
ALTER TABLE payout ENABLE ROW LEVEL SECURITY;

-- Owner can create and manage payouts (via distribution's restaurant_id)
CREATE POLICY payout_owner_all ON payout
    FOR ALL
    USING (
        is_restaurant_owner(
            (SELECT restaurant_id FROM distribution WHERE id = payout.distribution_id)
        )
    )
    WITH CHECK (
        is_restaurant_owner(
            (SELECT restaurant_id FROM distribution WHERE id = payout.distribution_id)
        )
    );

-- Members can read payouts belonging to their restaurant
CREATE POLICY payout_member_select ON payout
    FOR SELECT
    USING (
        is_restaurant_member(
            (SELECT restaurant_id FROM distribution WHERE id = payout.distribution_id)
        )
    );

-- Staff can read their own payouts
CREATE POLICY payout_self_select ON payout
    FOR SELECT
    USING (staff_id = get_my_staff_id());

-- ---- INVITE_CODE ----
ALTER TABLE invite_code ENABLE ROW LEVEL SECURITY;

-- Owner can CRUD invite codes
CREATE POLICY invite_code_owner_all ON invite_code
    FOR ALL
    USING (is_restaurant_owner(restaurant_id))
    WITH CHECK (is_restaurant_owner(restaurant_id));

-- Public can read invite codes (for registration validation)
CREATE POLICY invite_code_public_select ON invite_code
    FOR SELECT
    USING (true);

-- ---- QR_CODE ----
ALTER TABLE qr_code ENABLE ROW LEVEL SECURITY;

-- Owner can CRUD QR codes
CREATE POLICY qr_code_owner_all ON qr_code
    FOR ALL
    USING (is_restaurant_owner(restaurant_id))
    WITH CHECK (is_restaurant_owner(restaurant_id));

-- Public can read QR codes (QR pages are public)
CREATE POLICY qr_code_public_select ON qr_code
    FOR SELECT
    USING (true);

-- ---------------------------------------------------------------------------
-- 7. Demo seed data
-- ---------------------------------------------------------------------------
DO $$
DECLARE
    v_restaurant_id uuid;
    v_owner_id      uuid;
    v_waiter_id     uuid;
BEGIN
    -- Insert restaurant
    INSERT INTO restaurant (name, slug, logo_emoji, theme_color)
    VALUES ('La Tasca de María', 'la-tasca-de-maria', '🍷', '#D4533B')
    RETURNING id INTO v_restaurant_id;

    -- Insert owner
    INSERT INTO staff (restaurant_id, name, email, phone, role, avatar_emoji)
    VALUES (v_restaurant_id, 'María García', 'maria@latasca.es', '+34600111222', 'owner', '👩‍🍳')
    RETURNING id INTO v_owner_id;

    -- Set owner_id on restaurant
    UPDATE restaurant SET owner_id = v_owner_id WHERE id = v_restaurant_id;

    -- Insert waiter
    INSERT INTO staff (restaurant_id, name, email, phone, role, avatar_emoji)
    VALUES (v_restaurant_id, 'Carlos López', 'carlos@latasca.es', '+34600333444', 'waiter', '🧑‍🍳')
    RETURNING id INTO v_waiter_id;

    -- Insert 5 sample tips
    INSERT INTO tip (restaurant_id, amount_cents, status, customer_session, created_at)
    VALUES
        (v_restaurant_id, 300,  'completed', 'sess_001', now() - interval '6 days'),
        (v_restaurant_id, 500,  'completed', 'sess_002', now() - interval '5 days'),
        (v_restaurant_id, 200,  'completed', 'sess_003', now() - interval '3 days'),
        (v_restaurant_id, 1000, 'completed', 'sess_004', now() - interval '1 day'),
        (v_restaurant_id, 400,  'pending',   'sess_005', now());

    -- Insert 2 QR codes
    INSERT INTO qr_code (restaurant_id, table_label, url)
    VALUES
        (v_restaurant_id, 'Mesa 1', 'https://mipropina.es/t/la-tasca-de-maria?mesa=1'),
        (v_restaurant_id, 'Mesa 2', 'https://mipropina.es/t/la-tasca-de-maria?mesa=2');

    RAISE NOTICE 'Demo seed complete: restaurant=%, owner=%, waiter=%',
        v_restaurant_id, v_owner_id, v_waiter_id;
END $$;
