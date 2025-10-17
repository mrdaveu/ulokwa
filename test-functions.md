# Testing Netlify Functions

## After deploying to Netlify, test your functions:

### 1. Test GET Comments Function
Open in browser:
```
https://yoursite.netlify.app/.netlify/functions/get-comments?url=/questions/music.html
```

Expected response:
```json
{
  "comments": []
}
```

### 2. Test POST Comment Function
Using curl:
```bash
curl -X POST https://yoursite.netlify.app/.netlify/functions/post-comment \
  -H "Content-Type: application/json" \
  -d '{
    "pageUrl": "/questions/music.html",
    "comment": "Test comment",
    "authorName": "Tester",
    "honeypot": ""
  }'
```

Expected response:
```json
{
  "success": true,
  "comment": {
    "id": 1,
    "pageUrl": "/questions/music.html",
    "comment": "Test comment",
    "authorName": "Tester",
    "createdAt": "2025-01-15T..."
  }
}
```

### 3. Verify in Database
Go to Neon Console → SQL Editor → Run:
```sql
SELECT * FROM comments ORDER BY created_at DESC LIMIT 10;
```

## Local Testing

### Start local dev server:
```bash
netlify dev
```

Then test locally at:
- GET: http://localhost:8888/.netlify/functions/get-comments?url=/test.html
- POST: Use curl with localhost:8888

## Common Issues

### 404 on functions
- Redeploy site
- Check `netlify.toml` configuration
- Verify functions are in `netlify/functions/` directory

### 500 errors
- Check Netlify Functions logs
- Verify `NEON_REST_API_URL` and `NEON_API_KEY` are set in Netlify
- Verify database schema exists (run `schema.sql`)
- Check if API key has correct permissions

### "Server configuration error"
- Missing environment variables
- Go to Netlify Dashboard → Site Settings → Environment Variables
- Add `NEON_REST_API_URL` and `NEON_API_KEY`
