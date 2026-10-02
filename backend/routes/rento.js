const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { sendWhatsAppMessage } = require('../services/whatsapp');

// 1. Get Machinery
router.get('/machinery', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM rento_machinery ORDER BY created_at DESC`);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Book Machinery
router.post('/bookings', async (req, res) => {
  const { machinery_id, customer_name, customer_phone, booking_location, booking_date } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO rento_bookings (machinery_id, customer_name, customer_phone, booking_location, booking_date)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [machinery_id, customer_name, customer_phone, booking_location, booking_date]
    );

    const booking = result.rows[0];

    // Fetch machinery details for the WhatsApp message
    const machRes = await pool.query(`SELECT * FROM rento_machinery WHERE id = $1`, [machinery_id]);
    const machine = machRes.rows[0];

    if (machine) {
      const messageText = `🚜 *New RentO Booking Request*\n\n` +
        `*Machine:* ${machine.name}\n` +
        `*Customer:* ${customer_name || 'N/A'}\n` +
        `*Phone:* ${customer_phone || 'N/A'}\n` +
        `*Location:* ${booking_location}\n` +
        `*Date:* ${booking_date}\n\n` +
        `Reply to accept!`;

      const targetPhone = machine.whatsapp_number || '916381029380';
      sendWhatsAppMessage(targetPhone, messageText).catch(waErr => {
        console.error('Failed to send RentO WhatsApp message:', waErr?.message);
      });
    }

    res.json(booking);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
