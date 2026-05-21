# GitHub Upload - Step by Step Guide for 3mryxx (Fresh Start)

Follow these steps **exactly** to upload your KickZone project to GitHub.

---

## STEP 1: Create a New Repository on GitHub

1. Open your browser and go to: https://github.com/new
2. Sign in with your GitHub account (3mryxx)
3. Fill in the form:
   - **Repository name:** `kickzone`
   - **Description:** `Egyptian soccer field booking platform with OAuth and Google Maps`
   - **Public or Private:** Click **Public**
   - **Add a README file:** CHECK this box ✓
   - **Add .gitignore:** Select **Node** (or leave empty)
   - **Choose a license:** Leave empty
4. Click **Create repository**

You'll see your new empty repository. **Don't do anything yet.**

---

## STEP 2: Open PowerShell in Your Project Folder

1. Press `Windows + R`
2. Type `powershell` and press Enter
3. Copy and paste this command:
```powershell
cd c:\xampp\htdocs\kickzone-fixed
```
4. Press Enter

You should be in the folder now.

---

## STEP 3: Check If Git Exists

Copy and paste:
```powershell
git --version
```
Press Enter.

If you see a version number, Git is installed. If not, download it from: https://git-scm.com/download/win

---

## STEP 4: Remove Old Git (Fresh Start)

Copy and paste:
```powershell
Remove-Item -Path ".git" -Recurse -Force
```
Press Enter.

(This deletes the old git setup so we can start fresh)

---

## STEP 5: Set Up Git Configuration

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

## STEP 6: Initialize Git Repository

Copy and paste:
```powershell
git init
```
Press Enter.

---

## STEP 7: Add All Your Project Files

Copy and paste:
```powershell
git add .
```
Press Enter.

(This prepares all your files to be uploaded)

---

## STEP 8: Create Your First Commit

Copy and paste:
```powershell
git commit -m "Initial commit: KickZone field booking platform"
```
Press Enter.

---

## STEP 9: Rename Branch to Main

Copy and paste:
```powershell
git branch -M main
```
Press Enter.

---

## STEP 10: Connect to GitHub

Copy and paste (replace the URL with YOUR repository URL):
```powershell
git remote add origin https://github.com/3mryxx/kickzone.git
```
Press Enter.

---

## STEP 11: Upload to GitHub

Copy and paste:
```powershell
git push -u origin main
```
Press Enter.

**It will ask for authentication:**
- Your browser might open → Click **Authorize**
- Or enter your GitHub credentials

Wait for upload to complete (usually 20-30 seconds).

---

## STEP 12: Verify It Worked

1. Open your browser
2. Go to: `https://github.com/3mryxx/kickzone`
3. You should see all your project files! ✅

---

## Complete Command List (For Reference)

If you need to do this again, here are all commands in order:

```powershell
cd c:\xampp\htdocs\kickzone-fixed
Remove-Item -Path ".git" -Recurse -Force
git init
git add .
git commit -m "Initial commit: KickZone field booking platform"
git branch -M main
git remote add origin https://github.com/3mryxx/kickzone.git
git push -u origin main
```

---

## If You Get an Error

**Error: "remote already exists"**
- Run this first: `git remote remove origin`
- Then run: `git remote add origin https://github.com/3mryxx/kickzone.git`

**Error: "failed to push"**
- Make sure you authorized GitHub access when prompted
- Try again: `git push -u origin main`

**Error: ".git exists"**
- That's fine, just skip that step and continue

---

**You're done! Your project is now on GitHub!** 🎉
