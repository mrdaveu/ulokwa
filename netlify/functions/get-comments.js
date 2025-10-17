exports.handler = async (event) => {
  const url = process.env.NETLIFY_DATABASE_URL;
  const host = new URL(url).hostname.replace('-pooler', '');

  const res = await fetch(`https://${host}/sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'neon-connection-string': url
    },
    body: JSON.stringify({
      query: 'SELECT id, comment, author_name, created_at FROM comments WHERE page_url = $1 ORDER BY created_at DESC',
      params: [event.queryStringParameters?.url]
    })
  });

  const data = await res.json();

  return {
    statusCode: 200,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ comments: data.rows || [] })
  };
};
