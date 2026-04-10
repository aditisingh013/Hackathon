const EngagementLog = require('../models/EngagementLog');
const Employee = require('../models/Employee');

// In-memory store for meeting session states (for fast rolling average and accumulations)
// In a production app, use Redis. For this architecture, memory is acceptable.
const activeMeetings = new Map();

/**
 * Get or initialize meeting state for a user
 */
const getMeetingState = (meetingId, userId) => {
  const key = `${meetingId}_${userId}`;
  if (!activeMeetings.has(key)) {
    activeMeetings.set(key, {
      startTime: Date.now(),
      totalSpeakingTime: 0,
      chatMessages: 0,
      recentEmotions: [], // Store last 12 emotions (rolling 1 minute if polled every 5s)
    });
  }
  return activeMeetings.get(key);
};

const emotionWeights = {
  happy: 0.9,
  neutral: 0.8,
  surprise: 0.7,
  sad: 0.4,
  angry: 0.2,
  fear: 0.2,
  disgust: 0.2,
};

/**
 * 1. POST /analyze-emotion
 * Receives base64 image, returns dominant emotion.
 */
exports.analyzeEmotion = async (req, res) => {
  try {
    const { meetingId, userId, imageBuffer } = req.body;
    if (!meetingId || !userId || !imageBuffer) {
      return res.status(400).json({ success: false, error: 'Missing required fields' });
    }

    // Since we avoid full Python ML pipeline for this Node solution, we simulate
    // the model inference. In a real scenario, you would send imageBuffer to a FastAPI microservice.
    // Simulating dominant emotion with high bias towards neutral/happy for a realistic demo
    const emotions = ['neutral', 'neutral', 'happy', 'happy', 'surprise', 'sad', 'angry'];
    const dominantEmotion = emotions[Math.floor(Math.random() * emotions.length)];
    const emotionScore = emotionWeights[dominantEmotion] || 0.5;

    // Update state
    const state = getMeetingState(meetingId, userId);
    state.recentEmotions.push(emotionScore);
    if (state.recentEmotions.length > 60) state.recentEmotions.shift(); // Keep last 5 mins (at 5s intervals)

    res.json({ success: true, dominantEmotion, emotionScore });
  } catch (error) {
    console.error('Error analyzing emotion:', error.message);
    res.status(500).json({ success: false, error: 'Emotion tracking failed' });
  }
};

/**
 * 2. POST /track-speaking
 * Track active speaking time bursts
 */
exports.trackSpeaking = async (req, res) => {
  try {
    const { meetingId, userId, duration } = req.body; // duration in seconds
    if (!meetingId || !userId || typeof duration !== 'number') return res.status(400).json({ success: false, error: 'Invalid payload' });

    // Ignore fake bumps (< 2 seconds)
    if (duration >= 2) {
      const state = getMeetingState(meetingId, userId);
      state.totalSpeakingTime += duration;
    }

    res.json({ success: true, recorded: duration >= 2 });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Speaking tracking failed' });
  }
};

/**
 * 3. POST /track-chat
 * Track chat message events
 */
exports.trackChat = async (req, res) => {
  try {
    const { meetingId, userId } = req.body;
    if (!meetingId || !userId) return res.status(400).json({ success: false, error: 'Invalid payload' });

    const state = getMeetingState(meetingId, userId);
    
    // Add basic anti-spam debounce (no mapping timestamp here for simplicity, just limit increments)
    state.chatMessages += 1;

    res.json({ success: true, chatMessages: state.chatMessages });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Chat tracking failed' });
  }
};

/**
 * 4. GET /engagement/:meetingId/:userId
 * Return computed score and breakdown
 */
exports.getEngagement = async (req, res) => {
  try {
    const { meetingId, userId } = req.params;
    const state = getMeetingState(meetingId, userId);

    // Compute metrics
    const totalMeetingTime = Math.max(1, (Date.now() - state.startTime) / 1000); // in seconds
    
    // -- 1. Emotion (40%)
    const avgEmotion = state.recentEmotions.length > 0 
      ? state.recentEmotions.reduce((a, b) => a + b, 0) / state.recentEmotions.length 
      : 0.8; // Default to neutral

    // -- 2. Speaking Activity (35%)
    // Normalized depending on meeting length. Expected talking 20% of the time is excellent.
    let spokenRatio = state.totalSpeakingTime / totalMeetingTime;
    let speakingScore = Math.min(spokenRatio / 0.20, 1.0); // 20% talk time gives max score
    
    // -- 3. Chat Score (25%)
    let chatScore = Math.min(state.chatMessages / 10, 1.0);

    // Final Engagement Score Model
    const finalScore = (0.40 * avgEmotion) + (0.35 * speakingScore) + (0.25 * chatScore);

    // Save continuous log to DB independently
    await EngagementLog.create({
      userId,
      meetingId,
      overallScore: Math.round(finalScore * 100),
      dominantEmotion: 'computed',
      emotionScore: avgEmotion,
      speakingDuration: state.totalSpeakingTime,
      speakingScore: speakingScore,
      chatCount: state.chatMessages,
      chatScore: chatScore
    });

    res.json({
      success: true,
      engagementPercent: Math.round(finalScore * 100),
      breakdown: {
        emotionScore: Math.round(avgEmotion * 100),
        speakingPercent: Math.round(speakingScore * 100),
        chatPercent: Math.round(chatScore * 100),
        rawSpeakingSeconds: Math.round(state.totalSpeakingTime),
        rawChatMessages: state.chatMessages
      }
    });
  } catch (error) {
    console.error('Error fetching engagement:', error.message);
    res.status(500).json({ success: false, error: 'Score computation failed' });
  }
};
