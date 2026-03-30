-- Add 'refunded' value to tip_status_enum
ALTER TYPE tip_status_enum ADD VALUE IF NOT EXISTS 'refunded';
