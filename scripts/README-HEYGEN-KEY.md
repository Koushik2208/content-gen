# HeyGen API Key Management

## Quick Guide: Use Key Once and Reset

### Option 1: Manual Method (Recommended)

1. **Generate your video:**
   - Go to AI Videos page
   - Generate your video
   - Wait for it to complete

2. **Disable the key immediately:**
   - Open `.env.local` file
   - Find the line: `HEYGEN_API_KEY=sk_...`
   - Comment it out: `# HEYGEN_API_KEY=sk_...`
   - Save the file
   - **Restart your Next.js dev server**

### Option 2: Using the Script

1. **Enable the key:**
   ```powershell
   .\scripts\toggle-heygen-key.ps1 enable
   ```
   Then restart your dev server.

2. **Generate your video** in the app

3. **Disable the key immediately:**
   ```powershell
   .\scripts\toggle-heygen-key.ps1 disable
   ```
   Then restart your dev server.

### Important Notes:

- ⚠️ **Always restart your Next.js dev server** after changing `.env.local`
- 🔒 The script creates a backup (`.env.local.backup`) when you disable
- ✅ Your key is safe in the backup file
- 🚫 Once disabled, video generation will show "HeyGen API key not configured" error

### Current Status Check:

To check if your key is enabled:
```powershell
Select-String -Path .env.local -Pattern "^HEYGEN_API_KEY="
```

If you see output, the key is **ENABLED**.
If no output, the key is **DISABLED** (commented out).

