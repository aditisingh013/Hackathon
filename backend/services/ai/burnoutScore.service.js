/**
 * burnoutScore.service.js
 * Calculates an employee burnout index based on various factors (hours worked, sentiment, leave patterns).
 */
const gemmaClient = require('./gemmaClient');

const calculateBurnoutScore = async (employeeMetrics) => {
    const prompt = `Based on these metrics: ${JSON.stringify(employeeMetrics)}, calculate a burnout score from 0-100 and give recommendations.`;
    const response = await gemmaClient.generateResponse(prompt);
    return response;
};

module.exports = {
    calculateBurnoutScore
};
