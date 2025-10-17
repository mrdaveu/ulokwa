exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const pageUrl = event.queryStringParameters?.url;

  if (!pageUrl) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing url parameter' })
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
        query: 'SELECT id, comment, author_name, created_at FROM comments WHERE page_url = $1 ORDER BY created_at DESC',
        params: [pageUrl]
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Neon API error:', data);
      throw new Error('Database query failed');
    }

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ comments: data.rows || [] })
    };
  } catch (error) {
    console.error('Database error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch comments' })
    };
  }
};
