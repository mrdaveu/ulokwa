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

  const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error('Missing NETLIFY_DATABASE_URL environment variable');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' })
    };
  }

  // Parse connection string to get REST API endpoint
  const dbUrl = new URL(DATABASE_URL);
  const hostname = dbUrl.hostname.replace('-pooler', '');

  // Neon REST API endpoint format
  const restApiUrl = `https://${hostname}/sql`;

  try {
    const response = await fetch(restApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'neon-connection-string': DATABASE_URL
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
