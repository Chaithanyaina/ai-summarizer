// backend/services/aiService.js
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const FALLBACK_MESSAGE =
  'Summary could not be generated at this time. Please check the transcript or try a different prompt.';

// 🔹 Helper to build consistent prompt
const buildPrompt = (transcript, userPrompt) => `
Based on the following transcript, please perform this task: "${userPrompt}".

Transcript:
---
${transcript}
---

IMPORTANT: Please format your entire response strictly in Markdown. 
Use bullet points (using hyphens or asterisks), bold text (using **bold**), 
and newlines where appropriate to ensure the output is clean and well-structured.
`;

/**
 * Generates a summary as a stream from the Gemini API.
 * @param {string} transcript
 * @param {string} prompt
 * @returns {Promise<AsyncGenerator<string>>} Stream of text chunks
 */
export const getAiSummaryStream = async (transcript, prompt) => {
  try {
    const fullPrompt = buildPrompt(transcript, prompt);
    const result = await model.generateContentStream(fullPrompt);

    async function* streamGenerator() {
      for await (const chunk of result.stream) {
        yield chunk.text();
      }
    }
    return streamGenerator(); // Return the executed generator
  } catch (error) {
    console.error('Error in getAiSummaryStream:', error);
    async function* fallback() {
      yield FALLBACK_MESSAGE;
    }
    return fallback(); // Return executed fallback
  }
};

/**
 * Generates a complete summary using the Gemini API.
 */
export const getAiSummary = async (transcript, prompt) => {
  try {
    const fullPrompt = buildPrompt(transcript, prompt);

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const summaryText = response.text();

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
