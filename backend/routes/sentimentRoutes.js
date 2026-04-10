const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/sentimentController');

// ⚠️  ORDER MATTERS: specific routes must come before wildcard /:employeeId
router.post('/analyze', ctrl.analyzeSingle);
router.post('/bulk', ctrl.analyzeBulk);
router.get('/trends/:employeeId', ctrl.getTrends);   // must be BEFORE /:employeeId
router.get('/:employeeId', ctrl.getHistory);

module.exports = router;
