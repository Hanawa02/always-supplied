-- Migration to align cloud database schema with local types
-- This addresses naming mismatches and missing fields identified in the analysis

-- Add missing fields to cloud_supply_items
ALTER TABLE cloud_supply_items
ADD COLUMN IF NOT EXISTS current_stock INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS minimum_stock INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_updated TIMESTAMPTZ DEFAULT NOW();

-- Update cloud_buying_items to match local BuyingItem type
ALTER TABLE cloud_buying_items
ADD COLUMN IF NOT EXISTS urgency TEXT DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
ADD COLUMN IF NOT EXISTS is_purchased BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS purchased_date TIMESTAMPTZ;

-- Rename is_bought to match local convention (keeping both for compatibility during migration)
ALTER TABLE cloud_buying_items
ADD COLUMN IF NOT EXISTS is_bought BOOLEAN GENERATED ALWAYS AS (is_purchased) STORED;

-- Add missing indexes for new fields
CREATE INDEX IF NOT EXISTS idx_cloud_supply_items_current_stock ON cloud_supply_items(current_stock);
CREATE INDEX IF NOT EXISTS idx_cloud_supply_items_minimum_stock ON cloud_supply_items(minimum_stock);
CREATE INDEX IF NOT EXISTS idx_cloud_supply_items_last_updated ON cloud_supply_items(last_updated);

CREATE INDEX IF NOT EXISTS idx_cloud_buying_items_urgency ON cloud_buying_items(urgency);
CREATE INDEX IF NOT EXISTS idx_cloud_buying_items_is_purchased ON cloud_buying_items(is_purchased);
CREATE INDEX IF NOT EXISTS idx_cloud_buying_items_purchased_date ON cloud_buying_items(purchased_date);

-- Add location field to cloud_buildings (was missing)
ALTER TABLE cloud_buildings
ADD COLUMN IF NOT EXISTS location TEXT;

-- Update RLS policies to account for new fields
-- (Existing policies should still work, but we may need to update them later)

-- Add a migration tracking table to help with type mapping
CREATE TABLE IF NOT EXISTS schema_migrations (
    version TEXT PRIMARY KEY,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    description TEXT
);

INSERT INTO schema_migrations (version, description)
VALUES ('003', 'Align cloud schema with local types - add missing fields')
ON CONFLICT (version) DO NOTHING;

-- Add helpful comments for developers
COMMENT ON COLUMN cloud_supply_items.current_stock IS 'Maps to SupplyItem.quantity in local types';
COMMENT ON COLUMN cloud_supply_items.minimum_stock IS 'Threshold for low stock alerts';
COMMENT ON COLUMN cloud_supply_items.last_updated IS 'Maps to SupplyItem.updatedAt in local types';

COMMENT ON COLUMN cloud_buying_items.urgency IS 'Shopping priority: low, medium, high';
COMMENT ON COLUMN cloud_buying_items.is_purchased IS 'Maps to BuyingItem.isBought in local types';
COMMENT ON COLUMN cloud_buying_items.purchased_date IS 'Maps to BuyingItem.boughtAt in local types';

COMMENT ON COLUMN cloud_buildings.location IS 'Building location/address';