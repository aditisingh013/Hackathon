const axios = require('axios');

// ────────────────────────────────────────────────────────────
//  AI Service — Gemma 4 via Ollama
//
//  Connects to a locally running Ollama instance to generate
//  burnout risk assessments and actionable recommendations.
//
//  Setup:
//    1. Install Ollama:  https://ollama.com/download
//    2. Pull model:      ollama pull gemma4
//    3. Ollama auto-starts its server on :11434
// ────────────────────────────────────────────────────────────

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL_ENV = process.env.OLLAMA_MODEL || 'gemma4';

/**
 * ── Resolve the exact model name installed in Ollama ──
 * Ollama may register "gemma4" as "gemma4:latest".
 * We fetch the tag list and fuzzy-match the configured model.
 */
async function resolveModelName() {
  try {
    const res = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, { timeout: 5000 });
    const models = (res.data.models || []).map(m => m.name);
    if (models.length === 0) return null; // nothing installed yet

    // Exact match first
    if (models.includes(OLLAMA_MODEL_ENV)) return OLLAMA_MODEL_ENV;
    // Prefix match (e.g. env="gemma4" → installed="gemma4:latest")
    const prefix = models.find(m => m.startsWith(OLLAMA_MODEL_ENV.split(':')[0]));
    if (prefix) return prefix;

    return null; // model not found
  } catch (_) {
    return null;
  }
}

/**
 * Build a structured prompt from employee data.
 */
function buildPrompt(employee) {
  const recentLogs = (employee.activityLogs || []).slice(-7);

  const avgHours = recentLogs.length > 0
    ? (recentLogs.reduce((sum, l) => sum + l.hoursWorked, 0) / recentLogs.length).toFixed(1)
    : 'N/A';
  const avgTasks = recentLogs.length > 0
    ? (recentLogs.reduce((sum, l) => sum + l.tasksCompleted, 0) / recentLogs.length).toFixed(1)
    : 'N/A';
  const avgSentiment = recentLogs.length > 0
    ? (recentLogs.reduce((sum, l) => sum + (l.sentimentScore || 70), 0) / recentLogs.length).toFixed(0)
    : 'N/A';

  return `You are an expert HR analytics AI. Analyze this employee data and detect burnout risk.

EMPLOYEE PROFILE:
- Name: ${employee.name}
- Department: ${employee.department}
- Role: ${employee.role || 'N/A'}
- Productivity Score: ${employee.productivityScore}/100
- Workload: ${employee.workload}% of capacity
- Burnout Risk Flag: ${employee.burnoutRisk}
- Sentiment Score: ${employee.sentimentScore}/100

RECENT ACTIVITY (Last 7 Days):
- Average Hours Worked/Day: ${avgHours}
- Average Tasks Completed/Day: ${avgTasks}
- Average Sentiment Score: ${avgSentiment}/100
${recentLogs.map(l => `  - ${new Date(l.date).toLocaleDateString()}: ${l.hoursWorked}h, ${l.tasksCompleted} tasks, sentiment ${l.sentimentScore || 'N/A'}`).join('\n')}

Respond ONLY in this exact JSON format (no extra text, no markdown):
{
  "riskLevel": "Low",
  "keyInsights": ["insight1", "insight2"],
  "recommendations": ["rec1", "rec2"]
}`;
}

/**
 * Call Ollama /api/generate with the built prompt.
 * Auto-detects the correct installed model name.
 */
async function generateInsights(employee) {
  const model = await resolveModelName();

  if (!model) {
    console.warn(`⚠️  [AI] No model installed in Ollama yet. Using rule-based fallback for ${employee.name}.`);
    console.warn(`⚠️  [AI] Run: ollama pull gemma4   (then restart backend)`);
    return generateFallbackInsights(employee);
  }

  console.log(`🤖 [AI] Generating insights for: ${employee.name} using model: ${model}`);

  try {
    const response = await axios.post(
      `${OLLAMA_BASE_URL}/api/generate`,
      {
        model,               // ← uses the resolved, installed model name
        prompt: buildPrompt(employee),
        stream: false,       // must be false — we want a single complete response
        options: {
          temperature: 0.3,
          num_predict: 400,
        },
      },
      { timeout: 90000 }    // 90s timeout — first run may be slow (model loading)
    );

    // ── Critical: response lives at response.data.response ──
    const rawText = response.data?.response;

    if (!rawText) {
      console.error('[AI] Empty response from Ollama. response.data:', JSON.stringify(response.data).substring(0, 300));
      return generateFallbackInsights(employee);
    }

    console.log(`✅ [AI] Raw response for ${employee.name}:`, rawText.substring(0, 200));
    const parsed = parseAIResponse(rawText);
    return { ...parsed, rawResponse: rawText, generatedAt: new Date(), source: 'gemma-ai' };

  } catch (error) {
    // Print full error for debugging
    const detail = error.response?.data
      ? JSON.stringify(error.response.data).substring(0, 300)
      : error.message;
    console.error(`❌ [AI] Ollama request failed: ${detail}`);
    return generateFallbackInsights(employee);
  }
}

