-- ============================================================================
-- Migration 011: email + password auth on top of the magic-link invite
-- - Adds password_hash, email_verified_at, verification + password-reset tokens
-- - Makes email mandatory and globally unique (case-insensitive)
-- ============================================================================

BEGIN;

ALTER TABLE staff
    ADD COLUMN IF NOT EXISTS password_hash text,
    ADD COLUMN IF NOT EXISTS email_verified_at timestamptz,
    ADD COLUMN IF NOT EXISTS verification_token text,
    ADD COLUMN IF NOT EXISTS verification_expires_at timestamptz,
    ADD COLUMN IF NOT EXISTS password_reset_token text,
    ADD COLUMN IF NOT EXISTS password_reset_expires_at timestamptz;

-- Tokens are random, opaque, and must be globally unique
CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_verification_token
    ON staff(verification_token)
    WHERE verification_token IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_password_reset_token
    ON staff(password_reset_token)
    WHERE password_reset_token IS NOT NULL;

-- email is now mandatory at insert time; the invite-accept handler collects it.
ALTER TABLE staff ALTER COLUMN email SET NOT NULL;

-- Case-insensitive uniqueness across all staff (one phone = one email = one
-- staff record globally, per the product decision).
CREATE UNIQUE INDEX IF NOT EXISTS idx_staff_email_lower_unique
    ON staff(LOWER(email));

COMMENT ON COLUMN staff.password_hash IS 'scrypt$salt$key — set when the user accepts the invite.';
COMMENT ON COLUMN staff.email_verified_at IS 'NULL until the user clicks the verification link.';
COMMENT ON COLUMN staff.verification_token IS 'One-time token sent in the verification email.';
COMMENT ON COLUMN staff.password_reset_token IS 'One-time token for password reset flow.';

COMMIT;
