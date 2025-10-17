const { Client } = require('pg');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch (error) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Invalid JSON' })
    };
  }

  const { pageUrl, comment, authorName, honeypot } = body;

  // Honeypot spam protection
  if (honeypot) {
    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Comment submitted' })
    };
  }

  // Validate required fields
  if (!pageUrl || !comment) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing required fields' })
    };
  }

  // Basic validation
  if (comment.length < 1 || comment.length > 5000) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Comment must be between 1 and 5000 characters' })
    };
  }

  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();

    const result = await client.query(
      'INSERT INTO comments (page_url, comment, author_name) VALUES ($1, $2, $3) RETURNING id, created_at',
      [pageUrl, comment, authorName || 'Anonymous']
    );

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        comment: {
          id: result.rows[0].id,
          pageUrl,
          comment,
          authorName: authorName || 'Anonymous',
          createdAt: result.rows[0].created_at
        }
      })
    };
  } catch (error) {
    console.error('Database error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to save comment' })
    };
  } finally {
    await client.end();
  }
};
