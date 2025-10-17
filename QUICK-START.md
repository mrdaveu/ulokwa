# Quick Start Guide

## 🚀 Getting Your Comment System Running

### 1️⃣ Setup Neon Database (5 minutes)

1. Go to https://console.neon.tech
2. Create a new project
3. Go to SQL Editor and run this:
   ```sql
   CREATE TABLE IF NOT EXISTS comments (
     id SERIAL PRIMARY KEY,
     page_url VARCHAR(500) NOT NULL,
     comment TEXT NOT NULL,
     author_name VARCHAR(100),
     created_at TIMESTAMP DEFAULT NOW()
   );
   CREATE INDEX IF NOT EXISTS idx_page_url ON comments(page_url);
   ```
4. Get your API key:
   - Profile → Account Settings → API Keys → Create new key
   - **Save this key!** You'll need it in step 2

### 2️⃣ Configure Netlify (2 minutes)

1. Go to Netlify Dashboard → Your Site → Site Settings → Environment Variables
2. Add these two variables:

   **NEON_REST_API_URL**
   ```
   https://ep-frosty-fire-ae0rgj8a.apirest.c-2.us-east-2.aws.neon.tech/neondb/rest/v1
   ```

   **NEON_API_KEY**
   ```
   [paste your API key from step 1]
   ```

3. Click "Save"

### 3️⃣ Deploy (1 minute)

```bash
git add .
git commit -m "Add comment system with REST API"
git push
```

Netlify will auto-deploy!

### 4️⃣ Test It!

1. Visit your site
2. Click on an empty page (like "what is the deal with music?")
3. You should see: "The answer is not yet known to this part of the internet"
4. Add a test comment!

---

## ✅ That's It!

Your comment system is now live.

**Next steps:**
- Read `SETUP.md` for detailed docs
- Read `test-functions.md` for testing tips

**Troubleshooting?**
- Check Netlify Functions logs
- Verify both env vars are set correctly
- Make sure schema was created in Neon
