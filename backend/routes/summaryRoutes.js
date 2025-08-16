// backend/routes/summaryRoutes.js
import express from 'express';
import { generateSummary, shareSummaryByEmail } from '../controllers/summaryController.js';
import { validateGenerate, validateShare } from '../middleware/validators.js'; // Import validators

const router = express.Router();

// Add the validation middleware to the routes
router.post('/generate', validateGenerate, generateSummary);
router.post('/share', validateShare, shareSummaryByEmail);

export default router;