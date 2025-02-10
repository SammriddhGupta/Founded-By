import fetch from 'node-fetch';

export async function handler(event, context) {
  const query = event.queryStringParameters.query;
  if (!query) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'Missing "query" parameter' }),
    };
  }
  const wikidataUrl = `https://query.wikidata.org/sparql?query=${encodeURIComponent(query)}`;
  try {
    const wikidataResponse = await fetch(wikidataUrl, {
      headers: { Accept: 'application/sparql-results+json' },
    });
    const data = await wikidataResponse.json();
    return {
      statusCode: 200,
      body: JSON.stringify(data),
    };
  } catch (error) {
    console.error('Error fetching from Wikidata:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch from Wikidata' }),
    };
  }
}
