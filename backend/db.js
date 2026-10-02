const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'db',
  database: process.env.DB_NAME || 'supro',
  password: process.env.DB_PASSWORD || 'supro_secret',
  port: process.env.DB_PORT || 5432,
});

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        phone_number VARCHAR(50) UNIQUE NOT NULL,
        full_name VARCHAR(255),
        role VARCHAR(50) DEFAULT 'agent',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS otp_sessions (
        id SERIAL PRIMARY KEY,
        phone_number VARCHAR(50) NOT NULL,
        otp_hash VARCHAR(255) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        is_used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS customers (
        id SERIAL PRIMARY KEY,
        phone_number VARCHAR(50) UNIQUE NOT NULL,
        name VARCHAR(255),
        status VARCHAR(50) DEFAULT 'Lead',
        assigned_to INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS contacts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        name TEXT,
        phone TEXT UNIQUE NOT NULL,
        email TEXT,
        pincode TEXT,
        tags TEXT[],
        account_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS conversations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID,
        contact_id UUID,
        status TEXT DEFAULT 'open',
        assigned_agent_id UUID,
        last_message_text TEXT,
        last_message_at TIMESTAMP,
        unread_count INTEGER DEFAULT 0,
        account_id UUID,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS messages (
        id TEXT PRIMARY KEY,
        conversation_id UUID,
        customer_id INTEGER,
        sender VARCHAR(50),
        sender_type TEXT,
        content TEXT,
        content_type TEXT DEFAULT 'text',
        content_text TEXT,
        media_url TEXT,
        template_name TEXT,
        message_id TEXT,
        status VARCHAR(50) DEFAULT 'delivered',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Supro CRM Database Schema Verified Safely (No Drops).');

    // Rideo/Driver Schema Initialization
    const fs = require('fs');
    const path = require('path');
    try {
      const rideoSql = fs.readFileSync(path.join(__dirname, 'schema_rideo.sql'), 'utf8');
      await pool.query(rideoSql);
      console.log('Supro Rideo Schema Initialized.');
    } catch (err) {
      console.error('Failed to init Rideo schema:', err.message);
    }

    // DealO Schema Initialization
    try {
      const dealoSql = fs.readFileSync(path.join(__dirname, 'schema_dealo.sql'), 'utf8');
      await pool.query(dealoSql);
      console.log('Supro DealO Schema Initialized.');
    } catch (err) {
      console.error('Failed to init DealO schema:', err.message);
    }

    // RentO Schema Initialization
    try {
      const rentoSql = fs.readFileSync(path.join(__dirname, 'schema_rento.sql'), 'utf8');
      await pool.query(rentoSql);
      console.log('Supro RentO Schema Initialized.');
    } catch (err) {
      console.error('Failed to init RentO schema:', err.message);
    }

    // GroupO Schema Initialization
    try {
      const groupoSql = fs.readFileSync(path.join(__dirname, 'schema_groupo.sql'), 'utf8');
      await pool.query(groupoSql);
      console.log('Supro GroupO Schema Initialized.');
    } catch (err) {
      console.error('Failed to init GroupO schema:', err.message);
    }

    // Tuto LMS Schema Initialization
    try {
      const tutoSql = fs.readFileSync(path.join(__dirname, 'schema_tuto_lms.sql'), 'utf8');
      await pool.query(tutoSql);
      console.log('Supro Tuto LMS Schema Initialized.');
    } catch (err) {
      console.error('Failed to init Tuto LMS schema:', err.message);
    }

  } catch (error) {
    console.error('Error initializing CRM database tables:', error);
  }
};

module.exports = { pool, initDB };
