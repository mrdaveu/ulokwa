exports.handler = async (event) => {
  const { pageUrl, comment, authorName } = JSON.parse(event.body);
  const url = process.env.NETLIFY_DATABASE_URL;
  const host = new URL(url).hostname.replace('-pooler', '');

  const res = await fetch(`https://${host}/sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'neon-connection-string': url
    },
    body: JSON.stringify({
      query: 'INSERT INTO comments (page_url, comment, author_name) VALUES ($1, $2, $3) RETURNING id, created_at',
      params: [pageUrl, comment, authorName || 'Anonymous']
    })
  });

  const data = await res.json();

  return {
    statusCode: 201,
    headers: { 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify({ success: true, comment: data.rows[0] })
  };
};
