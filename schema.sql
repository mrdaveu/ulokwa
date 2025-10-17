-- Neon Database Schema for Comments
-- Run this in your Neon SQL Editor to set up the database

CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  page_url VARCHAR(500) NOT NULL,
  comment TEXT NOT NULL,
  author_name VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create index for faster lookups by page URL
CREATE INDEX IF NOT EXISTS idx_page_url ON comments(page_url);

-- Example insert (for testing)
-- INSERT INTO comments (page_url, comment, author_name)
-- VALUES ('/questions/music.html', 'Music is vibration manifesting as emotion.', 'Anonymous');
