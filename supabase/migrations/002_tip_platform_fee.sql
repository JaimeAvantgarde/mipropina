-- Add platform_fee_cents column to tip table
-- Stores the platform commission per tip (deducted before distribution)
-- < 3.50€ tip → 50 cents, >= 3.50€ tip → 15%
ALTER TABLE tip ADD COLUMN IF NOT EXISTS platform_fee_cents integer NOT NULL DEFAULT 0;
