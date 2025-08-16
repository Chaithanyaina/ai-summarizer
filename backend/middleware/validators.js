// backend/middleware/validators.js
import { body, validationResult } from 'express-validator';

// Middleware to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// Rules for the 'generate' endpoint
export const validateGenerate = [
  body('transcript')
    .trim()
    .notEmpty().withMessage('Transcript cannot be empty.')
    // Let's lower the minimum length to be more forgiving
    .isLength({ min: 20 }).withMessage('Transcript must be at least 20 characters long.'),
  body('prompt')
    .trim()
    .notEmpty().withMessage('Prompt cannot be empty.')
    // Let's allow shorter, more direct prompts
    .isLength({ min: 5 }).withMessage('Prompt must be at least 5 characters long.'),
  handleValidationErrors
];

// Rules for the 'share' endpoint
export const validateShare = [
  body('recipientEmail')
    .isEmail().withMessage('Must be a valid email address.')
    .normalizeEmail(),
  body('summary')
    .trim()
    .notEmpty().withMessage('Summary cannot be empty.'),
  handleValidationErrors
];