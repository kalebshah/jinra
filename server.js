const express = require('express');
const cors = require('cors');
const cron = require('node-cron');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const articlesRouter = require('./routes/articles');
const newsService = require('./services/newsService');
const pool = require('./config/database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from public directory
app.use(express.static('public'));

// Routes
app.use('/api/articles', articlesRouter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Background job - fetch news every 30 minutes
cron.schedule('*/30 * * * *', async () => {
  console.log('Running scheduled news fetch...');
  try {
    await newsService.fetchAndSaveNews();
  } catch (error) {
    console.error('Scheduled news fetch failed:', error.message);
  }
});

// Auto-create database tables on startup
async function createTables() {
  try {
    const schema = fs.readFileSync(path.join(__dirname, 'database/schema.sql'), 'utf8');
    await pool.query(schema);
    console.log('Database tables created successfully');
  } catch (error) {
    console.log('Tables may already exist or error creating:', error.message);
  }
}

// Initialize database and fetch news
async function initialize() {
  try {
    await createTables();
    await newsService.fetchAndSaveNews();
    console.log('Initial news fetch completed');
  } catch (error) {
    console.error('Initialization failed:', error.message);
  }
}

// Run initialization
initialize();

// Start server
app.listen(PORT, () => {
  console.log(`⚡ Jinra running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Articles API: http://localhost:${PORT}/api/articles`);
  console.log(`Frontend: http://localhost:${PORT}`);
});

module.exports = app;
