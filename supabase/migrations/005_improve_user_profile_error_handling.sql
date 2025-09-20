-- Improve user profile creation with better error handling and logging
-- This helps diagnose issues with OAuth signup

-- Create a table to log authentication events for debugging
CREATE TABLE IF NOT EXISTS auth_event_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type TEXT NOT NULL,
    user_id UUID,
    user_email TEXT,
    metadata JSONB,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on auth_event_logs
ALTER TABLE auth_event_logs ENABLE ROW LEVEL SECURITY;

-- Only superusers can read logs
CREATE POLICY "Only superusers can read auth logs" ON auth_event_logs
    FOR SELECT
    USING (auth.jwt()->>'role' = 'service_role');

-- Update the create_user_profile function with better error handling
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
DECLARE
    v_username TEXT;
    v_avatar_url TEXT;
    v_error_message TEXT;
BEGIN
    -- Log the signup attempt
    INSERT INTO auth_event_logs (event_type, user_id, user_email, metadata)
    VALUES ('user_signup_attempt', NEW.id, NEW.email, NEW.raw_user_meta_data);

    -- Check if profile already exists
    IF EXISTS (SELECT 1 FROM user_profiles WHERE id = NEW.id) THEN
        -- Log that profile already exists
        INSERT INTO auth_event_logs (event_type, user_id, user_email, metadata)
        VALUES ('user_profile_exists', NEW.id, NEW.email, jsonb_build_object('message', 'Profile already exists'));
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

    -- Try to create the profile
    BEGIN
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

        -- Log successful profile creation
        INSERT INTO auth_event_logs (event_type, user_id, user_email, metadata)
        VALUES ('user_profile_created', NEW.id, NEW.email, jsonb_build_object(
            'username', v_username,
            'avatar_url', v_avatar_url
        ));

    EXCEPTION WHEN OTHERS THEN
        -- Get the error message
        GET STACKED DIAGNOSTICS v_error_message = MESSAGE_TEXT;

        -- Log the error
        INSERT INTO auth_event_logs (event_type, user_id, user_email, error_message, metadata)
        VALUES ('user_profile_creation_error', NEW.id, NEW.email, v_error_message, jsonb_build_object(
            'username', v_username,
            'avatar_url', v_avatar_url,
            'raw_meta_data', NEW.raw_user_meta_data
        ));

        -- Re-raise the exception to prevent user creation
        RAISE EXCEPTION 'Failed to create user profile: %', v_error_message;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop and recreate the trigger to ensure it's properly attached
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;

CREATE TRIGGER create_user_profile_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();

-- Add an index on user_profiles.email for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);

-- Add an index on auth_event_logs for debugging
CREATE INDEX IF NOT EXISTS idx_auth_event_logs_created_at ON auth_event_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_auth_event_logs_user_id ON auth_event_logs(user_id);