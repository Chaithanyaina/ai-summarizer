// backend/controllers/summaryController.js
import asyncHandler from 'express-async-handler';
import nodemailer from 'nodemailer';
import { marked } from 'marked'; // Convert Markdown -> HTML
import dotenv from 'dotenv';
import { getAiSummary } from '../services/aiService.js'; // Centralized AI service
import { createHtmlEmail } from '../utils/mailTemplate.js'; // Reusable email template

dotenv.config();

/**
 * @desc    Generate a summary from text transcript
 * @route   POST /api/summary/generate
 * @access  Public
 */
export const generateSummary = asyncHandler(async (req, res) => {
  const { transcript, prompt } = req.body;

  if (!transcript || !prompt) {
    res.status(400);
    throw new Error('Transcript and prompt are required.');
  }

  // Call the centralized AI service
  const summary = await getAiSummary(transcript, prompt);

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

  // Convert the Markdown summary to HTML
  const summaryHtml = marked(summary);

  // Wrap it in a clean HTML email template
  const emailBody = createHtmlEmail(summaryHtml);

  // Configure Nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail', // Change if using another provider
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

  // Send the email
  await transporter.sendMail(mailOptions);

  res.status(200).json({ message: 'Summary shared successfully via email.' });
});
