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

  const DATABASE_URL = process.env.NETLIFY_DATABASE_URL || process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    console.error('Missing NETLIFY_DATABASE_URL environment variable');
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Server configuration error' })
    };
  }

  // Extract connection details from DATABASE_URL
  const dbUrl = new URL(DATABASE_URL);
  const [user, password] = dbUrl.username && dbUrl.password
    ? [dbUrl.username, dbUrl.password]
    : ['neondb_owner', ''];

  const restApiUrl = `https://${dbUrl.hostname.replace('-pooler', '')}/sql`;

  try {
    const response = await fetch(restApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${password}`
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
