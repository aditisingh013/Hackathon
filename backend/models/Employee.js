const mongoose = require('mongoose');

// ────────────────────────────────────────────────────────────
//  Activity Log sub-schema
//  Tracks daily work data points for time-series analysis.
// ────────────────────────────────────────────────────────────
const activityLogSchema = new mongoose.Schema({
  date:           { type: Date, required: true },
  tasksCompleted: { type: Number, default: 0 },
  hoursWorked:    { type: Number, default: 0 },
  meetingHours:   { type: Number, default: 0 },     // meetings eat into deep work
  sentimentScore: { type: Number, min: 0, max: 100, default: 70 }, // self-reported or AI-derived
}, { _id: false });

// ────────────────────────────────────────────────────────────
//  Employee Schema
//  Core entity — stores profile, computed risk scores,
//  and embedded activity logs for fast time-series queries.
// ────────────────────────────────────────────────────────────
const employeeSchema = new mongoose.Schema({
  name:       { type: String, required: true, trim: true },
  email:      { type: String, required: true, unique: true, lowercase: true },
  role:       { type: String, default: 'Individual Contributor' },
  department: { type: String, required: true },
  avatar:     { type: String, default: '' },
  manager:    { type: String, default: '' },
  joinDate:   { type: String, default: '' },
  status:     { type: String, enum: ['Active', 'On Leave', 'Inactive'], default: 'Active' },

  // ── Computed / AI-updated scores ──
  productivityScore: { type: Number, min: 0, max: 100, default: 75 },
  burnoutRisk:       { type: String, enum: ['Low', 'Medium', 'High'], default: 'Low' },
  workload:          { type: Number, min: 0, max: 200, default: 80 },  // % of capacity
  sentimentScore:    { type: Number, min: 0, max: 100, default: 70 },

  // ── Time-series activity data ──
  activityLogs: [activityLogSchema],

  // ── AI-generated insights (cached) ──
  lastAIInsight: {
    generatedAt:     { type: Date },
    riskLevel:       { type: String },
    keyInsights:     [String],
    recommendations: [String],
    rawResponse:     { type: String },
  },
}, {
  timestamps: true,  // createdAt, updatedAt
});

// ── Indexes for common queries ──
employeeSchema.index({ department: 1 });
employeeSchema.index({ burnoutRisk: 1 });
employeeSchema.index({ productivityScore: -1 });

module.exports = mongoose.model('Employee', employeeSchema);
