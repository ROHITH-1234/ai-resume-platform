const express = require('express');
const router = express.Router();
const { requireAuth } = require('../middleware/auth.middleware');
const Chat = require('../models/Chat.model');
const Candidate = require('../models/Candidate.model');
const Match = require('../models/Match.model');

// Get chats for user
router.get('/', requireAuth, async (req, res) => {
  try {
    let query = { status: 'active' };
    
    if (req.user.role === 'candidate') {
      const candidate = await Candidate.findOne({ clerkUserId: req.user.id });
      if (!candidate) {
        return res.json({ chats: [] });
      }
      query['participants.candidateId'] = candidate._id;
    } else if (req.user.role === 'recruiter') {
      query['participants.recruiterId'] = req.user.id;
    }

    const chats = await Chat.find(query)
      .populate('participants.candidateId')
      .populate('matchId')
      .sort({ 'lastMessage.timestamp': -1 });

    res.json({ chats });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get or create chat for a match
router.post('/match/:matchId', requireAuth, async (req, res) => {
  try {
    const match = await Match.findById(req.params.matchId)
      .populate('candidateId')
      .populate('jobId');
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    // Check authorization
    const candidate = await Candidate.findOne({ clerkUserId: req.user.id });
    const isAuthorized = 
      match.jobId.recruiterId === req.user.id ||
      (candidate && match.candidateId._id.toString() === candidate._id.toString());

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Find existing chat
    let chat = await Chat.findOne({ matchId: match._id });
    
    if (!chat) {
      // Create new chat
      chat = await Chat.create({
        matchId: match._id,
        participants: {
          candidateId: match.candidateId._id,
          recruiterId: match.jobId.recruiterId
        }
      });
    }

    chat = await chat.populate('participants.candidateId');

    res.json({ chat });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get messages from a chat
router.get('/:chatId/messages', requireAuth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Check authorization
    const candidate = await Candidate.findOne({ clerkUserId: req.user.id });
    const isAuthorized = 
      chat.participants.recruiterId === req.user.id ||
      (candidate && chat.participants.candidateId.toString() === candidate._id.toString());

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Mark messages as read
    if (req.user.role === 'candidate') {
      chat.messages.forEach(msg => {
        if (msg.senderRole !== 'candidate') msg.read = true;
      });
      chat.unreadCount.candidate = 0;
    } else if (req.user.role === 'recruiter') {
      chat.messages.forEach(msg => {
        if (msg.senderRole !== 'recruiter') msg.read = true;
      });
      chat.unreadCount.recruiter = 0;
    }
    
    await chat.save();

    res.json({ messages: chat.messages });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Send message
router.post('/:chatId/messages', requireAuth, async (req, res) => {
  try {
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    const chat = await Chat.findById(req.params.chatId);
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    // Check authorization
    const candidate = await Candidate.findOne({ clerkUserId: req.user.id });
    const isAuthorized = 
      chat.participants.recruiterId === req.user.id ||
      (candidate && chat.participants.candidateId.toString() === candidate._id.toString());

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const message = {
      senderId: req.user.id,
      senderRole: req.user.role,
      content,
      timestamp: new Date(),
      read: false
    };

    chat.messages.push(message);
    chat.lastMessage = {
      content,
      timestamp: new Date()
    };

    // Update unread count
    if (req.user.role === 'candidate') {
      chat.unreadCount.recruiter += 1;
    } else {
      chat.unreadCount.candidate += 1;
    }

    await chat.save();

    // Emit socket event
    const io = req.app.get('io');
    io.to(chat._id.toString()).emit('receive-message', message);

    res.status(201).json({ message });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Archive chat
router.patch('/:chatId/archive', requireAuth, async (req, res) => {
  try {
    const chat = await Chat.findById(req.params.chatId);
    
    if (!chat) {
      return res.status(404).json({ error: 'Chat not found' });
    }

    chat.status = 'archived';
    await chat.save();

    res.json({ message: 'Chat archived' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
