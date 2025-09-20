# Supabase Setup Instructions

This guide will help you set up Supabase for the Always Supplied application with the latest 2025 API key structure.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `always-supplied`
   - **Database Password**: Choose a strong password (save this securely!)
   - **Region**: Choose closest to your users
   - **Pricing Plan**: Start with Free tier
5. Click "Create new project"
6. Wait for the project to be ready (usually 1-2 minutes)

## 2. Get Project Configuration (New 2025 API Key Structure)

As of September 2025, Supabase has updated their API key format for improved security:

1. Go to your project dashboard
2. Click on "Settings" in the left sidebar
3. Click on "API"
4. Copy the following values:

   **Project URL**:
   ```
   https://[YOUR-PROJECT-REF].supabase.co
   ```

   **New Key Format (Recommended)**:
   - **Publishable Key**: `sb_publishable_[YOUR-KEY]`
     - This is the new format replacing the old `anon` key
     - Safe for client-side use
     - Relies on Row Level Security (RLS)

   - **Service Role Key**: `sb_service_[YOUR-KEY]`
     - Server-side use ONLY
     - Never expose in client code
     - Bypasses RLS with full database access

   **Legacy Format (Being Phased Out)**:
   - You may still see `anon` and `service_role` keys starting with `eyJ...`
   - Both formats work during the transition period
   - Use the new `sb_publishable_` format for new projects

## 3. Configure Environment Variables

1. Create a `.env.local` file in your project root
2. Add the following configuration:

```env
# Supabase Configuration (2025 Format)
VITE_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_[YOUR-KEY]

# If you're still using legacy keys, use this format:
# VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important**: Never commit `.env.local` to version control!

## 4. Setup Google OAuth (Optional but Recommended)

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Make sure billing is enabled (OAuth is free, but billing account is required)

### Step 2: Configure OAuth Consent Screen

1. In the left sidebar, go to **APIs & Services** > **OAuth consent screen**
2. Choose **External** user type (unless you have Google Workspace)
3. Fill in the required fields only:
   - **App name**: Always Supplied
   - **User support email**: Your email
   - **Developer contact information**: Your email
4. Click **Save and Continue**
5. **Scopes**: You can skip this (just click Save and Continue) - Google will use default scopes
6. **Test users**: Optional - add test emails if you want to limit access during development
7. Click **Save and Continue** to finish

Note: The consent screen configuration has been simplified. You don't need to manually add scopes - the basic profile and email scopes are included by default when using OAuth.

### Step 3: Create OAuth 2.0 Credentials

1. Go to **APIs & Services** > **Credentials**
2. Click **+ Create Credentials** > **OAuth client ID**
3. Choose **Web application** as the application type
4. Name it (e.g., "Always Supplied Web")
5. Add **Authorized redirect URIs**:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
   For local development, also add:
   ```
   http://localhost:3000/auth/callback
   ```
6. Click **Create**
7. Copy the **Client ID** and **Client Secret**

### Step 4: Add to Environment Variables

Add the Client ID to your `.env.local`:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

Note: The Client Secret will be added in Supabase dashboard, not in your code.

## 5. Configure Supabase Auth

### Enable Google Provider in Supabase

1. In your Supabase dashboard, go to **Authentication** > **Providers**
2. Find **Google** in the list and click to expand
3. Toggle **Enable Google provider** to ON
4. Fill in the fields:
   - **Client ID**: Paste from Google Cloud Console
   - **Client Secret**: Paste from Google Cloud Console
   - **Authorized Client IDs** (optional): Leave empty for now
5. The **Redirect URL** shown here should match what you added in Google Console:
   ```
   https://[YOUR-PROJECT-REF].supabase.co/auth/v1/callback
   ```
6. Click **Save**

### Configure Email Provider (Already Enabled)

1. Email authentication should be enabled by default
2. Optionally configure:
   - **Enable email confirmations**: Recommended for production
   - **Enable double opt-in**: For extra security
   - Go to **Authentication** > **Email Templates** to customize emails

## 6. Run Database Migrations

The project includes pre-written migrations in the `supabase/migrations` folder. Choose one of these methods:

### Option 1: Using npx (No Installation Required)

This is the simplest method if you're having issues with global installation:

```bash
# Login to Supabase (creates access token)
npx supabase login

