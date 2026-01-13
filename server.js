require('dotenv').config();

const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const crypto = require('crypto');

const app = express();

/* CORS — MUST COME FIRST */
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type']
}));

app.use(express.json());

const PIXEL_ID = process.env.PIXEL_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

app.post('/lead', async (req, res) => {
  try {
    const { email, location, event_id } = req.body;

    console.log('Incoming lead:', email, location, event_id);

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
        user_data: {
          em: hashedEmail
        }
      }]
    };

    const response = await fetch(
      `https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }
    );

    const result = await response.json();
    console.log('Meta response:', result);

    res.status(200).json({ success: true });

  } catch (err) {
    console.error('CAPI error:', err);
    res.status(500).json({ success: false });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
