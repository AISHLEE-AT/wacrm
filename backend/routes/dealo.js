const express = require('express');
const router = express.Router();
const { pool } = require('../db');

// 1. Get Listings
router.get('/listings', async (req, res) => {
  const { pincode, category, limit = 50 } = req.query;
  try {
    let query = `SELECT * FROM market_listings WHERE 1=1`;
    const params = [];
    if (pincode) { params.push(pincode); query += ` AND pincode = $${params.length}`; }
    if (category) { params.push(category); query += ` AND category = $${params.length}`; }
    query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
    params.push(limit);
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Create Listing
router.post('/listings', async (req, res) => {
  const {
    seller_name, seller_phone, seller_whatsapp, seller_upi,
    title, category, price, unit, quantity, description,
    image_url, pincode, district, location_name, latitude, longitude
  } = req.body;

  try {
    const result = await pool.query(
      `INSERT INTO market_listings (
        seller_name, seller_phone, seller_whatsapp, seller_upi,
        title, category, price, unit, quantity, description,
        image_url, pincode, district, location_name, latitude, longitude
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
      RETURNING *`,
      [
        seller_name, seller_phone, seller_whatsapp, seller_upi,
        title, category, price, unit, quantity, description,
        image_url, pincode, district, location_name, latitude, longitude
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Update Listing Status (e.g., mark as sold)
router.patch('/listings/:id', async (req, res) => {
  const { status } = req.body;
  try {
    const result = await pool.query(
      `UPDATE market_listings SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
