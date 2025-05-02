# Setting Up Google Authentication for Five Adventures

This guide provides step-by-step instructions for setting up Google OAuth authentication for your Five Adventures project.

## Prerequisites

1. A Google account
2. Access to your project's Supabase dashboard
3. Your project's development environment set up

## Step 1: Create OAuth Credentials in Google Cloud Console

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" and select "OAuth client ID"
5. If this is your first time, you'll need to configure the consent screen:
   - Choose "External" user type (unless you're using Google Workspace)
   - Fill in the required app information (name, user support email, etc.)
   - For scopes, you only need "email" and "profile"
   - Add your domain to the authorized domains
   - Save and continue
6. After configuring the consent screen, return to creating OAuth credentials:
   - Application type: "Web application"
   - Name: "Five Adventures Auth" (or any name you prefer)
   - Authorized JavaScript origins: 
     - Add your local development URL (e.g., `http://localhost:3000`)
     - Add your production URL if deployed
   - Authorized redirect URIs:
     - Add: `https://[YOUR_PROJECT_REF].supabase.co/auth/v1/callback`
     - Add: `http://localhost:3000/auth/callback` (for local development)
7. Click "Create"
8. Note the Client ID and Client Secret that are generated

## Step 2: Configure Supabase Auth Settings

1. Log in to the [Supabase Dashboard](https://app.supabase.com/)
2. Select your project
3. Navigate to "Authentication" > "Providers"
4. Find "Google" in the list of providers and enable it
5. Enter the Client ID and Client Secret from the Google Cloud Console
6. Save the changes

## Step 3: Update Environment Variables

Ensure your `.env.local` file includes the following variables:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_SITE_URL=http://localhost:3000  # Change this in production
```

## Step 4: Test the Authentication

1. Start your development server
2. Navigate to the login page
3. Click "Sign in with Google"
4. You should be redirected to Google's authentication page
5. After authenticating, you should be redirected back to your app and logged in

## Troubleshooting

### Common Issues:

1. **Redirect URI Mismatch**: Ensure the redirect URI in Google Cloud Console exactly matches the one Supabase is using
2. **Incorrect Environment Variables**: Double check that your environment variables are correct
3. **CORS Issues**: Make sure your origins are properly configured in Google Cloud Console
4. **Callback Not Working**: Verify that your callback page is correctly handling the auth response

### Still Having Problems?

Check the Supabase logs in the dashboard under "Logs" > "Auth" to see if there are any error messages that might help diagnose the issue.

## Next Steps

After successfully setting up Google authentication, consider:

1. Implementing additional OAuth providers (Facebook, Discord, Apple, etc.)
2. Enhancing user profile data by retrieving additional information from OAuth providers
3. Setting up account linking to allow users to connect multiple auth methods to a single account
