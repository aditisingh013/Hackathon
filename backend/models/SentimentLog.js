const mongoose = require('mongoose');

const sentimentLogSchema = new mongoose.Schema({
  employeeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  message: { type: String, required: true },
  source: { type: String, enum: ['Email', 'Chat', 'Jira', 'Other'], default: 'Chat' },
  sentiment: { 
    type: String, 
    enum: ['Positive', 'Neutral', 'Frustrated', 'Exhausted'], 
    required: true 
  },
  score: { type: Number, required: true }, // Positive=2, Neutral=0, Frustrated=-1, Exhausted=-2
  aiExplanation: { type: String }, // Gemma's brief explanation
  timestamp: { type: Date, default: Date.now }
});

sentimentLogSchema.index({ employeeId: 1, timestamp: -1 });

module.exports = mongoose.model('SentimentLog', sentimentLogSchema);
