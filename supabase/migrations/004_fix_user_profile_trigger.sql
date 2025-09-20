-- Fix user profile trigger to handle username instead of full_name
-- This migration updates the create_user_profile function to properly handle
-- both username and full_name fields in user metadata

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;

-- Update the function to handle username
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if profile already exists (in case of OAuth where we create it manually)
    IF EXISTS (SELECT 1 FROM user_profiles WHERE id = NEW.id) THEN
        RETURN NEW;
    END IF;

    INSERT INTO user_profiles (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(
            NEW.raw_user_meta_data->>'username',
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            split_part(NEW.email, '@', 1)
        ),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;  -- Prevent errors if profile already exists
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER create_user_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();