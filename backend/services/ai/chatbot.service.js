/**
 * chatbot.service.js
 * Business logic for the "Burnout Buddy" conversational assistant providing resources and support.
 */
const gemmaClient = require('./gemmaClient');

const processMessage = async (userMessage, chatHistory) => {
    const prompt = `You are Burnout Buddy, an assistant for employee wellbeing. Respond supportively to: "${userMessage}"`;
    const response = await gemmaClient.generateResponse(prompt);
    return response;
};

module.exports = {
    processMessage
};
