/**
 * sentiment.service.js
 * Analyzes text input (e.g., employee surveys, daily logs) to determine emotional sentiment.
 */
const gemmaClient = require('./gemmaClient');

const analyzeSentiment = async (text) => {
    const prompt = `Analyze the sentiment of this text: "${text}". Is it positive, neutral, or negative?`;
    const response = await gemmaClient.generateResponse(prompt);
    return response;
};

module.exports = {
    analyzeSentiment
};
