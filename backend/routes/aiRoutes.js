const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/aiController');

// ── AI / Gemma endpoints ──
router.get('/status',     ctrl.getStatus);        // GET /api/ai/status  — health check
router.get('/:id',        ctrl.getInsights);       // GET /api/ai/:id    — per-employee insights
router.post('/batch',     ctrl.batchInsights);      // POST /api/ai/batch — batch processing

module.exports = router;
