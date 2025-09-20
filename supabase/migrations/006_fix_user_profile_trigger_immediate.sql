-- IMMEDIATE FIX: Update user profile trigger to work without auth_event_logs table
-- This fixes the signup issue immediately while the logging table can be added later

-- Drop the existing trigger first
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;

-- Create a simpler, more robust version of the function
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
DECLARE
    v_username TEXT;
    v_avatar_url TEXT;
BEGIN
    -- Check if profile already exists
    IF EXISTS (SELECT 1 FROM user_profiles WHERE id = NEW.id) THEN
        RETURN NEW;
    END IF;

    -- Extract username/name with fallback
    v_username := COALESCE(
        NEW.raw_user_meta_data->>'username',
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        split_part(NEW.email, '@', 1)
    );

    -- Extract avatar URL if available
    v_avatar_url := NEW.raw_user_meta_data->>'avatar_url';

    -- Create the profile with conflict handling
    INSERT INTO user_profiles (id, email, full_name, avatar_url, preferred_locale)
    VALUES (
        NEW.id,
        NEW.email,
        v_username,
        v_avatar_url,
        COALESCE(NEW.raw_user_meta_data->>'locale', 'en')
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
        avatar_url = COALESCE(EXCLUDED.avatar_url, user_profiles.avatar_url),
        updated_at = NOW();

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- If there's any error, just log it and continue
    -- This prevents the signup from failing
    RAISE WARNING 'Failed to create user profile for %: %', NEW.email, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger
CREATE TRIGGER create_user_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();