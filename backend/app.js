const express = require('express');
const cors = require('cors');

// Import Domain Routers
const authRoutes = require('./routes/auth');
const wacrmRoutes = require('./routes/wacrm');
const rideoRoutes = require('./routes/rideo');
const dealoRoutes = require('./routes/dealo');
const rentoRoutes = require('./routes/rento');
const groupoRoutes = require('./routes/groupo');
const teachoRoutes = require('./routes/teacho');
const agroRoutes = require('./routes/agro');
const gameoRoutes = require('./routes/gameo');

const app = express();

// Global Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Root Welcome Route
app.get('/', (req, res) => {
  res.status(200).send(`
    <html>
      <body style="font-family: Arial, sans-serif; text-align: center; margin-top: 50px;">
        <h1>🚀 SuprO Unified Super App Backend is Live!</h1>
        <p>This is the high-performance OCI API gateway for RideO, DealO, RentO, GroupO, TutO, and WaCRM.</p>
        <p>Status: <span style="color: green; font-weight: bold;">Online & Healthy</span></p>
      </body>
    </html>
  `);
});

// System Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    message: 'Supro CRM Backend is running!',
    node_version: process.version,
    timestamp: new Date().toISOString()
  });
});

// Mount Domain Routers
app.use('/api/auth', authRoutes);
app.use('/api/dealo', dealoRoutes);
app.use('/api/rento', rentoRoutes);
app.use('/api/groupo', groupoRoutes);
app.use('/api/tuto', teachoRoutes);

// Legacy backward-compatibility alias for QBank search (/api/qbank/search)
app.use('/api/qbank', teachoRoutes);

// Agro & Farm Media
app.use('/api/agro', agroRoutes);
app.use('/api', agroRoutes);

// GameO & Rewards
app.use('/api/gameo', gameoRoutes);
app.use('/api', gameoRoutes);

// General Core Ecosystem Routers
app.use('/api', rideoRoutes);
app.use('/api', wacrmRoutes);

// Centralized 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found', path: req.originalUrl });
});

// Centralized Error Handler
app.use((err, req, res, next) => {
  console.error('[UNHANDLED ERROR]', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {})
  });
});

module.exports = app;