# Link your project (get project ref from dashboard URL)
npx supabase link --project-ref [YOUR-PROJECT-REF]

# Push migrations to your database
npx supabase db push
```

### Option 2: Install as Project Dependency

If you prefer to install locally in your project:

```bash
# Install as dev dependency
npm install --save-dev supabase

# Run commands with npx
npx supabase login
npx supabase link --project-ref [YOUR-PROJECT-REF]
npx supabase db push
```

### Option 3: Platform-Specific Installation

For Windows (using Scoop):
```bash
# Add Supabase bucket
scoop bucket add supabase https://github.com/supabase/scoop-bucket.git
# Install Supabase CLI
scoop install supabase
```

For macOS/Linux (using Homebrew):
```bash
brew install supabase/tap/supabase
```

### Option 4: Manual Migration via Dashboard

If CLI methods aren't working, use the Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy and paste the contents of each migration file in order:
   - First: `supabase/migrations/001_initial_cloud_schema.sql`
   - Second: `supabase/migrations/002_rls_policies.sql`
   - Third: `supabase/migrations/003_functions_and_triggers.sql`
5. Run each query by clicking **Run** or pressing `Ctrl+Enter`
6. Verify success - you should see "Success. No rows returned"

### Troubleshooting Migration Issues

**"command not found" after global install:**
- Use `npx supabase` instead of just `supabase`
- Or install as a project dependency

**"Permission denied" errors:**
- On Windows, run terminal as Administrator
- On macOS/Linux, you may need `sudo` for global installs (not recommended)

**"Docker not found" errors:**
- The Supabase CLI uses Docker for local development
- For cloud migrations only, Docker is not required
- Use the dashboard method if you don't have Docker

## 7. Enable Row Level Security (RLS)

RLS should be automatically enabled by the migrations, but verify:

1. Go to "Table Editor" in Supabase dashboard
2. For each table, click the shield icon
3. Ensure RLS is enabled (shield should be green)
4. Review policies under "Authentication" > "Policies"

## 8. Test the Connection

Start the development server:

```bash
npm run dev
```

Test the following features:
- Register a new account with email/password
- Sign in with Google OAuth (if configured)
- Create a building (should sync to cloud)
- Go offline and make changes (should queue)
- Come back online (should auto-sync)

## Troubleshooting

### Common Issues

1. **"Invalid API key"**:
   - Ensure you're using the correct key format (`sb_publishable_` for new projects)
   - Check for typos in environment variables
   - Verify you're using the publishable/anon key, not the service role key

2. **"Project not found"**:
   - Check that your project URL is correct
   - Ensure the project reference matches your dashboard

3. **Google OAuth not working**:
   - Ensure redirect URIs match exactly in Google Console
   - Include both development and production URLs

4. **CORS errors**:
   - Add your development URL to Supabase allowed origins
   - Go to Settings > API > CORS Allowed Origins

5. **"Permission denied for table"**:
   - Check RLS is enabled and policies are correct
   - Verify user is authenticated
   - Review building membership for shared buildings

6. **Real-time not working**:
   - Check Database > Replication settings
   - Ensure WebSocket connection is established
   - Verify subscription filters are correct

## Security Best Practices

1. **Always enable RLS** on all tables accessed client-side
2. **Never expose service role key** in client code
3. **Use environment variables** for all sensitive configuration
4. **Enable email confirmations** for better security
5. **Configure rate limiting** in production
6. **Regularly rotate API keys** if compromised

## Local Development with Supabase

For fully offline development, you can run Supabase locally:

1. Install Docker Desktop
2. Start local Supabase:
```bash
supabase start
```

3. You'll get local credentials to use in `.env.local`:
```
API URL: http://localhost:54321
Studio URL: http://localhost:54323
```

## Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [API Reference](https://supabase.com/docs/reference)
- [Discord Community](https://discord.supabase.com/)
- [GitHub Discussions](https://github.com/supabase/supabase/discussions)

### Getting Help

- Check the Supabase Status page for outages
- Review project logs in the dashboard
- Search existing GitHub issues
- Ask in the Discord community
- Open an issue in this repository