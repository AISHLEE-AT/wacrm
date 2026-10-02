const express = require('express');
const router = express.Router();
const { pool } = require('../db');
const { sendWhatsAppMessage } = require('../services/whatsapp');

// 1. Register a new driver
router.post('/drivers', async (req, res) => {
  const { phone_number, name, vehicle_type, vehicle_registration } = req.body;
  if (!phone_number) return res.status(400).json({ error: 'Phone number is required' });
  try {
    const result = await pool.query(
      `INSERT INTO drivers (phone_number, name, vehicle_type, vehicle_registration, status)
       VALUES ($1, $2, $3, $4, 'offline') RETURNING *`,
      [phone_number, name, vehicle_type, vehicle_registration]
    );
    res.json(result.rows[0]);
  } catch (err) {
    if (err.code === '23505') return res.status(400).json({ error: 'Driver already exists' });
    res.status(500).json({ error: err.message });
  }
});

// 2. Update Driver Location (PUT & POST)
const handleDriverLocation = async (req, res) => {
  const { driver_id, phone, latitude, longitude, lat, lng, status } = req.body;
  const effectiveLat = latitude !== undefined ? latitude : lat;
  const effectiveLng = longitude !== undefined ? longitude : lng;

  if (effectiveLat === undefined || effectiveLng === undefined) {
    return res.status(400).json({ error: 'Missing latitude/longitude' });
  }
  try {
    let result;
    if (driver_id) {
      result = await pool.query(
        `UPDATE drivers 
         SET latitude = $1, longitude = $2, current_lat = $1, current_lng = $2, status = COALESCE($3, status), last_location_update = NOW(), updated_at = NOW() 
         WHERE id = $4 RETURNING *`,
        [effectiveLat, effectiveLng, status, driver_id]
      );
    } else if (phone) {
      const clean = phone.replace(/\D/g, '').slice(-10);
      result = await pool.query(
        `UPDATE drivers 
         SET latitude = $1, longitude = $2, current_lat = $1, current_lng = $2, status = COALESCE($3, status), last_location_update = NOW(), updated_at = NOW() 
         WHERE phone LIKE $4 OR mobile_number LIKE $4 OR whatsapp_number LIKE $4 RETURNING *`,
        [effectiveLat, effectiveLng, status, '%' + clean + '%']
      );
    } else {
      return res.status(400).json({ error: 'driver_id or phone required' });
    }
    res.json(result?.rows?.[0] || { success: true, latitude: effectiveLat, longitude: effectiveLng });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

router.put('/drivers/location', handleDriverLocation);
router.post('/drivers/location', handleDriverLocation);

// 3. Find Nearby Drivers
router.get('/drivers/nearby', async (req, res) => {
  const { lat, lng, radius_km = 5, vehicle_type } = req.query;
  if (!lat || !lng) return res.status(400).json({ error: 'Missing lat/lng' });
  try {
    const result = await pool.query(
      `SELECT id, name, phone_number, vehicle_type, status, latitude, longitude,
       (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + sin(radians($1)) * sin(radians(latitude)))) AS distance
       FROM drivers
       WHERE status = 'online' AND ($3::text IS NULL OR vehicle_type = $3)
       AND (6371 * acos(cos(radians($1)) * cos(radians(latitude)) * cos(radians(longitude) - radians($2)) + sin(radians($1)) * sin(radians(latitude)))) <= $4
       ORDER BY distance ASC LIMIT 20`,
      [lat, lng, vehicle_type || null, radius_km]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Request a New Ride
router.post('/rides', async (req, res) => {
  const {
    customer_phone, passenger_phone, passenger_name,
    service_type, vehicle_category,
    pickup_address, pickup_lat, pickup_lng, pickup_latitude, pickup_longitude,
    dropoff_address, dropoff_lat, dropoff_lng, dropoff_latitude, dropoff_longitude,
    distance_km, estimated_fare, fare, otp: customOtp, status
  } = req.body;

  try {
    const finalPhone = customer_phone || passenger_phone || '';
    const finalName = passenger_name || 'Passenger';
    const finalService = service_type || vehicle_category || 'bikeo';
    const finalFare = estimated_fare || fare || 0;
    const pLat = pickup_lat || pickup_latitude || 0;
    const pLng = pickup_lng || pickup_longitude || 0;
    const dLat = dropoff_lat || dropoff_latitude || 0;
    const dLng = dropoff_lng || dropoff_longitude || 0;
    const otp = customOtp || Math.floor(1000 + Math.random() * 9000).toString();
    const rideStatus = status || 'requested';

    const result = await pool.query(
      `INSERT INTO rides (
        customer_phone, passenger_phone, passenger_name,
        service_type, vehicle_category,
        pickup_address, pickup_latitude, pickup_longitude,
        dropoff_address, dropoff_latitude, dropoff_longitude,
        distance_km, estimated_fare, fare, otp_pin, otp, status, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())
      RETURNING *`,
      [
        finalPhone, finalPhone, finalName,
        finalService, finalService,
        pickup_address || '', pLat, pLng,
        dropoff_address || '', dLat, dLng,
        distance_km || 0, finalFare, finalFare, otp, otp, rideStatus
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Update Ride Status
router.patch('/rides/:id/status', async (req, res) => {
  const {
    status, driver_id, driver_name, driver_phone,
    vehicle_model, vehicle_number, vehicle_type
  } = req.body;
  const rideId = req.params.id;

  try {
    let resolvedDriverName = driver_name;
    let resolvedDriverPhone = driver_phone;
    let resolvedVehicleModel = vehicle_model || vehicle_type;
    let resolvedVehicleNumber = vehicle_number;

    if (driver_id && (!resolvedDriverName || !resolvedDriverPhone || !resolvedVehicleNumber)) {
      try {
        const dRes = await pool.query('SELECT * FROM drivers WHERE id = $1', [driver_id]);
        if (dRes.rows.length > 0) {
          const d = dRes.rows[0];
          if (!resolvedDriverName) resolvedDriverName = d.name;
          if (!resolvedDriverPhone) resolvedDriverPhone = d.phone_number || d.phone || d.mobile_number;
          if (!resolvedVehicleModel) resolvedVehicleModel = d.vehicle_type;
          if (!resolvedVehicleNumber) resolvedVehicleNumber = d.vehicle_registration;
        }
      } catch (_) {}
    }

    const result = await pool.query(
      `UPDATE rides SET
        status = $1,
        driver_id = COALESCE($2, driver_id),
        driver_name = COALESCE($3, driver_name),
        driver_phone = COALESCE($4, driver_phone),
        vehicle_model = COALESCE($5, vehicle_model),
        vehicle_number = COALESCE($6, vehicle_number),
        accepted_at = CASE WHEN $1 = 'accepted' AND accepted_at IS NULL THEN NOW() ELSE accepted_at END,
        updated_at = NOW()
       WHERE id = $7
       RETURNING *`,
      [
        status,
        driver_id || null,
        resolvedDriverName || null,
        resolvedDriverPhone || null,
        resolvedVehicleModel || null,
        resolvedVehicleNumber || null,
        rideId
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ride not found' });
    }

    const updatedRide = result.rows[0];

    if (status === 'accepted') {
      const passPhone = (updatedRide.passenger_phone || updatedRide.customer_phone || '').replace(/\D/g, '');
      const formattedPassPhone = passPhone.length === 10 ? ('91' + passPhone) : passPhone;
      if (formattedPassPhone) {
        const msg = `🚖 *SuprO Ride Confirmed!*\n\n` +
          `👤 *Driver:* ${updatedRide.driver_name || 'Driver Partner'}\n` +
          `📞 *Contact:* ${updatedRide.driver_phone || 'Available in App'}\n` +
          `🚗 *Vehicle:* ${updatedRide.vehicle_number || ''} (${updatedRide.vehicle_model || updatedRide.service_type})\n\n` +
          `🔑 *Your OTP PIN:* *${updatedRide.otp_pin || updatedRide.otp || '1234'}*\n` +
          `Please share this 4-digit PIN with the driver to start the trip. Have a safe journey!`;
        sendWhatsAppMessage(formattedPassPhone, msg).catch(e => console.warn('[PASSENGER WA NOTIF WARN]', e.message));
      }
    }

    res.json(updatedRide);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Get Rides List (with filters)
router.get('/rides', async (req, res) => {
  try {
    const { phone, driver_id, status, limit } = req.query;
    let query = 'SELECT * FROM rides WHERE 1=1';
    const params = [];

    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      const phone10 = cleanPhone.slice(-10);
      params.push(`%${phone10}%`);
      query += ` AND (customer_phone LIKE $${params.length} OR passenger_phone LIKE $${params.length})`;
    }
    if (driver_id) {
      params.push(driver_id);
      query += ` AND driver_id = $${params.length}`;
    }
    if (status) {
      const statuses = status.split(',').map(s => s.trim().toLowerCase());
      params.push(statuses);
      query += ` AND LOWER(status) = ANY($${params.length})`;
    }

    const maxLimit = Math.min(parseInt(limit) || 50, 100);
    params.push(maxLimit);
    query += ` ORDER BY created_at DESC LIMIT $${params.length}`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 7. Get Pending Rides
router.get('/rides/pending', async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM rides WHERE status IN ('requested', 'pending') ORDER BY created_at DESC LIMIT 20`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 8. Get Single Ride by ID
router.get('/rides/:id', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM rides WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Ride not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 9. Get Single Driver by ID
router.get('/drivers/:id', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM drivers WHERE id = $1`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Driver not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 10. Get Driver by Phone
router.get('/drivers/phone/:phone', async (req, res) => {
  try {
    const result = await pool.query(`SELECT * FROM drivers WHERE phone_number = $1`, [req.params.phone]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Driver not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 11. Update Driver Status
router.patch('/drivers/:id/status', async (req, res) => {
  try {
    const result = await pool.query(`UPDATE drivers SET status = $1 WHERE id = $2 RETURNING *`, [req.body.status, req.params.id]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 12. Driver Action: arrived, started, cancel
router.post('/ride/driver-action', async (req, res) => {
  const { ride_id, action } = req.body;
  if (!ride_id || !action) return res.status(400).json({ error: 'Missing ride_id or action' });
  try {
    let newStatus = 'in_progress';
    let alertText = '';

    const rideRes = await pool.query('SELECT * FROM rides WHERE id = $1', [ride_id]);
    if (rideRes.rows.length === 0) return res.status(404).json({ error: 'Ride not found' });
    const ride = rideRes.rows[0];
    const passPhone = (ride.passenger_phone || ride.customer_phone || '').replace(/\D/g, '');
    const formattedPassPhone = passPhone.length === 10 ? ('91' + passPhone) : passPhone;

    if (action === 'arrived') {
      newStatus = 'driver_arrived';
      alertText = '🚖 *SuprO Ride Update:* Your driver has arrived at the pickup location!\n\n🔑 OTP PIN: *' + (ride.otp_pin || ride.otp || '1234') + '*\nPlease share this PIN with your driver to start the trip.';
      await pool.query('UPDATE rides SET status = $1, updated_at = NOW() WHERE id = $2', [newStatus, ride_id]);
    } else if (action === 'started') {
      newStatus = 'in_progress';
      alertText = '🚗 *SuprO Ride Update:* Your trip has started! Have a safe and pleasant journey.';
      await pool.query('UPDATE rides SET status = $1, started_at = NOW(), updated_at = NOW() WHERE id = $2', [newStatus, ride_id]);
    } else if (action === 'cancel' || action === 'cancelled') {
      newStatus = 'cancelled';
      alertText = '⚠️ *SuprO Ride Update:* Your ride has been cancelled by the driver.';
      await pool.query('UPDATE rides SET status = $1, cancellation_reason = $2, updated_at = NOW() WHERE id = $3', [newStatus, 'Driver Cancelled', ride_id]);
    }

    if (alertText && formattedPassPhone) {
      sendWhatsAppMessage(formattedPassPhone, alertText).catch(e => console.warn('Passenger alert error:', e.message));
    }

    res.json({ success: true, status: newStatus });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 13. Complete Ride
router.post('/rides/complete', async (req, res) => {
  const { ride_id, final_fare } = req.body;
  if (!ride_id) return res.status(400).json({ error: 'Missing ride_id' });
  try {
    const rideRes = await pool.query('SELECT * FROM rides WHERE id = $1', [ride_id]);
    if (rideRes.rows.length === 0) return res.status(404).json({ error: 'Ride not found' });
    const ride = rideRes.rows[0];
    const fare = final_fare || ride.total_fare || ride.estimated_fare || '0';

    await pool.query(
      'UPDATE rides SET status = $1, completed_at = NOW(), total_fare = $2, updated_at = NOW() WHERE id = $3',
      ['completed', fare, ride_id]
    );

    const passPhone = (ride.passenger_phone || ride.customer_phone || '').replace(/\D/g, '');
    const formattedPassPhone = passPhone.length === 10 ? ('91' + passPhone) : passPhone;
    if (formattedPassPhone) {
      const receipt = '🏁 *SuprO Ride Completed!* 🎉\n\n💰 Total Fare: *₹' + fare + '*\n📍 From: ' + (ride.pickup_address || 'Pickup') + '\n🎯 To: ' + (ride.dropoff_address || 'Dropoff') + '\n\nThank you for choosing SuprO! Please rate your ride in the app. ⭐';
      sendWhatsAppMessage(formattedPassPhone, receipt).catch(() => {});
    }

    res.json({ success: true, status: 'completed', fare });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 14. Cancel Ride
router.post('/rides/cancel', async (req, res) => {
  const { ride_id, reason, cancelled_by } = req.body;
  if (!ride_id) return res.status(400).json({ error: 'Missing ride_id' });
  try {
    await pool.query(
      'UPDATE rides SET status = $1, cancellation_reason = $2, cancelled_by = $3, updated_at = NOW() WHERE id = $4',
      ['cancelled', reason || 'Cancelled', cancelled_by || 'user', ride_id]
    );
    res.json({ success: true, status: 'cancelled' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 15. Rate Ride
router.post('/rides/rate', async (req, res) => {
  const { ride_id, rating, review } = req.body;
  if (!ride_id) return res.status(400).json({ error: 'Missing ride_id' });
  try {
    await pool.query(
      'UPDATE rides SET driver_rating = $1, review = $2, updated_at = NOW() WHERE id = $3',
      [rating || 5, review || '', ride_id]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 16. Request Driver WhatsApp Dispatch
router.post('/ride/request-driver', async (req, res) => {
  const { driver_phone, passenger_name, passenger_phone, pickup_address, dropoff_address, distance_km, estimated_fare } = req.body;
  if (!driver_phone) return res.status(400).json({ error: 'driver_phone required' });
  try {
    const cleanDrv = driver_phone.replace(/\D/g, '');
    const formattedDrv = cleanDrv.length === 10 ? ('91' + cleanDrv) : cleanDrv;

    const dispatchText =
      '🚨 *NEW SUPRO RIDE DISPATCH!* 🚖\n\n' +
      '👤 *Passenger:* ' + (passenger_name || 'Customer') + ' (+91 ' + (passenger_phone || '') + ')\n' +
      '📍 *Pickup:* ' + (pickup_address || 'Current Location') + '\n' +
      '🎯 *Dropoff:* ' + (dropoff_address || 'Destination') + '\n' +
      '📏 *Distance:* ' + (distance_km || '1') + ' km\n' +
      '💰 *Estimated Fare:* ₹' + (estimated_fare || '50') + '\n\n' +
      '📲 Open your SuprO DriveO app to view and accept this ride!';

    await sendWhatsAppMessage(formattedDrv, dispatchText);
    res.json({ success: true, message: 'Dispatch alert sent via WhatsApp' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 17. User Profile Update
router.post('/profile/update', async (req, res) => {
  const { userId, phone, full_name, upi_id, location, main_category, role, gemini_api_key, latitude, longitude, avatar_url } = req.body;
  if (!userId && !phone) return res.status(400).json({ error: 'userId or phone required' });
  try {
    const cleanPhone = phone ? phone.replace(/\D/g, '').slice(-10) : null;
    let sql = 'UPDATE profiles SET updated_at = NOW()';
    const params = [];

    if (full_name !== undefined) { params.push(full_name); sql += ', full_name = $' + params.length; }
    if (upi_id !== undefined) { params.push(upi_id); sql += ', upi_id = $' + params.length; }
    if (location !== undefined) { params.push(location); sql += ', location = $' + params.length; }
    if (main_category !== undefined) { params.push(main_category); sql += ', main_category = $' + params.length; }
    if (role !== undefined) { params.push(role); sql += ', role = $' + params.length; }
    if (gemini_api_key !== undefined) { params.push(gemini_api_key); sql += ', gemini_api_key = $' + params.length; }
    if (latitude !== undefined && latitude !== null) { params.push(latitude); sql += ', latitude = $' + params.length; }
    if (longitude !== undefined && longitude !== null) { params.push(longitude); sql += ', longitude = $' + params.length; }
    if (avatar_url !== undefined) { params.push(avatar_url); sql += ', avatar_url = $' + params.length; }

    if (userId) {
      params.push(userId);
      sql += ' WHERE id = $' + params.length + ' RETURNING *';
    } else {
      params.push('%' + cleanPhone + '%');
      sql += ' WHERE phone LIKE $' + params.length + ' OR whatsapp LIKE $' + params.length + ' RETURNING *';
    }

    const result = await pool.query(sql, params);
    res.json({ success: true, profile: result.rows[0] || null });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
