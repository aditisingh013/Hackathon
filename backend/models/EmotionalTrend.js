const mongoose = require('mongoose');

const emotionalTrendSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  date: { type: Date, required: true }, // Typically stored as start of the day (YYYY-MM-DD)
  
  avgSentimentScore: { type: Number, default: 0 },
  messageCount: { type: Number, default: 0 },
  
  // Counts of each emotional state for this day
  distribution: {
    positive: { type: Number, default: 0 },
    neutral: { type: Number, default: 0 },
    frustrated: { type: Number, default: 0 },
    exhausted: { type: Number, default: 0 }
  },
  
  // Drift analytics
  trendDescription: { type: String },
  burnoutSignal: { type: Boolean, default: false }
});

// Composite unique index ensures only one trend doc per employee per day
emotionalTrendSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('EmotionalTrend', emotionalTrendSchema);
