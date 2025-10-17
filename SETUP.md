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
2. Add Neon integration OR manually add environment variable:
   - Variable name: `DATABASE_URL`
   - Value: Your Neon connection string
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
DATABASE_URL=your_neon_connection_string_here
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

### Comments not loading?
- Check browser console for errors
- Verify `DATABASE_URL` is set in Netlify environment variables
- Check Netlify Functions logs

### Can't submit comments?
- Check network tab for 500 errors
- Verify database connection string
- Check Netlify Functions logs for errors

## Future Enhancements
- [ ] Add comment moderation
- [ ] Add comment editing/deletion
- [ ] Add user authentication
- [ ] Add rate limiting
- [ ] Add markdown support for comments
