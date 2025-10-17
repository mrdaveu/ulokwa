# Comment System Setup Guide

## Overview
This site now includes a dynamic comment system that allows visitors to contribute to pages with empty content. Comments are stored in a Neon PostgreSQL database and served via Netlify Functions.

## Features
- ✅ Detects empty pages automatically
- ✅ Shows "Answer not yet known" message for empty pages
- ✅ Comment form with optional author name
- ✅ Honeypot spam protection
- ✅ Real-time comment loading
- ✅ Prefetching on hover (for fast page loads)

## Setup Steps

### 1. Create Neon Database
1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project
3. Copy your connection string (starts with `postgresql://`)
4. Run the SQL from `schema.sql` in the Neon SQL Editor

### 2. Configure Netlify
1. Connect your repo to Netlify
2. **Add Environment Variable** in Netlify Dashboard → Site Settings → Environment Variables:

   **Required:**
   - `NETLIFY_DATABASE_URL`: Your Neon database connection string
     - Get from Neon Console → Connection Details
     - Format: `postgresql://user:password@host/database?sslmode=require`
     - The functions automatically extract the password and use it with Neon's REST API
     - **Note:** This should already be set if you used Neon integration

3. Deploy site

### 3. Install Dependencies
```bash
npm install
```

### 4. Test Locally (Optional)
To test Netlify Functions locally:
```bash
npm install -g netlify-cli
netlify dev
```

Add `.env` file:
```
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require
```

### 5. Build and Deploy
```bash
npm run build
netlify deploy --prod
```

## File Structure
```
├── netlify/
│   └── functions/
│       ├── get-comments.js    # GET endpoint for comments
│       └── post-comment.js    # POST endpoint for new comments
├── netlify.toml               # Netlify configuration
├── schema.sql                 # Database schema
├── index.html                 # Main page with comment logic
└── stylesheet.css             # Styles including comment UI
```

## API Endpoints

### GET Comments
```
/.netlify/functions/get-comments?url=/path/to/page.html
```

Response:
```json
{
  "comments": [
    {
      "id": 1,
      "comment": "Great insight!",
      "author_name": "Jane",
      "created_at": "2025-01-15T10:30:00Z"
    }
  ]
}
```

### POST Comment
```
POST /.netlify/functions/post-comment
Content-Type: application/json

{
  "pageUrl": "/path/to/page.html",
  "comment": "This is my comment",
  "authorName": "John",
  "honeypot": ""
}
```

## How It Works

1. **Page Load**: When user clicks an item, content is fetched (already prefetched on hover)
2. **Empty Detection**: JavaScript checks if content is < 10 characters
3. **Comment Display**:
   - If empty: Shows placeholder message + comment form
   - If not empty: Shows content + comment form below
4. **Comment Submission**: Form POST → Netlify Function → Neon DB
5. **Comment Loading**: On page load, fetches comments via GET endpoint

## Customization

### Change Empty Content Threshold
In `index.html`, find:
```javascript
return text.length < 10; // Consider empty if less than 10 chars
```

### Modify Empty Message
In `index.html`, find:
```javascript
<p class="empty-message">The answer is not yet known to this part of the internet.</p>
```

### Style Changes
Edit `stylesheet.css` in the "Comment Section Styles" block

## Spam Protection
- Honeypot field (hidden input that bots might fill)
- Character limit (1-5000 chars)
- Can add rate limiting in Netlify Functions if needed

## Troubleshooting

### Functions returning 404?
- Verify `netlify.toml` has correct `[functions]` section
- Check that `netlify/functions/` directory exists
- Redeploy after adding functions

### Comments not loading?
- **Check browser console** for errors
- **Verify environment variable** in Netlify:
  - `NETLIFY_DATABASE_URL` should be set to your Neon connection string
  - Should include username, password, and host
- **Check Netlify Functions logs**:
  - Netlify Dashboard → Functions → Click function → View logs
- **Test function directly**: Visit `https://yoursite.netlify.app/.netlify/functions/get-comments?url=/test.html`

### Can't submit comments?
- **Check network tab** for 500 errors
- **Verify database connection string** has correct format
- **Check Netlify Functions logs** for database connection errors
- **Verify schema exists**: Run `schema.sql` in Neon SQL Editor

### Getting Database Connection String
1. Go to [Neon Console](https://console.neon.tech)
2. Select your project
3. Click "Connection Details" or "Dashboard"
4. Copy the connection string (starts with `postgresql://`)
5. Add to Netlify as `NETLIFY_DATABASE_URL` environment variable

### Local development not working?
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Create .env file with your credentials
cat > .env << EOF
NEON_REST_API_URL=https://your-project.apirest.aws.neon.tech/neondb/rest/v1
NEON_API_KEY=your_api_key_here
EOF

# Run local dev server
netlify dev
```

## Future Enhancements
- [ ] Add comment moderation
- [ ] Add comment editing/deletion
- [ ] Add user authentication
- [ ] Add rate limiting
- [ ] Add markdown support for comments
