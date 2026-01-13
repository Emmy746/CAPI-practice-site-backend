require('dotenv').config();

const express = require('express');
const fetch = require('node-fetch'); // install node-fetch
const crypto = require('crypto');

const app = express();
app.use(express.json());

const PIXEL_ID = process.env.PIXEL_ID;
const ACCESS_TOKEN = process.env.ACCESS_TOKEN;



app.post('/lead', async (req, res) => {
    const { email, location, event_id } = req.body;

    // hash email (Meta requires SHA256)
    const crypto = require('crypto');
    const hashedEmail = crypto.createHash('sha256').update(email.trim().toLowerCase()).digest('hex');

    // prepare payload
    const payload = {
        data: [{
            event_name: 'Lead',
            event_time: Math.floor(Date.now() / 1000),
            event_id: event_id,
            action_source: 'website',
            user_data: {
                em: hashedEmail
            }
        }]
    };

    // send to Meta CAPI
    const response = await fetch(`https://graph.facebook.com/v18.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    });

    const result = await response.json();
    console.log('Meta response:', result);

    res.json({ status: 'ok', meta: result });
});

app.listen(3000, () => console.log('Server running on port 3000'));
