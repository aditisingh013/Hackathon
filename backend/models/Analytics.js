const mongoose = require('mongoose');

// ────────────────────────────────────────────────────────────
//  Analytics Schema
//  Stores daily org-wide snapshots for trend visualization.
//  Pre-computed by the analytics service and served as-is.
// ────────────────────────────────────────────────────────────
const analyticsSchema = new mongoose.Schema({
  date: { type: Date, required: true, unique: true },

  // ── Org-wide metrics ──
  totalEmployees:      { type: Number, default: 0 },
  avgProductivity:     { type: Number, default: 0 },
  avgSentiment:        { type: Number, default: 0 },
  avgHoursWorked:      { type: Number, default: 0 },

  // ── Burnout distribution ──
  burnoutDistribution: {
    low:    { type: Number, default: 0 },
    medium: { type: Number, default: 0 },
    high:   { type: Number, default: 0 },
  },

  // ── Department breakdown ──
  departmentStats: [{
    department:        { type: String },
    avgProductivity:   { type: Number },
    avgWorkload:       { type: Number },
    employeeCount:     { type: Number },
  }],
}, {
  timestamps: true,
});

analyticsSchema.index({ date: -1 });

module.exports = mongoose.model('Analytics', analyticsSchema);
