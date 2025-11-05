const mongoose = require('mongoose');

const mockInterviewSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true,
    index: true
  },
  domain: {
    type: String,
    required: true // e.g., 'Software Engineering', 'Data Science', 'Marketing'
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  questions: [{
    question: String,
    answer: String,
    aiEvaluation: {
      accuracy: {
        type: Number,
        min: 0,
        max: 100
      },
      clarity: {
        type: Number,
        min: 0,
        max: 100
      },
      confidence: {
        type: Number,
        min: 0,
        max: 100
      },
      feedback: String,
      suggestions: [String]
    },
    answeredAt: Date
  }],
  overallScore: {
    type: Number,
    min: 0,
    max: 100
  },
  strengths: [String],
  weaknesses: [String],
  improvementTips: [String],
  status: {
    type: String,
    enum: ['in-progress', 'completed', 'abandoned'],
    default: 'in-progress'
  },
  duration: Number, // in minutes
  completedAt: Date
}, {
  timestamps: true
});

module.exports = mongoose.model('MockInterview', mockInterviewSchema);
