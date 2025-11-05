const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true
  },
  candidateId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Candidate',
    required: true,
    index: true
  },
  jobId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Job',
    required: true
  },
  recruiterId: {
    type: String,
    required: true,
    index: true
  },
  scheduledDateTime: {
    type: Date,
    required: true,
    index: true
  },
  duration: {
    type: Number, // in minutes
    default: 60
  },
  type: {
    type: String,
    enum: ['phone', 'video', 'in-person', 'technical', 'hr'],
    required: true
  },
  meetingLink: String,
  meetingPlatform: {
    type: String,
    enum: ['zoom', 'google-meet', 'teams', 'webrtc', 'other']
  },
  calendarEventId: String, // Google Calendar / Outlook event ID
  location: String, // for in-person interviews
  status: {
    type: String,
    enum: ['scheduled', 'confirmed', 'rescheduled', 'cancelled', 'completed', 'no-show'],
    default: 'scheduled'
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    technicalSkills: Number,
    communication: Number,
    cultureFit: Number,
    comments: String,
    decision: {
      type: String,
      enum: ['proceed', 'reject', 'maybe']
    }
  },
  reminders: [{
    sentAt: Date,
    type: String, // 'email' or 'whatsapp'
    status: String
  }],
  notes: String
}, {
  timestamps: true
});

interviewSchema.index({ status: 1, scheduledDateTime: 1 });

module.exports = mongoose.model('Interview', interviewSchema);
