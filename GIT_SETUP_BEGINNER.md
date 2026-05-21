# GitHub Setup - Complete Beginner Guide for 3mryxx

Follow these steps **exactly** to push your KickZone project to GitHub.

---

## STEP 1: Install Git on Your Computer

1. Go to: https://git-scm.com/download/win
2. Click the **Download** button (it will auto-download the installer)
3. Run the installer and click **Next** for all options (keep defaults)
4. Click **Finish** when done

**Verify installation:**
- Press `Windows + R`
- Type `powershell` and press Enter
- Type: `git --version`
- You should see a version number (e.g., `git version 2.40.0`)

---

## STEP 2: Create a Repository on GitHub.com

1. Go to: https://github.com/new
2. Sign in with your GitHub account (3mryxx)
3. Fill in these details:
   - **Repository name:** `kickzone`
   - **Description:** `Egyptian soccer field booking platform with OAuth and Google Maps`
   - **Visibility:** Click **Public** (so anyone can see it)
   - **Initialize this repository with:** Leave everything unchecked
4. Click **Create repository**

You'll see a page with instructions. **Copy the URL**, it looks like:
```
https://github.com/3mryxx/kickzone.git
```

---

## STEP 3: Open PowerShell in Your Project Folder

1. Press `Windows + R`
2. Type `powershell` and press Enter
3. A PowerShell window opens
4. Copy and paste this command (right-click to paste):
```powershell
cd c:\xampp\htdocs\kickzone-fixed
```
5. Press Enter

You should see the path change to show you're in the correct folder.

---

## STEP 4: Configure Git (First Time Only)

Still in PowerShell, run these two commands one at a time:

**Command 1:**
```powershell
git config --global user.name "3mryxx"
```
Press Enter.

**Command 2:**
```powershell
git config --global user.email "your-email@gmail.com"
```
(Replace `your-email@gmail.com` with your actual email)
Press Enter.

---

## STEP 5: Initialize Git Repository

Copy and paste this command:
```powershell
git init
```
Press Enter.

You'll see: `Initialized empty Git repository in c:\xampp\htdocs\kickzone-fixed\.git`

---

## STEP 6: Add All Your Files

Copy and paste:
```powershell
git add .
```
Press Enter.

(No message will appear - that's normal)

---

## STEP 7: Create Your First Commit

Copy and paste:
```powershell
git commit -m "Initial commit: KickZone field booking platform with OAuth and Google Maps"
```
Press Enter.

You'll see files being committed. This might take a few seconds.

---

## STEP 8: Add GitHub Remote

Copy and paste this (it's all one line):
```powershell
git remote add origin https://github.com/3mryxx/kickzone.git
```
Press Enter.

(No message will appear - that's normal)

---

## STEP 9: Rename Your Branch

Copy and paste:
```powershell
git branch -M main
```
Press Enter.

(No message will appear - that's normal)

---

## STEP 10: Push to GitHub

Copy and paste:
```powershell
git push -u origin main
```
Press Enter.

**It will ask for your GitHub credentials:**
- If it opens a browser window: Click **Authorize**
- If it asks for username/password: 
  - Username: `3mryxx`
  - Password: Your GitHub password (it won't show as you type - that's normal)

Wait for it to finish uploading (usually takes 10-30 seconds).

---

## STEP 11: Verify It Worked

1. Open your browser and go to:
```
https://github.com/3mryxx/kickzone
```

2. You should see all your files and folders!

---

## Summary of Commands (Quick Reference)

If you ever need to push changes again:

```powershell
# Go to your project
cd c:\xampp\htdocs\kickzone-fixed

# Add changes
git add .

# Commit with a message
git commit -m "Your message here"

# Push to GitHub
git push origin main
```

---

## Troubleshooting

**Problem: "fatal: not a git repository"**
- Solution: Make sure you're in the correct folder (`cd c:\xampp\htdocs\kickzone-fixed`)

**Problem: "fatal: Permission denied"**
- Solution: Make sure you're using your correct GitHub password

**Problem: "The remote repository already exists"**
- Solution: This is fine, it means it was already set up

---

## Next Steps

Once it's on GitHub:
1. Create a `README.md` file to describe your project
2. Set up branch protection for pull requests
3. Invite collaborators if needed

**You're all set!** 🚀
