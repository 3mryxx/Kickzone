# OAuth Setup Guide for KickZone

Complete guide to set up Google and Facebook OAuth login for your KickZone app.

---

## Part 1: Google OAuth Setup

### Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click the project dropdown at the top
3. Click **NEW PROJECT**
4. Name it: `KickZone`
5. Click **CREATE**
6. Wait for the project to be created (1-2 minutes)

### Step 2: Enable Google+ API

1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for `Google+ API`
3. Click it, then click **ENABLE**
4. Wait for it to enable

### Step 3: Create OAuth Credentials

1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. If asked to configure OAuth consent screen:
   - Choose **External** user type
   - Click **CREATE**
   - Fill in:
     - App name: `KickZone`
     - User support email: your email
     - Developer contact email: your email
   - Click **SAVE AND CONTINUE** through all steps
   - Click **BACK TO CREDENTIALS**

4. Click **+ CREATE CREDENTIALS** → **OAuth client ID** again
5. Choose **Web application**
6. Under "Authorized redirect URIs", click **ADD URI**
7. Enter: `http://localhost/kickzone-fixed/backend/oauth.php?provider=google&action=callback`
8. Click **CREATE**
9. Copy your:
   - **Client ID** (save this)
   - **Client Secret** (save this)

---

## Part 2: Facebook OAuth Setup

### Step 1: Create a Facebook App

1. Go to [Facebook Developer Dashboard](https://developers.facebook.com/)
2. Log in with your Facebook account (create one if needed)
3. Click **My Apps** → **Create App**
4. Choose **Consumer** type
5. Fill in:
   - App name: `KickZone`
   - App contact email: your email
   - Purpose: Select appropriate category
6. Click **Create App**

### Step 2: Get Your Credentials

1. In your Facebook app dashboard, go to **Settings** → **Basic**
2. Copy your:
   - **App ID** (save this)
   - **App Secret** (save this)

### Step 3: Configure Valid OAuth Redirect URIs

1. Go to **Settings** → **Basic**
2. In "App Domains", add: `localhost`
3. Go to **Products** → **Facebook Login** → **Settings**
4. Under "Valid OAuth Redirect URIs", add:
   ```
   http://localhost/kickzone-fixed/backend/oauth.php?provider=facebook&action=callback
   ```
5. Click **Save Changes**

---

## Part 3: Add Credentials to KickZone

Once you have all four credentials, edit your backend/oauth.php file and replace:

```php
define('GOOGLE_CLIENT_ID',     'YOUR_GOOGLE_CLIENT_ID');
define('GOOGLE_CLIENT_SECRET', 'YOUR_GOOGLE_CLIENT_SECRET');

define('FACEBOOK_APP_ID',      'YOUR_FACEBOOK_APP_ID');
define('FACEBOOK_APP_SECRET',  'YOUR_FACEBOOK_APP_SECRET');
```

With your actual credentials.

### Example (DO NOT USE - just for reference):
```php
define('GOOGLE_CLIENT_ID',     '123456789-abcdefg.apps.googleusercontent.com');
define('GOOGLE_CLIENT_SECRET', 'GOCSPX-abc123xyz');

define('FACEBOOK_APP_ID',      '987654321');
define('FACEBOOK_APP_SECRET',  'abc123xyz789abc123');
```

---

## Part 4: Install Required PHP Library

OAuth token exchange needs the `curl` extension. Most XAMPP installations have it, but verify:

1. Create a test file at `c:\xampp\htdocs\kickzone-fixed\test-curl.php`:
```php
<?php
if (extension_loaded('curl')) {
    echo 'cURL is installed ✓';
} else {
    echo 'cURL is NOT installed ✗';
}
?>
```

2. Visit: `http://localhost/kickzone-fixed/test-curl.php`
3. If you see "cURL is NOT installed", enable it in `C:\xampp\php\php.ini`:
   - Find: `;extension=curl`
   - Change to: `extension=curl`
   - Restart Apache in XAMPP

---

## Part 5: Test Your OAuth Setup

1. Go to [KickZone Login](http://localhost/kickzone-fixed/frontend/pages/login/index.html)
2. Click either **Google** or **Facebook** button
3. You'll be redirected to sign in with that provider
4. After authorizing, you'll be logged in to KickZone
5. A new user account will be automatically created

---

## Troubleshooting

### "Invalid OAuth response" error
- **Cause**: Redirect URI doesn't match
- **Solution**: Make sure your redirect URI in credentials matches exactly (check trailing slashes)

### "OAuth authentication failed"
- **Cause**: Wrong credentials or credentials not updated in oauth.php
- **Solution**: Double-check credentials are copied correctly

### "Cannot get token"
- **Cause**: cURL extension not enabled
- **Solution**: Enable cURL in php.ini and restart Apache

### Google button doesn't work
- **Cause**: Google+ API not enabled or credentials not saved
- **Solution**: Go back to Google Cloud Console and verify

---

## After Setup

Once you have working OAuth:

1. **Optional**: Add more OAuth providers (Twitter, LinkedIn, etc.)
2. **Security**: Move credentials to environment variables (not in code)
3. **Production**: Update redirect URIs to your production domain

Done! 🚀
