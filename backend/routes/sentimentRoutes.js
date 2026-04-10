const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/sentimentController');

// Emotion tracking and sentiment analysis
router.post('/analyze', ctrl.analyzeSingle);
router.post('/bulk', ctrl.analyzeBulk);
router.get('/:employeeId', ctrl.getHistory);
router.get('/trends/:employeeId', ctrl.getTrends);

module.exports = router;
