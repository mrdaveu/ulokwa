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

  const NEON_API_KEY = process.env.NEON_API_KEY;
  const NEON_REST_API_URL = process.env.NEON_REST_API_URL;

  if (!NEON_API_KEY || !NEON_REST_API_URL) {
    console.error('Missing NEON_API_KEY or NEON_REST_API_URL environment variables');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' })
    };
  }

  try {
    const response = await fetch(NEON_REST_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NEON_API_KEY}`
      },
      body: JSON.stringify({
        query: 'INSERT INTO comments (page_url, comment, author_name) VALUES ($1, $2, $3) RETURNING id, created_at',
        params: [pageUrl, comment, authorName || 'Anonymous']
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Neon API error:', data);
      throw new Error('Database insert failed');
    }

    const result = data.rows[0];

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: true,
        comment: {
          id: result.id,
          pageUrl,
          comment,
          authorName: authorName || 'Anonymous',
          createdAt: result.created_at
        }
      })
    };
  } catch (error) {
    console.error('Database error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to save comment' })
    };
  }
};
