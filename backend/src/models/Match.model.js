const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true,
    index: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true,
    index: true
  },
  matchScore: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  scoreBreakdown: {
    skillsMatch: Number,
    experienceMatch: Number,
    locationMatch: Number,
    salaryMatch: Number,
    jobTypeMatch: Number
  },
  matchDetails: {
    matchingSkills: [String],
    missingSkills: [String],
    experienceDifference: Number,
    salaryCompatibility: String,
    locationCompatibility: String
  },
  status: {
    type: String,
    enum: ['pending', 'viewed', 'shortlisted', 'rejected', 'interviewing', 'hired'],
    default: 'pending'
  },
  recruiterNotes: String,
  candidateInterested: {
    type: Boolean,
    default: null
  }
}, {
  timestamps: true
});

// Compound index for unique matches
matchSchema.index({ candidateId: 1, jobId: 1 }, { unique: true });
matchSchema.index({ matchScore: -1 });

module.exports = mongoose.model('Match', matchSchema);
