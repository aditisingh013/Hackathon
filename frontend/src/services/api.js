const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Helper to handle fetch responses and error unwrapping.
 */
async function fetchApi(endpoint, options = {}) {
  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    
    const data = await response.json();
    if (!response.ok || data.success === false) {
      throw new Error(data.error || 'API Request Failed');
    }
    return data;
  } catch (error) {
    console.error(`Error in API call to ${endpoint}:`, error);
    throw error;
  }
}

// ── Employees ──
export const getEmployees = async (filters = {}) => {
  const query = new URLSearchParams(filters).toString();
  return fetchApi(`/employees${query ? `?${query}` : ''}`);
};

export const getEmployeeById = async (id) => {
  return fetchApi(`/employees/${id}`);
};

// ── Analytics ──
export const getAnalyticsProductivity = async () => {
  return fetchApi(`/analytics/productivity`);
};

export const getAnalyticsBurnout = async () => {
  return fetchApi(`/analytics/burnout`);
};

export const getAnalyticsAnomalies = async () => {
  return fetchApi(`/analytics/anomalies`);
};

// ── AI & Sentiment ──
export const getAIInsights = async (id, force = false) => {
  return fetchApi(`/ai/${id}${force ? '?force=true' : ''}`);
};

export const analyzeSentiment = async (payload) => {
  // payload: { employeeId, message, source }
  return fetchApi(`/sentiment/analyze`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const getSentimentHistory = async (employeeId) => {
  return fetchApi(`/sentiment/${employeeId}`);
};

export const getSentimentTrends = async (employeeId) => {
  return fetchApi(`/sentiment/trends/${employeeId}`);
};
