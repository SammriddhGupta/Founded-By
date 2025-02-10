import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();
app.use(cors());

// Our endpoint: /sparql
app.get('/sparql', async (req, res) => {
  const sparqlQuery = req.query.query;
  if (!sparqlQuery) {
    return res.status(400).json({ error: 'Missing "query" parameter' });
  }

  const wikidataUrl = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparqlQuery)}`;

  try {
    const wikidataResponse = await fetch(wikidataUrl, {
      headers: { Accept: 'application/sparql-results+json' },
    });
    const data = await wikidataResponse.json();

    res.json(data);
  } catch (error) {
    console.error('Error fetching from Wikidata:', error);
    res.status(500).json({ error: 'Failed to fetch from Wikidata' });
  }
});

// Make sure to actually use PORT:
const PORT = process.env.PORT || 4000;

// Listen on the given port to keep the process alive
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
