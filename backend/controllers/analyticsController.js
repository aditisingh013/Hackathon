const analyticsService = require('../services/analyticsService');

// ────────────────────────────────────────────────────────────
//  Analytics Controller
//  Exposes pre-computed analytics endpoints for the dashboard.
// ────────────────────────────────────────────────────────────

/**
 * GET /api/analytics/productivity
 * Returns org-wide productivity metrics + department breakdown.
 */
exports.getProductivity = async (req, res) => {
  try {
    const data = await analyticsService.getProductivityAnalytics();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error computing productivity analytics:', error.message);
    res.status(500).json({ success: false, error: 'Failed to compute analytics' });
  }
};

/**
 * GET /api/analytics/burnout
 * Returns burnout distribution across the workforce.
 */
exports.getBurnout = async (req, res) => {
  try {
    const data = await analyticsService.getBurnoutAnalytics();
    res.json({ success: true, data });
  } catch (error) {
    console.error('Error computing burnout analytics:', error.message);
    res.status(500).json({ success: false, error: 'Failed to compute analytics' });
  }
};

/**
 * GET /api/analytics/anomalies
 * Returns detected anomalies (threshold-based alerts).
 */
exports.getAnomalies = async (req, res) => {
  try {
    const anomalies = await analyticsService.detectAnomalies();
    res.json({ success: true, count: anomalies.length, data: anomalies });
  } catch (error) {
    console.error('Error detecting anomalies:', error.message);
    res.status(500).json({ success: false, error: 'Failed to detect anomalies' });
  }
};
