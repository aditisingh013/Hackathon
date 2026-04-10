const Employee  = require('../models/Employee');
const aiService = require('../services/ai/aiService');

// ────────────────────────────────────────────────────────────
//  AI Controller
//  Generates and caches AI insights per employee.
// ────────────────────────────────────────────────────────────

/**
 * GET /api/ai/:id
 * Generate AI insights for a specific employee using Gemma 4 via Ollama.
 * Results are cached on the employee document to avoid repeated calls.
 */
exports.getInsights = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, error: 'Employee not found' });
    }

    // ── Check cache: re-use if generated within the last hour ──
    const cacheAge = employee.lastAIInsight?.generatedAt
      ? (Date.now() - new Date(employee.lastAIInsight.generatedAt).getTime()) / 1000 / 60
      : Infinity;

    if (cacheAge < 60 && !req.query.force) {
      return res.json({
        success: true,
        cached:  true,
        data:    employee.lastAIInsight,
      });
    }

    // ── Generate fresh insights ──
    console.log(`🤖 Generating AI insights for: ${employee.name}`);
    const insights = await aiService.generateInsights(employee);

    // ── Cache result on employee document ──
    employee.lastAIInsight = insights;

    // Also update the burnout risk based on AI assessment
    if (insights.riskLevel) {
      employee.burnoutRisk = insights.riskLevel;
    }

    await employee.save();

    res.json({
      success: true,
      cached:  false,
      data:    insights,
    });
  } catch (error) {
    console.error('Error generating AI insights:', error.message);
    res.status(500).json({ success: false, error: 'Failed to generate insights' });
  }
};

/**
 * POST /api/ai/batch
 * Generate AI insights for all high-risk employees.
 * Useful for batch processing during off-peak hours.
 */
exports.batchInsights = async (req, res) => {
  try {
    const employees = await Employee.find({
      $or: [
        { burnoutRisk: 'High' },
        { burnoutRisk: 'Medium' },
      ],
    });

    const results = [];
    for (const emp of employees) {
      try {
        const insights = await aiService.generateInsights(emp);
        emp.lastAIInsight = insights;
        if (insights.riskLevel) emp.burnoutRisk = insights.riskLevel;
        await emp.save();
        results.push({ id: emp._id, name: emp.name, riskLevel: insights.riskLevel, status: 'success' });
      } catch (err) {
        results.push({ id: emp._id, name: emp.name, status: 'failed', error: err.message });
      }
    }

    res.json({
      success: true,
      processed: results.length,
      data: results,
    });
  } catch (error) {
    console.error('Error in batch AI processing:', error.message);
    res.status(500).json({ success: false, error: 'Batch processing failed' });
  }
};

/**
 * GET /api/ai/status
 * Check if Ollama and the Gemma model are available.
 */
exports.getStatus = async (req, res) => {
  try {
    const status = await aiService.checkOllamaStatus();
    res.json({ success: true, data: status });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
