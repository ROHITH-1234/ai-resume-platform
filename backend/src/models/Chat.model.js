const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  matchId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true,
    index: true
  },
  participants: {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Candidate',
      required: true
    },
    recruiterId: {
      type: String,
      required: true
    }
  },
  messages: [{
    senderId: String, // Can be candidateId or recruiterId
    senderRole: {
      type: String,
      enum: ['candidate', 'recruiter', 'ai']
    },
    content: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    read: {
      type: Boolean,
      default: false
    },
    isAIGenerated: {
      type: Boolean,
      default: false
    }
  }],
  lastMessage: {
    content: String,
    timestamp: Date
  },
  unreadCount: {
    candidate: {
      type: Number,
      default: 0
    },
    recruiter: {
      type: Number,
      default: 0
    }
  },
  status: {
    type: String,
    enum: ['active', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true
});

chatSchema.index({ 'participants.candidateId': 1 });
chatSchema.index({ 'participants.recruiterId': 1 });

module.exports = mongoose.model('Chat', chatSchema);
