// backend/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import summaryRoutes from './routes/SummaryRoutes.js'; // Adjust the path as necessary
import rateLimit from 'express-rate-limit'; // Import
import { errorHandler } from './middleware/errorMiddleware.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  message: 'Too many requests from this IP, please try again after 15 minutes',
});

// Apply the rate limiter to all requests
app.use(limiter);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/summary', summaryRoutes);

// Health check endpoint
app.get('/', (req, res) => {
  res.send('AI Summarizer API is running!');
});
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
