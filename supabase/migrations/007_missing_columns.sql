-- ============================================================================
-- Migration 007: Missing restaurant columns
-- logo_url and google_maps_url were added to production via Management API
-- This migration documents them and ensures reproducibility in new environments
-- ============================================================================

ALTER TABLE restaurant
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS google_maps_url text;

COMMENT ON COLUMN restaurant.logo_url IS 'URL of uploaded restaurant logo (stored in Supabase Storage, bucket: logos)';
COMMENT ON COLUMN restaurant.google_maps_url IS 'Google Maps review link shown on tip success page to prompt customer reviews';
