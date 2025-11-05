const mongoose = require('mongoose');

const candidateSchema = new mongoose.Schema({
  clerkUserId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
  location: {
    city: String,
    state: String,
    country: String
  },
  resume: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resume'
  },
  skills: {
    technical: [String],
    soft: [String]
  },
  experience: {
    totalYears: {
      type: Number,
      default: 0
    },
    jobs: [{
      company: String,
      position: String,
      startDate: Date,
      endDate: Date,
      current: Boolean,
      description: String
    }]
  },
  education: [{
    degree: String,
    institution: String,
    fieldOfStudy: String,
    graduationYear: Number,
    gpa: Number
  }],
  certifications: [{
    name: String,
    issuer: String,
    dateIssued: Date,
    expiryDate: Date,
    credentialId: String
  }],
  preferences: {
    jobType: [String], // ['full-time', 'part-time', 'contract', 'remote']
    expectedSalary: {
      min: Number,
      max: Number,
      currency: String
    },
    preferredLocations: [String],
    willingToRelocate: Boolean
  },
  profileVisibility: {
    type: Number,
    default: 0 // Analytics metric
  },
  availability: [{
    day: String,
    slots: [{
      start: String,
      end: String
    }]
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'hired'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes for performance
candidateSchema.index({ 'skills.technical': 1 });
candidateSchema.index({ 'experience.totalYears': 1 });
candidateSchema.index({ 'location.city': 1 });

module.exports = mongoose.model('Candidate', candidateSchema);
