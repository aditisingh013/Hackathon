const axios = require('axios');

// ────────────────────────────────────────────────────────────
//  AI Service — Gemma 4 via Ollama
//
//  Connects to a locally running Ollama instance to generate
//  burnout risk assessments and actionable recommendations.
//
//  Setup:
//    1. Install Ollama:  https://ollama.com/download
//    2. Pull model:      ollama pull gemma3:4b
//    3. Ollama auto-starts its server on :11434
// ────────────────────────────────────────────────────────────

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL    = process.env.OLLAMA_MODEL || 'gemma3:4b';

/**
 * Build a structured prompt from employee data.
 * The prompt is designed to elicit a JSON-parseable response
 * with risk level, key insights, and recommendations.
 */
function buildPrompt(employee) {
  const recentLogs = (employee.activityLogs || []).slice(-7); // last 7 days

  const avgHours = recentLogs.length > 0
    ? (recentLogs.reduce((sum, l) => sum + l.hoursWorked, 0) / recentLogs.length).toFixed(1)
    : 'N/A';

  const avgTasks = recentLogs.length > 0
    ? (recentLogs.reduce((sum, l) => sum + l.tasksCompleted, 0) / recentLogs.length).toFixed(1)
    : 'N/A';

  const avgSentiment = recentLogs.length > 0
    ? (recentLogs.reduce((sum, l) => sum + (l.sentimentScore || 70), 0) / recentLogs.length).toFixed(0)
    : 'N/A';

  return `You are an expert HR analytics AI. Analyze this employee's data and detect burnout risk.

EMPLOYEE PROFILE:
- Name: ${employee.name}
- Department: ${employee.department}
- Role: ${employee.role || 'N/A'}
- Current Productivity Score: ${employee.productivityScore}/100
- Current Workload: ${employee.workload}% of capacity
- Current Burnout Risk Flag: ${employee.burnoutRisk}
- Sentiment Score: ${employee.sentimentScore}/100
- Status: ${employee.status}

RECENT ACTIVITY (Last 7 Days):
- Average Hours Worked/Day: ${avgHours}
- Average Tasks Completed/Day: ${avgTasks}
- Average Sentiment Score: ${avgSentiment}/100
${recentLogs.map(l => `  • ${new Date(l.date).toLocaleDateString()}: ${l.hoursWorked}h worked, ${l.tasksCompleted} tasks, sentiment ${l.sentimentScore || 'N/A'}`).join('\n')}

BURNOUT INDICATORS TO EVALUATE:
1. Consistently working > 9 hours/day
2. Weekend/overtime patterns
3. Declining task completion despite long hours
4. Low or declining sentiment scores
5. Workload exceeding 100% capacity

Respond in this exact JSON format (no markdown, no code blocks):
{
  "riskLevel": "Low" | "Medium" | "High",
  "keyInsights": ["insight1", "insight2", "insight3"],
  "recommendations": ["recommendation1", "recommendation2", "recommendation3"]
}`;
}

/**
 * Call Ollama's /api/generate endpoint with the constructed prompt.
 * Returns parsed AI insights or a fallback if Ollama is unavailable.
 */
async function generateInsights(employee) {
  const prompt = buildPrompt(employee);

  try {
    const response = await axios.post(
      `${OLLAMA_BASE_URL}/api/generate`,
      {
        model: OLLAMA_MODEL,
        prompt,
        stream: false,                // wait for full response
        options: {
          temperature: 0.3,           // low temp for consistency
          num_predict: 500,            // keep response concise
        },
      },
      {
        timeout: 60000,               // 60s timeout — local models can be slow
      }
    );

    const rawText = response.data.response || '';
    console.log(`🤖 AI raw response for ${employee.name}:`, rawText.substring(0, 200));

    // Attempt to parse JSON from the response
    const parsed = parseAIResponse(rawText);
    return {
      ...parsed,
      rawResponse: rawText,
      generatedAt: new Date(),
    };
  } catch (error) {
    console.error(`⚠️  Ollama AI call failed: ${error.message}`);

    // ── Fallback: rule-based analysis when AI is unavailable ──
    return generateFallbackInsights(employee);
  }
}

/**
 * Parse the AI's JSON response, handling common formatting issues.
 */
function parseAIResponse(text) {
  try {
    // Try to extract JSON from the response (model may wrap in markdown)
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        riskLevel:       parsed.riskLevel || 'Medium',
        keyInsights:     Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      };
    }
  } catch (e) {
    console.warn('⚠️  Failed to parse AI JSON, using fallback:', e.message);
  }

  // If parsing fails, return a default
  return generateFallbackInsights({ productivityScore: 75, workload: 80, sentimentScore: 70, activityLogs: [] });
}

/**
 * Rule-based fallback when Ollama/Gemma is unavailable.
 * Uses simple threshold logic to classify burnout risk.
 */
function generateFallbackInsights(employee) {
  const logs = (employee.activityLogs || []).slice(-7);
  const avgHours = logs.length > 0
    ? logs.reduce((s, l) => s + l.hoursWorked, 0) / logs.length
    : 8;
  const sentiment = employee.sentimentScore || 70;
  const workload  = employee.workload || 80;

  let riskLevel = 'Low';
  const keyInsights = [];
  const recommendations = [];

  // ── Classification logic ──
  if (avgHours > 10 || sentiment < 40 || workload > 120) {
    riskLevel = 'High';
    keyInsights.push('Employee shows critical burnout indicators');
    if (avgHours > 10) keyInsights.push(`Averaging ${avgHours.toFixed(1)} hours/day — significantly above healthy threshold`);
    if (sentiment < 40) keyInsights.push(`Sentiment score (${sentiment}) is critically low`);
    recommendations.push('Schedule an immediate 1-on-1 check-in');
    recommendations.push('Redistribute workload to reduce capacity below 100%');
    recommendations.push('Approve any pending leave requests');
  } else if (avgHours > 9 || sentiment < 55 || workload > 100) {
    riskLevel = 'Medium';
    keyInsights.push('Employee shows moderate burnout risk signals');
    if (avgHours > 9) keyInsights.push(`Averaging ${avgHours.toFixed(1)} hours/day — above healthy threshold`);
    recommendations.push('Monitor workload closely this sprint');
    recommendations.push('Consider implementing no-meeting days');
  } else {
    keyInsights.push('Employee appears to have a healthy work-life balance');
    keyInsights.push(`Productivity score of ${employee.productivityScore || 75} is within healthy range`);
    recommendations.push('Continue current workload distribution');
    recommendations.push('Consider recognizing achievements to maintain morale');
  }

  return {
    riskLevel,
    keyInsights,
    recommendations,
    rawResponse: 'Fallback: rule-based analysis (Ollama unavailable)',
    generatedAt: new Date(),
  };
}

/**
 * Check if Ollama is running and the model is available.
 */
async function checkOllamaStatus() {
  try {
    const response = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, { timeout: 5000 });
    const models = response.data.models || [];
    const hasModel = models.some(m => m.name.includes(OLLAMA_MODEL.split(':')[0]));
    return {
      running: true,
      modelAvailable: hasModel,
      models: models.map(m => m.name),
      baseUrl: OLLAMA_BASE_URL,
      configuredModel: OLLAMA_MODEL,
    };
  } catch (error) {
    return {
      running: false,
      modelAvailable: false,
      error: error.message,
      baseUrl: OLLAMA_BASE_URL,
      configuredModel: OLLAMA_MODEL,
    };
  }
}

module.exports = {
  generateInsights,
  checkOllamaStatus,
  generateFallbackInsights,
};