/**
 * Parse the AI JSON response, stripping any markdown wrappers.
 */
function parseAIResponse(text) {
  try {
    // Strip markdown code fences like ```json ... ```
    const stripped = text.replace(/```json?\n?/gi, '').replace(/```/g, '').trim();
    // Extract first JSON object
    const jsonMatch = stripped.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        riskLevel:       ['Low', 'Medium', 'High'].includes(parsed.riskLevel) ? parsed.riskLevel : 'Medium',
        keyInsights:     Array.isArray(parsed.keyInsights) ? parsed.keyInsights : [],
        recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : [],
      };
    }
  } catch (e) {
    console.warn('[AI] JSON parse failed, using fallback:', e.message);
  }
  return { riskLevel: 'Medium', keyInsights: [], recommendations: [] };
}

/**
 * Rule-based fallback when Ollama/Gemma is unavailable.
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

  if (avgHours > 10 || sentiment < 40 || workload > 120) {
    riskLevel = 'High';
    keyInsights.push('Employee shows critical burnout indicators requiring immediate attention');
    if (avgHours > 10) keyInsights.push(`Averaging ${avgHours.toFixed(1)} hours/day — significantly above healthy threshold`);
    if (sentiment < 40) keyInsights.push(`Sentiment score (${sentiment}) is critically low`);
    if (workload > 120) keyInsights.push(`Workload at ${workload}% — well above safe capacity`);
    recommendations.push('Schedule an immediate 1-on-1 check-in this week');
    recommendations.push('Redistribute workload to bring capacity below 100%');
    recommendations.push('Approve any pending leave requests');
  } else if (avgHours > 9 || sentiment < 55 || workload > 100) {
    riskLevel = 'Medium';
    keyInsights.push('Employee shows moderate burnout risk signals');
    if (avgHours > 9) keyInsights.push(`Averaging ${avgHours.toFixed(1)} hours/day — slightly above healthy threshold`);
    if (workload > 100) keyInsights.push(`Workload at ${workload}% — monitor closely`);
    recommendations.push('Monitor workload trends closely this sprint');
    recommendations.push('Consider implementing no-meeting days to restore focus time');
    recommendations.push('Check in informally every 2 weeks');
  } else {
    keyInsights.push('Employee appears to have a healthy work-life balance');
    keyInsights.push(`Productivity score of ${employee.productivityScore || 75} is within healthy range`);
    keyInsights.push(`Sentiment score of ${sentiment} indicates positive engagement`);
    recommendations.push('Continue current workload distribution');
    recommendations.push('Consider recognizing recent achievements to maintain morale');
    recommendations.push('Ensure regular career development conversations continue');
  }

  return {
    riskLevel,
    keyInsights,
    recommendations,
    rawResponse: `[Fallback] Rule-based analysis. Gemma AI not yet available — model still downloading.`,
    generatedAt: new Date(),
    source: 'rule-based-fallback',
  };
}

/**
 * Check Ollama health + model availability.
 */
async function checkOllamaStatus() {
  try {
    const res = await axios.get(`${OLLAMA_BASE_URL}/api/tags`, { timeout: 5000 });
    const models = res.data.models || [];
    const resolvedModel = await resolveModelName();
    return {
      running:        true,
      modelAvailable: !!resolvedModel,
      resolvedModel,
      configuredModel: OLLAMA_MODEL_ENV,
      models:         models.map(m => m.name),
      baseUrl:        OLLAMA_BASE_URL,
    };
  } catch (error) {
    return {
      running:        false,
      modelAvailable: false,
      error:          error.message,
      configuredModel: OLLAMA_MODEL_ENV,
      baseUrl:        OLLAMA_BASE_URL,
    };
  }
}

module.exports = { generateInsights, checkOllamaStatus, generateFallbackInsights };
