const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/analyticsController');

// ── Analytics endpoints for dashboard ──
router.get('/productivity', ctrl.getProductivity);  // GET /api/analytics/productivity
router.get('/burnout',      ctrl.getBurnout);        // GET /api/analytics/burnout
router.get('/anomalies',    ctrl.getAnomalies);      // GET /api/analytics/anomalies

module.exports = router;
