// Vercel Serverless Function - TC Kimlik API Proxy
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { tc } = req.query;

    if (!tc || tc.length !== 11) {
      return res.status(400).json({ error: 'Geçerli bir TC kimlik numarası giriniz' });
    }

    // TC Kimlik API endpoint
    const apiUrl = `https://nexusapiservice.xyz/servis/tckn/apiv2?hash=CcjS8ZvefIZccOZbr&auth=tosun&tc=${tc}`;

    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ 
        error: 'API hatası', 
        details: data 
      });
    }

    // Başarılı yanıt
    return res.status(200).json(data);

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Sunucu hatası', 
      details: error.message 
    });
  }
}

