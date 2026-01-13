require('dotenv').config();

const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

const app = express();

/* ──────────────── MIDDLEWARE ──────────────── */
app.use(cors());
app.use(express.json());

/* ──────────────── ENV VALIDATION ──────────────── */
if (!process.env.PIXEL_ID || !process.env.ACCESS_TOKEN) {
  console.error('❌ Missing PIXEL_ID or ACCESS_TOKEN');
  process.exit(1);
}

/* ──────────────── ROUTE ──────────────── */
app.post('/lead', async (req, res) => {
  try {
    const { email, event_id } = req.body;

    if (!email || !event_id) {
      return res.status(400).json({ error: 'email and event_id required' });
    }

    const hashedEmail = crypto
      .createHash('sha256')
      .update(email.trim().toLowerCase())
      .digest('hex');

    const payload = {
      data: [{
        event_name: 'Lead',
        event_time: Math.floor(Date.now() / 1000),
        event_id,
        action_source: 'website',
        user_data: { em: hashedEmail }
      }]
    };

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${process.env.PIXEL_ID}/events?access_token=${process.env.ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();
    console.log('✅ Meta response:', result);

    res.status(200).json({ success: true, meta: result });

  } catch (err) {
    console.error('🔥 CAPI ERROR:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

/* ──────────────── SERVER ──────────────── */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Running on port ${PORT}`));
