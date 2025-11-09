const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  recruiterId: {
    type: String,
    required: true,
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    name: String,
    logo: String,
    website: String
  },
  description: {
    type: String,
    required: true
  },
  requirements: {
    skills: {
      technical: [String],
      soft: [String]
    },
    experience: {
      min: Number,
      max: Number
    },
    education: [String]
  },
  location: {
    city: String,
    state: String,
    country: String,
    remote: Boolean
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'internship', 'remote'],
    required: true
  },
  salary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    },
    negotiable: Boolean
  },
  benefits: [String],
  applicationDeadline: Date,
  status: {
    type: String,
    enum: ['draft', 'active', 'closed', 'on-hold'],
    default: 'active'
  },
  applicants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate'
  }],
  views: {
    type: Number,
    default: 0
  },
  metadata: {
    source: String, // 'adzuna', 'manual', etc.
    externalId: String,
    externalUrl: String,
    importedAt: Date
  }
}, {
  timestamps: true
});

// Indexes for search and filtering
jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index({ 'requirements.skills.technical': 1 });
jobSchema.index({ status: 1 });
jobSchema.index({ 'location.city': 1 });

module.exports = mongoose.model('Job', jobSchema);
