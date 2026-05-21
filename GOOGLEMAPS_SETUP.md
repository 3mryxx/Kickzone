# Google Maps API Key Setup (2 Minutes)

## Step 1: Go to Google Cloud Console
1. Open: https://console.cloud.google.com/
2. Click the project dropdown at the top
3. Click **NEW PROJECT**
4. Name it: `KickZone Maps`
5. Click **CREATE**
6. Wait 1-2 minutes for it to be created

## Step 2: Enable Google Maps API
1. In Google Cloud Console, go to **APIs & Services** → **Library**
2. Search for: `Maps JavaScript API`
3. Click it
4. Click **ENABLE**
5. Go back to Library
6. Search for: `Places API`
7. Click it
8. Click **ENABLE**

## Step 3: Create API Key
1. Go to **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS** → **API Key**
3. Copy your API Key (save it!)
4. Click the key to edit it
5. Under "Application restrictions":
   - Select **HTTP referrers (web sites)**
   - Click **ADD AN ITEM**
   - Enter: `localhost/*`
   - Enter: `cd c:\xampp\htdocs\kickzone-fixed

# Initialize git
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: KickZone field booking platform with OAuth and Google Maps"

# Add GitHub remote (replace YOUR_USERNAME and YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/kickzone.git

# Rename branch to main (GitHub default)
git branch -M main

# Push to GitHub
git push -u origin main`
6. Click **SAVE**

## Step 4: Add Key to KickZone
Once you have your API key, send it to me and I'll add it to:
- `frontend/pages/fields-map/index.html` (for the map)
- `frontend/pages/browse/index.html` (if needed)

**Your Google Maps API Key will look like:**
```
AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

---

**Send me your API key when ready!** 🗺️
