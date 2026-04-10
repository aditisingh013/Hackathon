/**
 * ═══════════════════════════════════════════════════════════
 *  server.js — Intelligent Employee Burnout Analytics System
 * ═══════════════════════════════════════════════════════════
 *
 *  Entry point for the Express backend.
 *
 *  Tech Stack:
 *    • Node.js + Express
 *    • MongoDB (Mongoose)
 *    • AI: Gemma 4 via Ollama (http://localhost:11434)
 *
 *  API Routes:
 *    /api/employees   — Employee CRUD + activity logs
 *    /api/analytics   — Productivity & burnout analytics
 *    /api/ai          — AI-powered insights via Gemma
 */

require('dotenv').config();

const express      = require('express');
const cors         = require('cors');
const morgan       = require('morgan');
const connectDB    = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// ── Route imports ──
const employeeRoutes  = require('./routes/employeeRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes        = require('./routes/aiRoutes');
const engagementRoutes = require('./routes/engagementRoutes');
const sentimentRoutes = require('./routes/sentimentRoutes');

const app  = express();
const PORT = process.env.PORT || 5000;

// ═══════════════════════════════════════════════════════════
//  MIDDLEWARE
// ═══════════════════════════════════════════════════════════

// CORS — allow frontend origin
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging (concise format in dev)
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// ═══════════════════════════════════════════════════════════
//  ROUTES
// ═══════════════════════════════════════════════════════════

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// Core API routes
app.use('/api/employees',  employeeRoutes);
app.use('/api/analytics',  analyticsRoutes);
app.use('/api/ai',         aiRoutes);
app.use('/api/engagement', engagementRoutes);
app.use('/api/sentiment',  sentimentRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

// Global error handler
app.use(errorHandler);

// ═══════════════════════════════════════════════════════════
//  START SERVER
// ═══════════════════════════════════════════════════════════

async function start() {
  // Connect to MongoDB
  await connectDB();

  const server = app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════╗
║  🚀 Burnout Analytics Backend — Running             ║
║                                                      ║
║  Server:   http://localhost:${PORT}                    ║
║  API:      http://localhost:${PORT}/api                ║
║  Health:   http://localhost:${PORT}/api/health          ║
║  AI:       http://localhost:${PORT}/api/ai/status       ║
║                                                      ║
║  Ollama:   ${process.env.OLLAMA_BASE_URL || 'http://localhost:11434'}             ║
║  Model:    ${process.env.OLLAMA_MODEL || 'gemma3:4b'}                          ║
╚══════════════════════════════════════════════════════╝
    `);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`❌ Port ${PORT} is already in use. Try a different port in .env`);
    } else {
      console.error('❌ Server error:', err.message);
    }
    process.exit(1);
  });
}

start();
