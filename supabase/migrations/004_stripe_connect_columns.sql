-- ============================================================================
-- Migration 004: Stripe Connect status columns
-- Adds stripe_charges_enabled / stripe_payouts_enabled to restaurant and staff
-- These are written by the account.updated webhook event
-- ============================================================================

ALTER TABLE restaurant
  ADD COLUMN IF NOT EXISTS stripe_charges_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS stripe_payouts_enabled  boolean NOT NULL DEFAULT false;

ALTER TABLE staff
  ADD COLUMN IF NOT EXISTS stripe_payouts_enabled boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN restaurant.stripe_charges_enabled IS 'Set by Stripe account.updated webhook — true when the connected account can accept charges';
COMMENT ON COLUMN restaurant.stripe_payouts_enabled  IS 'Set by Stripe account.updated webhook — true when the connected account can receive payouts';
COMMENT ON COLUMN staff.stripe_payouts_enabled        IS 'Set by Stripe account.updated webhook — true when the waiter Connect account can receive transfers';
