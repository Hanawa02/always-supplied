-- Row Level Security Policies for Always Supplied
-- These policies control access to data based on user authentication and building membership

-- User Profiles Policies
-- Users can read and update their own profile
CREATE POLICY "Users can view own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON user_profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Cloud Buildings Policies
-- Users can see buildings they own or are members of
CREATE POLICY "Users can view accessible buildings" ON cloud_buildings
    FOR SELECT USING (
        auth.uid() = owner_id OR
        EXISTS (
            SELECT 1 FROM building_members
            WHERE building_id = cloud_buildings.id
            AND user_id = auth.uid()
        )
    );

-- Only owners can update building details
CREATE POLICY "Only owners can update buildings" ON cloud_buildings
    FOR UPDATE USING (auth.uid() = owner_id);

-- Users can insert buildings (they become the owner)
CREATE POLICY "Users can create buildings" ON cloud_buildings
    FOR INSERT WITH CHECK (auth.uid() = owner_id);

-- Only owners can delete buildings
CREATE POLICY "Only owners can delete buildings" ON cloud_buildings
    FOR DELETE USING (auth.uid() = owner_id);

-- Cloud Supply Items Policies
-- Users can see supply items for buildings they have access to
CREATE POLICY "Users can view accessible supply items" ON cloud_supply_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cloud_buildings cb
            LEFT JOIN building_members bm ON cb.id = bm.building_id
            WHERE cb.id = cloud_supply_items.building_id
            AND (cb.owner_id = auth.uid() OR bm.user_id = auth.uid())
        )
    );

-- Members and owners can modify supply items
CREATE POLICY "Building members can modify supply items" ON cloud_supply_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM cloud_buildings cb
            LEFT JOIN building_members bm ON cb.id = bm.building_id
            WHERE cb.id = cloud_supply_items.building_id
            AND (cb.owner_id = auth.uid() OR bm.user_id = auth.uid())
        )
    );

-- Cloud Buying Items Policies
-- Users can see buying items for buildings they have access to
CREATE POLICY "Users can view accessible buying items" ON cloud_buying_items
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cloud_buildings cb
            LEFT JOIN building_members bm ON cb.id = bm.building_id
            WHERE cb.id = cloud_buying_items.building_id
            AND (cb.owner_id = auth.uid() OR bm.user_id = auth.uid())
        )
    );

-- Members and owners can modify buying items
CREATE POLICY "Building members can modify buying items" ON cloud_buying_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM cloud_buildings cb
            LEFT JOIN building_members bm ON cb.id = bm.building_id
            WHERE cb.id = cloud_buying_items.building_id
            AND (cb.owner_id = auth.uid() OR bm.user_id = auth.uid())
        )
    );

-- Building Members Policies
-- Users can see members of buildings they have access to
CREATE POLICY "Users can view building members" ON building_members
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM cloud_buildings cb
            LEFT JOIN building_members bm ON cb.id = bm.building_id
            WHERE cb.id = building_members.building_id
            AND (cb.owner_id = auth.uid() OR bm.user_id = auth.uid())
        )
    );

-- Only owners can add/remove members
CREATE POLICY "Only owners can manage members" ON building_members
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM cloud_buildings cb
            WHERE cb.id = building_members.building_id
            AND cb.owner_id = auth.uid()
        )
    );

-- Users can remove themselves from buildings
CREATE POLICY "Users can leave buildings" ON building_members
    FOR DELETE USING (user_id = auth.uid());

-- Building Shares Policies
-- Users can see shares for buildings they own or are members of
CREATE POLICY "Users can view building shares" ON building_shares
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM cloud_buildings cb
            LEFT JOIN building_members bm ON cb.id = bm.building_id
            WHERE cb.id = building_shares.building_id
            AND (cb.owner_id = auth.uid() OR bm.user_id = auth.uid())
        )
    );

-- Only owners can create/manage shares
CREATE POLICY "Only owners can manage shares" ON building_shares
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM cloud_buildings cb
            WHERE cb.id = building_shares.building_id
            AND cb.owner_id = auth.uid()
        )
    );

-- Special policy for joining via share code (public read for active codes)
CREATE POLICY "Anyone can view active share codes for joining" ON building_shares
    FOR SELECT USING (is_active = true AND (expires_at IS NULL OR expires_at > NOW()));

-- Sync Queue Policies
-- Users can only see and modify their own sync queue
CREATE POLICY "Users can manage own sync queue" ON sync_queue
    FOR ALL USING (auth.uid() = user_id);