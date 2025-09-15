# Supabase Setup Instructions

This guide will help you set up Supabase for the Always Supplied application.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/login
2. Click "New Project"
3. Choose your organization
4. Fill in project details:
   - **Name**: `always-supplied`
   - **Database Password**: Choose a strong password
   - **Region**: Choose closest to your users
5. Click "Create new project"
6. Wait for the project to be ready (usually 1-2 minutes)

## 2. Get Project Configuration

1. Go to your project dashboard
2. Click on "Settings" in the left sidebar
3. Click on "API"
4. Copy the following values:
   - **Project URL**: `https://your-project.supabase.co`
   - **Project API Keys** > **anon public**: `eyJ...` (long string starting with eyJ)

## 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`
2. Replace the placeholder values:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

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

Once you have the environment variables set up, run:

```bash
npm run supabase:migrate
```

This will create all necessary tables for the application.

## 7. Test the Connection

Start the development server:

```bash
npm run dev
```

The application should now be able to connect to Supabase. You can test this by trying to register a new account.

## Troubleshooting

### Common Issues

1. **"Invalid API key"**: Make sure you're using the `anon` key, not the `service_role` key
2. **"Project not found"**: Check that your project URL is correct
3. **Google OAuth not working**: Ensure redirect URIs match exactly in Google Console
4. **CORS errors**: Make sure your development URL is added to Supabase allowed origins

### Getting Help

- Check [Supabase Documentation](https://supabase.com/docs)
- Join [Supabase Discord](https://discord.supabase.com/)
- Open an issue in this repository