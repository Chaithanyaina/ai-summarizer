// backend/models/Summary.js
import mongoose from 'mongoose';

const summarySchema = new mongoose.Schema({
  prompt: {
    type: String,
    required: true,
  },
  summary: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Summary = mongoose.model('Summary', summarySchema);

export default Summary;