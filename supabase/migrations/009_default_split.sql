-- ============================================================================
-- Migration 009: Default tip split configuration
-- Lets each restaurant define a persistent default split so waiters can preview
-- their estimated share of the current tip pot before the owner runs a payout.
-- ============================================================================

ALTER TABLE restaurant
    ADD COLUMN IF NOT EXISTS split_includes_owner BOOLEAN NOT NULL DEFAULT false;

COMMENT ON COLUMN restaurant.split_includes_owner IS
    'When true, the owner is included in the default equal/custom split alongside waiters.';

ALTER TABLE staff
    ADD COLUMN IF NOT EXISTS default_share_pct NUMERIC(5,2);

COMMENT ON COLUMN staff.default_share_pct IS
    'Persistent percentage of the tip pot this staff receives by default. NULL means use equal split.';

-- Constrain to [0, 100]. NULL stays valid (meaning: no custom share configured).
ALTER TABLE staff
    DROP CONSTRAINT IF EXISTS staff_default_share_pct_range;

ALTER TABLE staff
    ADD CONSTRAINT staff_default_share_pct_range
    CHECK (default_share_pct IS NULL OR (default_share_pct >= 0 AND default_share_pct <= 100));
