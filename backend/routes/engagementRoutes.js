const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/engagementController');

router.post('/analyze-emotion', ctrl.analyzeEmotion);
router.post('/track-speaking', ctrl.trackSpeaking);
router.post('/track-chat', ctrl.trackChat);
router.get('/:meetingId/:userId', ctrl.getEngagement);

module.exports = router;
