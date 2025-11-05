const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema({
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true,
    index: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  fileUrl: {
    type: String,
    required: true
  },
  fileType: {
    type: String,
    enum: ['pdf', 'doc', 'docx'],
    required: true
  },
  extractedText: {
    type: String,
    default: ''
  },
  parsedData: {
    name: String,
    email: String,
    phone: String,
    address: String,
    summary: String,
    education: [{
      degree: String,
      institution: String,
      fieldOfStudy: String,
      graduationYear: Number,
      gpa: Number
    }],
    experience: [{
      company: String,
      position: String,
      startDate: String,
      endDate: String,
      current: Boolean,
      description: String
    }],
    skills: {
      technical: [String],
      soft: [String]
    },
    certifications: [{
      name: String,
      issuer: String,
      dateIssued: String,
      credentialId: String
    }],
    languages: [String],
    projects: [{
      name: String,
      description: String,
      technologies: [String],
      url: String
    }]
  },
  aiSuggestions: {
    missingKeywords: [String],
    formattingIssues: [String],
    contentImprovements: [String],
    skillGaps: [String]
  },
  parseStatus: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  parseError: String
}, {
  timestamps: true
});

module.exports = mongoose.model('Resume', resumeSchema);
