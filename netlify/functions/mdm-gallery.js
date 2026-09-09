const API_URL = process.env.MDM_API_URL || 'https://mdm-tapcard-api.fly.dev';

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return response(405, { error: 'Method not allowed' });
  }

  const slug = process.env.MDM_BUSINESS_SLUG;
  const apiKey = process.env.MDM_API_KEY;

  if (!slug || !apiKey) {
    return response(500, { error: 'Gallery is not configured.' });
  }

  const params = new URLSearchParams(event.queryStringParameters || {});
  const limit = Math.min(Math.max(Number(params.get('limit') || 12), 1), 60);
  params.set('limit', String(limit));
  params.delete('business_slug');

  const endpoint = `${API_URL.replace(/\/$/, '')}/api/v1/businesses/${encodeURIComponent(slug)}/gallery?${params}`;

  try {
    const upstream = await fetch(endpoint, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'X-API-Key': apiKey,
        Accept: 'application/json'
      }
    });
    const text = await upstream.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch {
      data = { error: 'The gallery API returned an invalid response.' };
    }

    if (!upstream.ok) {
      return response(upstream.status, { error: 'The MDM TapCard gallery could not be loaded.' }, true);
    }

    return response(200, data);
  } catch (error) {
    console.error('MDM gallery request failed:', error);
    return response(502, { error: 'Unable to load the gallery right now.' });
  }
};

function response(statusCode, body, isError = false) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': isError ? 'no-store' : 'public, max-age=60, stale-while-revalidate=300'
    },
    body: JSON.stringify(body)
  };
}
