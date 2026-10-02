const app = require('./app');
const { initDB } = require('./db');
require('dotenv').config();

const port = process.env.PORT || 8080;

// Initialize Database Schemas (Idempotent CREATE TABLE IF NOT EXISTS)
initDB()
  .then(() => {
    console.log('✅ SuprO Database Schemas verified successfully.');
  })
  .catch((err) => {
    console.error('❌ Error initializing database:', err);
  });

const server = app.listen(port, () => {
  console.log(`🚀 SuprO Modular Backend listening on port ${port} [Node ${process.version}]`);
});

// Graceful Shutdown Signals
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server gracefully');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received: closing HTTP server gracefully');
  server.close(() => {
    console.log('HTTP server closed');
  });
});

module.exports = server;
