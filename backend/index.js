const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/financeplanner';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Successfully connected to MongoDB database');
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error.message);
    console.warn('⚠️  Running in offline mode with mock data');
    // process.exit(1); // Don't exit, allow mock data fallback
  });

// MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('📊 Mongoose connected to MongoDB');
});
mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});
mongoose.connection.on('disconnected', () => {
  console.log('⚠️  Mongoose disconnected');
});

// API Routes
const assetsRoutes = require('./routes/assets');
const debtsRoutes = require('./routes/debts');
const incomeRoutes = require('./routes/income');
const goalsRoutes = require('./routes/goals');
const projectionRoutes = require('./routes/projection');
const milestonesRoutes = require('./routes/milestones');
const spendingRoutes = require('./routes/spending');

app.use('/api/assets', assetsRoutes);
app.use('/api/debts', debtsRoutes);
app.use('/api/income', incomeRoutes);
app.use('/api/goals', goalsRoutes);
app.use('/api/projection', projectionRoutes);
app.use('/api/milestones', milestonesRoutes);
app.use('/api/spending', spendingRoutes);

// Test Routes
app.get('/api', (req, res) => {
  res.json({
    message: 'Financial Planner API is running',
    status: 'success',
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({
    status: 'healthy',
    database: dbStatus
  });
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📍 API endpoint: http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

// Graceful Shutdown
process.on('SIGINT', async () => {
  console.log('\n⏳ Shutting down gracefully...');
  await mongoose.connection.close();
  console.log('✅ MongoDB connection closed');
  process.exit(0);
});

module.exports = app;
