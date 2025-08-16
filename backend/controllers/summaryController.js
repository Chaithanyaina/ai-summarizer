// backend/controllers/summaryController.js
import asyncHandler from 'express-async-handler';
import nodemailer from 'nodemailer';
import { marked } from 'marked'; // Convert Markdown -> HTML
import dotenv from 'dotenv';
import { getAiSummary, getAiSummaryStream } from '../services/aiService.js';
import { createHtmlEmail } from '../utils/mailTemplate.js'; // Reusable email template
import Summary from '../models/Summary.js'; // Import Summary model

dotenv.config();

/**
 * @desc    Generate a summary from text transcript (Streaming)
 * @route   POST /api/summary/generate/stream
 * @access  Public
 */
export const generateSummaryStream = asyncHandler(async (req, res) => {
  const { transcript, prompt } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders(); // Send headers immediately

  let fullSummary = '';
  const streamIterator = await getAiSummaryStream(transcript, prompt);

  try {
    for await (const chunk of streamIterator) {
      fullSummary += chunk;
      res.write(`data: ${JSON.stringify({ chunk })}\n\n`);
    }

    // When the stream finishes, save the full summary to the database
    if (fullSummary.trim()) {
      await Summary.create({ prompt, summary: fullSummary });
    }

    // Signal the end to the client
    res.write('data: {"event": "done"}\n\n');

  } catch (error) {
    console.error('Stream error in controller:', error);
    res.write(`data: ${JSON.stringify({ error: 'Stream failed' })}\n\n`);
  } finally {
    // ✅ End the response to close the connection
    res.end();
  }
});

/**
 * @desc    Fetch recent summaries
 * @route   GET /api/summary/history
 * @access  Public
 */
export const getSummaryHistory = asyncHandler(async (req, res) => {
  const history = await Summary.find({}).sort({ createdAt: -1 }).limit(10);
  res.status(200).json(history);
});

/**
 * @desc    Generate a summary without streaming
 * @route   POST /api/summary/generate
 * @access  Public
 */
export const generateSummary = asyncHandler(async (req, res) => {
  const { transcript, prompt } = req.body;

  if (!transcript || !prompt) {
    res.status(400);
    throw new Error('Transcript and prompt are required.');
  }

  // Call centralized AI service
  const summary = await getAiSummary(transcript, prompt);

  // Save in DB too
  await Summary.create({ prompt, summary });

  res.status(200).json({ summary });
});

/**
 * @desc    Share summary via email
 * @route   POST /api/summary/share
 * @access  Public
 */
export const shareSummaryByEmail = asyncHandler(async (req, res) => {
  const { recipientEmail, summary } = req.body;

  if (!recipientEmail || !summary) {
    res.status(400);
    throw new Error('Recipient email and summary are required.');
  }

  // Convert Markdown summary → HTML
  const summaryHtml = marked(summary);

  // Wrap in reusable template
  const emailBody = createHtmlEmail(summaryHtml);

  // Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail', // change if using another provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"Meeting Summarizer" <${process.env.EMAIL_USER}>`,
    to: recipientEmail,
    subject: 'Your AI-Generated Meeting Summary',
    html: emailBody,
  };

  await transporter.sendMail(mailOptions);

  res.status(200).json({ message: 'Summary shared successfully via email.' });
});
