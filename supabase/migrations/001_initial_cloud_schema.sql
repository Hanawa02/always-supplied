-- Initial cloud storage schema for Always Supplied
-- This migration creates the tables needed for cloud sync and collaboration

-- Enable Row Level Security
ALTER DATABASE postgres SET row_security = on;

-- Create cloud_buildings table (synced version of supplied buildings)
CREATE TABLE cloud_buildings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    local_id TEXT, -- Reference to local IndexedDB ID for migration
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    synced_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create cloud_supply_items table (synced version of supply items)
CREATE TABLE cloud_supply_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID REFERENCES cloud_buildings(id) ON DELETE CASCADE NOT NULL,
    local_id TEXT, -- Reference to local IndexedDB ID for migration
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    category TEXT,
    storage_room TEXT,
    shopping_hint TEXT,
    preferred_brands TEXT[], -- Array of brand names
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    synced_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create cloud_buying_items table (synced version of buying items)
CREATE TABLE cloud_buying_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID REFERENCES cloud_buildings(id) ON DELETE CASCADE NOT NULL,
    supply_item_id UUID REFERENCES cloud_supply_items(id) ON DELETE SET NULL,
    local_id TEXT, -- Reference to local IndexedDB ID for migration
    name TEXT NOT NULL,
    description TEXT,
    quantity INTEGER NOT NULL DEFAULT 1,
    category TEXT,
    storage_room TEXT,
    shopping_hint TEXT,
    preferred_brands TEXT[], -- Array of brand names
    notes TEXT,
    is_bought BOOLEAN DEFAULT FALSE NOT NULL,
    added_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    bought_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    synced_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create building_members table (manages who can access buildings)
CREATE TABLE building_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID REFERENCES cloud_buildings(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'member')) DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    invited_by UUID REFERENCES auth.users(id),

    -- Ensure one user can only have one role per building
    UNIQUE(building_id, user_id)
);

-- Create building_shares table (manages share codes for buildings)
CREATE TABLE building_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    building_id UUID REFERENCES cloud_buildings(id) ON DELETE CASCADE NOT NULL,
    share_code TEXT NOT NULL UNIQUE,
    created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    expires_at TIMESTAMPTZ,
    max_uses INTEGER DEFAULT NULL, -- NULL means unlimited
    used_count INTEGER DEFAULT 0 NOT NULL,
    is_active BOOLEAN DEFAULT TRUE NOT NULL
);

-- Create user_profiles table (extends auth.users with additional info)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    preferred_locale TEXT DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create sync_queue table (for offline change tracking)
CREATE TABLE sync_queue (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    table_name TEXT NOT NULL,
    record_id UUID NOT NULL,
    operation TEXT NOT NULL CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')),
    data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    processed_at TIMESTAMPTZ,
    error TEXT
);

-- Create indexes for better performance
CREATE INDEX idx_cloud_buildings_owner_id ON cloud_buildings(owner_id);
CREATE INDEX idx_cloud_buildings_created_at ON cloud_buildings(created_at);
CREATE INDEX idx_cloud_buildings_updated_at ON cloud_buildings(updated_at);

CREATE INDEX idx_cloud_supply_items_building_id ON cloud_supply_items(building_id);
CREATE INDEX idx_cloud_supply_items_category ON cloud_supply_items(category);
CREATE INDEX idx_cloud_supply_items_updated_at ON cloud_supply_items(updated_at);

CREATE INDEX idx_cloud_buying_items_building_id ON cloud_buying_items(building_id);
CREATE INDEX idx_cloud_buying_items_supply_item_id ON cloud_buying_items(supply_item_id);
CREATE INDEX idx_cloud_buying_items_is_bought ON cloud_buying_items(is_bought);
CREATE INDEX idx_cloud_buying_items_updated_at ON cloud_buying_items(updated_at);

CREATE INDEX idx_building_members_building_id ON building_members(building_id);
CREATE INDEX idx_building_members_user_id ON building_members(user_id);
CREATE INDEX idx_building_members_role ON building_members(role);

CREATE INDEX idx_building_shares_share_code ON building_shares(share_code);
CREATE INDEX idx_building_shares_building_id ON building_shares(building_id);
CREATE INDEX idx_building_shares_is_active ON building_shares(is_active);

CREATE INDEX idx_sync_queue_user_id ON sync_queue(user_id);
CREATE INDEX idx_sync_queue_processed_at ON sync_queue(processed_at);

-- Enable Row Level Security on all tables
ALTER TABLE cloud_buildings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_supply_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE cloud_buying_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE building_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE building_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE sync_queue ENABLE ROW LEVEL SECURITY;