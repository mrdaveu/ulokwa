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

### 2️⃣ Configure Netlify (1 minute)

1. Go to Netlify Dashboard → Your Site → Site Settings → Environment Variables
2. Add this variable:

   **NETLIFY_DATABASE_URL**
   ```
   postgresql://neondb_owner:npg_3nMZErB1psUv@ep-frosty-fire-ae0rgj8a-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

3. Click "Save"

*Note: Using NETLIFY_DATABASE_URL (already set from your Neon integration). The functions will automatically extract the password and use it with Neon's REST API.*

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
