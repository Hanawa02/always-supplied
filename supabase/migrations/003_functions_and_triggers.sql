-- Functions and Triggers for Always Supplied
-- These handle automatic operations like timestamp updates and share code generation

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Function to generate share codes (6 characters: uppercase letters and digits)
CREATE OR REPLACE FUNCTION generate_share_code()
RETURNS TEXT AS $$
DECLARE
    characters TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
BEGIN
    FOR i IN 1..6 LOOP
        result := result || substr(characters, floor(random() * length(characters) + 1)::integer, 1);
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique share code
CREATE OR REPLACE FUNCTION generate_unique_share_code()
RETURNS TEXT AS $$
DECLARE
    new_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        new_code := generate_share_code();
        SELECT EXISTS(SELECT 1 FROM building_shares WHERE share_code = new_code) INTO code_exists;
        EXIT WHEN NOT code_exists;
    END LOOP;
    RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically create owner membership when building is created
CREATE OR REPLACE FUNCTION create_owner_membership()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO building_members (building_id, user_id, role, invited_by)
    VALUES (NEW.id, NEW.owner_id, 'owner', NEW.owner_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to create user profile when user signs up
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (id, email, full_name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to validate share code usage
CREATE OR REPLACE FUNCTION validate_and_use_share_code(code TEXT, joining_user_id UUID)
RETURNS UUID AS $$
DECLARE
    share_record RECORD;
    building_uuid UUID;
BEGIN
    -- Get the share record
    SELECT * INTO share_record
    FROM building_shares
    WHERE share_code = code
    AND is_active = true
    AND (expires_at IS NULL OR expires_at > NOW())
    AND (max_uses IS NULL OR used_count < max_uses);

    -- Check if share code exists and is valid
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Invalid or expired share code';
    END IF;

    building_uuid := share_record.building_id;

    -- Check if user is already a member
    IF EXISTS (
        SELECT 1 FROM building_members
        WHERE building_id = building_uuid
        AND user_id = joining_user_id
    ) THEN
        RAISE EXCEPTION 'User is already a member of this building';
    END IF;

    -- Add user as member
    INSERT INTO building_members (building_id, user_id, role, invited_by)
    VALUES (building_uuid, joining_user_id, 'member', share_record.created_by);

    -- Increment usage count
    UPDATE building_shares
    SET used_count = used_count + 1
    WHERE id = share_record.id;

    -- Deactivate if max uses reached
    IF share_record.max_uses IS NOT NULL AND (share_record.used_count + 1) >= share_record.max_uses THEN
        UPDATE building_shares
        SET is_active = false
        WHERE id = share_record.id;
    END IF;

    RETURN building_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to transfer building ownership
CREATE OR REPLACE FUNCTION transfer_building_ownership(
    p_building_id UUID,
    p_current_owner_id UUID,
    p_new_owner_id UUID,
    p_current_owner_becomes_member BOOLEAN DEFAULT true
)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verify current owner
    IF NOT EXISTS (
        SELECT 1 FROM cloud_buildings
        WHERE id = p_building_id AND owner_id = p_current_owner_id
    ) THEN
        RAISE EXCEPTION 'Only the current owner can transfer ownership';
    END IF;

    -- Verify new owner is a member
    IF NOT EXISTS (
        SELECT 1 FROM building_members
        WHERE building_id = p_building_id AND user_id = p_new_owner_id
    ) THEN
        RAISE EXCEPTION 'New owner must be a member of the building';
    END IF;

    -- Start transaction
    BEGIN
        -- Update building owner
        UPDATE cloud_buildings
        SET owner_id = p_new_owner_id, updated_at = NOW()
        WHERE id = p_building_id;

        -- Update new owner's membership to owner role
        UPDATE building_members
        SET role = 'owner'
        WHERE building_id = p_building_id AND user_id = p_new_owner_id;

        -- Handle current owner's membership
        IF p_current_owner_becomes_member THEN
            -- Update current owner to member role
            UPDATE building_members
            SET role = 'member'
            WHERE building_id = p_building_id AND user_id = p_current_owner_id;
        ELSE
            -- Remove current owner from members
            DELETE FROM building_members
            WHERE building_id = p_building_id AND user_id = p_current_owner_id;
        END IF;

        RETURN true;
    EXCEPTION WHEN OTHERS THEN
        RAISE;
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_cloud_buildings_updated_at BEFORE UPDATE ON cloud_buildings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cloud_supply_items_updated_at BEFORE UPDATE ON cloud_supply_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cloud_buying_items_updated_at BEFORE UPDATE ON cloud_buying_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create trigger for automatic owner membership
CREATE TRIGGER create_building_owner_membership AFTER INSERT ON cloud_buildings
    FOR EACH ROW EXECUTE FUNCTION create_owner_membership();

-- Create trigger for automatic user profile creation
CREATE TRIGGER create_user_profile_trigger AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Create trigger to auto-generate share codes
CREATE OR REPLACE FUNCTION set_share_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.share_code IS NULL OR NEW.share_code = '' THEN
        NEW.share_code = generate_unique_share_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_building_share_code BEFORE INSERT ON building_shares
    FOR EACH ROW EXECUTE FUNCTION set_share_code();