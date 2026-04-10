const SentimentLog = require('../models/SentimentLog');
const EmotionalTrend = require('../models/EmotionalTrend');
const Employee = require('../models/Employee');
const sentimentAi = require('../services/ai/sentimentAnalysisService');

// ────────────────────────────────────────────────────────────
//  Emotional Drift Calculation
// ────────────────────────────────────────────────────────────
async function updateDailyTrend(employeeId, dateStr) {
  const startOfDay = new Date(dateStr);
  startOfDay.setHours(0, 0, 0, 0);
  
  const endOfDay = new Date(startOfDay);
  endOfDay.setHours(23, 59, 59, 999);

  // Get all logs for this day
  const logs = await SentimentLog.find({
    employeeId,
    timestamp: { $gte: startOfDay, $lte: endOfDay }
  });

  if (logs.length === 0) return null;

  let totalScore = 0;
  const dist = { positive: 0, neutral: 0, frustrated: 0, exhausted: 0 };

  logs.forEach(l => {
    totalScore += l.score;
    const key = l.sentiment.toLowerCase();
    if (dist[key] !== undefined) dist[key]++;
  });

  const avgSentimentScore = totalScore / logs.length;
  
  // Drift/Anomaly Logic
  let burnoutSignal = false;
  let trendDescription = "Stable emotional state.";

  // Detection: Continuous exhaustion or sudden negative drop
  if (avgSentimentScore <= -1.5) {
    burnoutSignal = true;
    trendDescription = "Critical Exhaustion Detected. High burnout risk.";
  } else if (dist.frustrated > dist.neutral && avgSentimentScore < 0) {
    trendDescription = "Elevated frustration levels. Potential blocker or friction.";
  } else if (avgSentimentScore > 1) {
    trendDescription = "Highly positive engagement.";
  }

  // Upsert the trend document
  const trend = await EmotionalTrend.findOneAndUpdate(
    { employeeId, date: startOfDay },
    {
      avgSentimentScore,
      messageCount: logs.length,
      distribution: dist,
      trendDescription,
      burnoutSignal
    },
    { new: true, upsert: true }
  );

  return trend;
}

// ────────────────────────────────────────────────────────────
//  Controllers
// ────────────────────────────────────────────────────────────

exports.analyzeSingle = async (req, res) => {
  try {
    const { employeeId, message, source } = req.body;
    if (!employeeId || !message) {
      return res.status(400).json({ success: false, error: 'Missing employeeId or message text' });
    }

    const aiResult = await sentimentAi.analyzeMessage(message);

    const log = await SentimentLog.create({
      employeeId,
      message,
      source: source || 'Chat',
      sentiment: aiResult.sentiment,
      score: aiResult.score,
      aiExplanation: aiResult.explanation
    });

    // Update Daily Trend
    await updateDailyTrend(employeeId, new Date());

    res.json({ success: true, data: log });
  } catch (error) {
    console.error('Sentiment Analysis Error:', error.message);
    res.status(500).json({ success: false, error: 'Failed to analyze text' });
  }
};

exports.analyzeBulk = async (req, res) => {
  try {
    const { messages } = req.body; // Array of { employeeId, message, source, timestamp }
    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ success: false, error: 'Expected non-empty messages array' });
    }

    const processedLogs = [];
    const datesToUpdate = new Set();
    
    // Process serially to respect local LLM constraints (Ollama queuing)
    for (const item of messages) {
      const aiResult = await sentimentAi.analyzeMessage(item.message);
      
      const ts = item.timestamp ? new Date(item.timestamp) : new Date();
      
      const log = await SentimentLog.create({
        employeeId: item.employeeId,
        message: item.message,
        source: item.source || 'Other',
        sentiment: aiResult.sentiment,
        score: aiResult.score,
        aiExplanation: aiResult.explanation,
        timestamp: ts
      });
      
      processedLogs.push(log);
      datesToUpdate.add(`${item.employeeId}_${ts.toISOString().split('T')[0]}`);
    }

    // Trigger daily trend recalculations for all affected days/users
    for (const record of datesToUpdate) {
      const [empId, dateStr] = record.split('_');
      await updateDailyTrend(empId, dateStr);
    }

    res.json({ success: true, count: processedLogs.length, data: processedLogs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Bulk processing failed' });
  }
};

exports.getHistory = async (req, res) => {
  try {
    const logs = await SentimentLog.find({ employeeId: req.params.employeeId })
      .sort({ timestamp: -1 })
      .limit(50); // Pagination in real world
      
    res.json({ success: true, data: logs });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Fetch history failed' });
  }
};

exports.getTrends = async (req, res) => {
  try {
    // 30 day history
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
    const trends = await EmotionalTrend.find({ 
      employeeId: req.params.employeeId,
      date: { $gte: thirtyDaysAgo }
    }).sort({ date: 1 });

    // Drift Detection (Mapping Negative Slope Pattern: Positive -> Neutral -> Frustrated -> Exhausted)
    let driftSignal = "Stable";
    if (trends.length >= 3) {
      const recent = trends.slice(-3);
      const isDeclining = recent[0].avgSentimentScore > recent[1].avgSentimentScore && 
                          recent[1].avgSentimentScore > recent[2].avgSentimentScore;
      
      if (isDeclining && recent[2].avgSentimentScore < 0) {
        driftSignal = "Severe Negative Emotional Drift Detected (Rapid Decline)";
      }
    }

    res.json({ 
      success: true, 
      count: trends.length, 
      overallDriftAnalysis: driftSignal,
      data: trends 
    });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Fetch trends failed' });
  }
};
