-- ============================================================================
-- Migration 005: Restaurant feature columns
-- Adds: tip_amounts, custom_amount_enabled, thank_you_message,
--       email_notifications_enabled, notification_email
-- ============================================================================

-- Configurable tip amounts (array of cents)
ALTER TABLE restaurant
  ADD COLUMN IF NOT EXISTS tip_amounts integer[] NOT NULL
    DEFAULT ARRAY[100, 200, 300, 500],
  ADD COLUMN IF NOT EXISTS custom_amount_enabled boolean NOT NULL DEFAULT true;

-- Custom thank-you message shown on success page
ALTER TABLE restaurant
  ADD COLUMN IF NOT EXISTS thank_you_message text
    DEFAULT '¡Gracias por tu propina! El equipo lo agradece mucho.';

-- Email notifications settings
ALTER TABLE restaurant
  ADD COLUMN IF NOT EXISTS email_notifications_enabled boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS notification_email text;  -- null = use owner's auth email

COMMENT ON COLUMN restaurant.tip_amounts               IS 'Quick-select tip amounts in cents (e.g. [100,200,300,500])';
COMMENT ON COLUMN restaurant.custom_amount_enabled     IS 'Show custom amount input on tipping page';
COMMENT ON COLUMN restaurant.thank_you_message         IS 'Shown on /t/[slug]/success — max 300 chars';
COMMENT ON COLUMN restaurant.email_notifications_enabled IS 'Send email to owner on new tip';
COMMENT ON COLUMN restaurant.notification_email        IS 'Override email for notifications; null = owner auth email';
