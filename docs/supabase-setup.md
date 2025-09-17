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

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" > "Create Credentials" > "OAuth 2.0 Client IDs"
5. Configure OAuth consent screen if prompted
6. Choose "Web application"
7. Add authorized redirect URIs:
   - For development: `https://your-project.supabase.co/auth/v1/callback`
   - For production: Add your production domain
8. Copy the **Client ID** and add to your `.env.local`:

```env
VITE_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

## 5. Configure Supabase Auth

1. In your Supabase dashboard, go to "Authentication" > "Providers"
2. Enable "Google" provider
3. Paste your Google Client ID and Client Secret
4. Save configuration

## 6. Run Database Migrations

The project includes pre-written migrations in the `supabase/migrations` folder:

### Using Supabase CLI (Recommended):

1. Install the Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link your project (get project ref from dashboard URL):
```bash
supabase link --project-ref [YOUR-PROJECT-REF]
```

4. Run the migrations:
```bash
supabase db push
```

### Manual Migration (Alternative):

1. Go to your Supabase dashboard
2. Navigate to "SQL Editor"
3. Run each migration file in order:
   - `001_initial_cloud_schema.sql`
   - `002_rls_policies.sql`
   - `003_functions_and_triggers.sql`

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