const mongoose = require('mongoose');

const engagementLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  meetingId: { type: String, required: true },
  
  // Scoring
  overallScore: { type: Number, default: 0 },
  
  // Emotion metrics
  dominantEmotion: { type: String, default: 'neutral' },
  emotionScore: { type: Number, default: 0 },
  
  // Speaking metrics
  speakingDuration: { type: Number, default: 0 }, // in seconds
  speakingScore: { type: Number, default: 0 },
  
  // Chat metrics
  chatCount: { type: Number, default: 0 },
  chatScore: { type: Number, default: 0 },

  timestamp: { type: Date, default: Date.now }
});

// Index for quick retrieval by meeting limit to last 5 mins etc.
engagementLogSchema.index({ meetingId: 1, userId: 1, timestamp: -1 });

module.exports = mongoose.model('EngagementLog', engagementLogSchema);
