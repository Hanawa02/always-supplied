# Fix for Google OAuth Database Error

## Problem

When attempting to sign up with Google OAuth, users receive the following error:
```
error=server_error
error_code=unexpected_failure
error_description=Database+error+saving+new+user
```

## Root Cause

The database trigger `create_user_profile_trigger` that automatically creates user profiles after signup was expecting a `full_name` field in the user metadata, but the application was updated to use `username` instead. This mismatch caused the trigger to fail when creating profiles for OAuth users.

## Solution

Two migration files have been created to fix this issue:

1. `004_fix_user_profile_trigger.sql` - Updates the trigger function to handle both `username` and `full_name` fields
2. `005_improve_user_profile_error_handling.sql` - Adds comprehensive error logging and better error handling

## Steps to Apply the Fix

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to "SQL Editor" in the left sidebar
3. Click "New query"
4. Copy and paste the contents of `supabase/migrations/004_fix_user_profile_trigger.sql`
5. Click "Run" to execute the migration
6. Repeat steps 3-5 for `supabase/migrations/005_improve_user_profile_error_handling.sql`
7. Test Google OAuth signup again

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed and configured:

```bash
# Apply the migrations
npx supabase db push

# Or if you have supabase installed globally
supabase db push
```

### Option 3: Manual SQL Execution

Connect to your Supabase database and run both migration files in order:
1. First run `004_fix_user_profile_trigger.sql`
2. Then run `005_improve_user_profile_error_handling.sql`

## Verification

After applying the migrations:

1. Try signing up with Google OAuth
2. Check if the user profile is created successfully
3. If issues persist, check the `auth_event_logs` table for debugging information:

```sql
-- View recent auth events
SELECT * FROM auth_event_logs
ORDER BY created_at DESC
LIMIT 20;

-- View errors only
SELECT * FROM auth_event_logs
WHERE error_message IS NOT NULL
ORDER BY created_at DESC;
```

## What Changed

### The Updated Trigger Function

The `create_user_profile()` function now:
- Checks for both `username` and `full_name` in user metadata
- Uses `ON CONFLICT DO UPDATE` to handle existing profiles
- Includes comprehensive error logging
- Falls back to email username if no name is provided

### Error Handling Improvements

- Added `auth_event_logs` table for debugging authentication issues
- Logs all signup attempts, successes, and failures
- Provides detailed error messages for troubleshooting

## Prevention

To prevent similar issues in the future:
1. Always update database triggers when changing authentication metadata structure
2. Test OAuth flows after any authentication-related changes
3. Monitor the `auth_event_logs` table for authentication issues
4. Keep database migrations in sync with application code changes

## Rollback (if needed)

If you need to rollback these changes:

```sql
-- Rollback to original trigger function
DROP TRIGGER IF EXISTS create_user_profile_trigger ON auth.users;

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

CREATE TRIGGER create_user_profile_trigger AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_profile();

-- Remove auth_event_logs table if desired
DROP TABLE IF EXISTS auth_event_logs CASCADE;
```