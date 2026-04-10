const axios = require('axios');

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma3:4b';

/**
 * 1. Preprocessing Layer
 * Clean noise, basic normalization. Emojis are retained as they encode high emotional context.
 */
function preprocessText(text) {
  if (!text) return '';
  // Remove extreme whitespace / line breaks
  let cleaned = text.replace(/[\r\n]+/g, ' ').replace(/\s{2,}/g, ' ').trim();
  // Lowercase for standard NLP (though LLMs are resilient)
  cleaned = cleaned.toLowerCase();
  return cleaned;
}

/**
 * Assign mapping scores to categorical emotions
 */
const getSentimentScore = (sentimentStr) => {
  const mapping = {
    'Positive': 2,
    'Neutral': 0,
    'Frustrated': -1,
    'Exhausted': -2
  };
  return mapping[sentimentStr] !== undefined ? mapping[sentimentStr] : 0;
};

/**
 * Rule-based fallback if Ollama is unreachable
 */
function ruleBasedFallback(text) {
  const t = text.toLowerCase();
  if (t.includes('tired') || t.includes('done with this') || t.includes('burnt') || t.includes('can\'t keep up')) {
    return { sentiment: 'Exhausted', explanation: 'Fallback: Detected exhaust-related keywords' };
  }
  if (t.includes('annoy') || t.includes('why') || t.includes('stupid') || t.includes('ridiculous') || t.includes('block')) {
    return { sentiment: 'Frustrated', explanation: 'Fallback: Detected frustration indicators' };
  }
  if (t.includes('great') || t.includes('thanks') || t.includes('good') || t.includes('love') || t.includes('awesome')) {
    return { sentiment: 'Positive', explanation: 'Fallback: Positivity indicators present' };
  }
  return { sentiment: 'Neutral', explanation: 'Fallback: No strong emotional keywords detected' };
}

/**
 * 2. NLP Processing Layer
 * Use Gemma 4 / Ollama to classify sentiment.
 */
async function analyzeMessage(text) {
  const processedText = preprocessText(text);

  const prompt = `Analyze this employee message and classify the emotional tone into exactly ONE of these four categories: Positive, Neutral, Frustrated, or Exhausted.

Message: "${processedText}"

Respond ONLY in this strict JSON format (no markdown blocks, no extra text):
{
  "sentiment": "Positive" | "Neutral" | "Frustrated" | "Exhausted",
  "explanation": "Brief 1 sentence reason"
}`;

  try {
    const response = await axios.post(
      `${OLLAMA_BASE_URL}/api/generate`,
      {
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: { temperature: 0.1 } // Very low temp for strict JSON adherence
      },
      { timeout: 15000 }
    );

    const rawText = response.data.response || '';
    
    // Attempt JSON parsing
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      const sentiment = ['Positive', 'Neutral', 'Frustrated', 'Exhausted'].includes(parsed.sentiment) 
        ? parsed.sentiment 
        : 'Neutral';

      return {
        sentiment,
        score: getSentimentScore(sentiment),
        explanation: parsed.explanation || 'No explanation provided by AI.'
      };
    }
    throw new Error('LLM failed to output valid JSON format');
    
  } catch (error) {
    console.warn(`⚠️ Ollama NLP failed (${error.message}). Using rule-based fallback.`);
    const fallback = ruleBasedFallback(processedText);
    return {
      sentiment: fallback.sentiment,
      score: getSentimentScore(fallback.sentiment),
      explanation: fallback.explanation
    };
  }
}

module.exports = {
  preprocessText,
  analyzeMessage,
  getSentimentScore
};
