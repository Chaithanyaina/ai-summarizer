// backend/services/aiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });


const FALLBACK_MESSAGE = 'Summary could not be generated at this time. Please check the transcript or try a different prompt.';

/**
 * Generates a summary using the Gemini API with enforced Markdown formatting.
 * @param {string} transcript - The meeting transcript.
 * @param {string} prompt - The user's instruction for the AI.
 * @returns {Promise<string>} The generated summary in Markdown format or a fallback message.
 */
export const getAiSummary = async (transcript, prompt) => {
  try {
    const fullPrompt = `
      Based on the following transcript, please perform this task: "${prompt}".

      Transcript:
      ---
      ${transcript}
      ---

      IMPORTANT: Please format your entire response strictly in Markdown. Use bullet points (using hyphens or asterisks), bold text (using **bold**), and newlines where appropriate to ensure the output is clean and well-structured.
    `;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const summaryText = response.text();

    // Safeguard: Check if the AI returned a valid, non-empty response.
    if (!summaryText || summaryText.trim() === '') {
      console.warn('Gemini API returned an empty response.');
      return FALLBACK_MESSAGE;
    }

    return summaryText;

  } catch (error) {
    console.error('Error in getAiSummary:', error);
    return FALLBACK_MESSAGE;
  }
};