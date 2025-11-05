const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const mockInterviewService = require('../services/mockInterview.service');
const MockInterview = require('../models/MockInterview.model');
const Candidate = require('../models/Candidate.model');

// Start mock interview
router.post('/start', requireAuth, requireRole('candidate'), async (req, res) => {
  try {
    const { domain, difficulty = 'medium' } = req.body;
    
    if (!domain) {
      return res.status(400).json({ error: 'Domain is required' });
    }

    // Validate domain and difficulty
    const validDomains = ['technical', 'behavioral', 'situational'];
    const validDifficulties = ['easy', 'medium', 'hard'];
    
    if (!validDomains.includes(domain)) {
      return res.status(400).json({ 
        error: 'Invalid domain. Must be one of: technical, behavioral, situational' 
      });
    }
    
    if (!validDifficulties.includes(difficulty)) {
      return res.status(400).json({ 
        error: 'Invalid difficulty. Must be one of: easy, medium, hard' 
      });
    }

    let candidate = await Candidate.findOne({ clerkUserId: req.user.id });
    
    // Auto-create candidate profile if it doesn't exist
    if (!candidate) {
      console.log(`📝 Creating candidate profile for user: ${req.user.id}`);
      
      const userName = req.user.firstName && req.user.lastName 
        ? `${req.user.firstName} ${req.user.lastName}`
        : req.user.firstName || req.user.email?.split('@')[0] || 'User';
      
      candidate = await Candidate.create({
        clerkUserId: req.user.id,
        email: req.user.email || `${req.user.id}@temp.com`,
        name: userName,
        status: 'active'
      });
    }

    console.log(`🎤 Starting mock interview - Domain: ${domain}, Difficulty: ${difficulty}`);
    const interview = await mockInterviewService.startInterview(candidate._id, domain, difficulty);

    res.status(201).json({
      interview: {
        _id: interview._id,
        questions: interview.questions.map((q, idx) => ({
          index: idx,
          question: q.question
        })),
        domain: interview.domain,
        difficulty: interview.difficulty,
        status: interview.status
      }
    });
  } catch (error) {
    console.error('❌ Error starting mock interview:', error);
    res.status(500).json({ 
      error: 'Failed to start interview',
      message: error.message 
    });
  }
});

// Submit answer
router.post('/:interviewId/answer', requireAuth, requireRole('candidate'), async (req, res) => {
  try {
    const { questionIndex, answer } = req.body;
    
    if (questionIndex === undefined || !answer) {
      return res.status(400).json({ error: 'questionIndex and answer are required' });
    }

    const interview = await MockInterview.findById(req.params.interviewId);
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    const candidate = await Candidate.findOne({ clerkUserId: req.user.id });
    
    if (interview.candidateId.toString() !== candidate._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    if (interview.status !== 'in-progress') {
      return res.status(400).json({ error: 'Interview is not in progress' });
    }

    const evaluation = await mockInterviewService.submitAnswer(
      interview._id,
      questionIndex,
      answer
    );

    res.json({ evaluation });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Complete interview
router.post('/:interviewId/complete', requireAuth, requireRole('candidate'), async (req, res) => {
  try {
    const interview = await MockInterview.findById(req.params.interviewId);
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    const candidate = await Candidate.findOne({ clerkUserId: req.user.id });
    
    if (interview.candidateId.toString() !== candidate._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const completedInterview = await mockInterviewService.completeInterview(interview._id);

    res.json({
      overallScore: completedInterview.overallScore,
      strengths: completedInterview.strengths,
      weaknesses: completedInterview.weaknesses,
      improvementTips: completedInterview.improvementTips,
      duration: completedInterview.duration,
      questions: completedInterview.questions.map(q => ({
        question: q.question,
        answer: q.answer,
        evaluation: q.aiEvaluation
      }))
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get candidate's mock interviews
router.get('/my-interviews', requireAuth, requireRole('candidate'), async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ clerkUserId: req.user.id });
    
    if (!candidate) {
      return res.json({ interviews: [] });
    }

    const interviews = await MockInterview.find({ candidateId: candidate._id })
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ interviews });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific mock interview details
router.get('/:interviewId', requireAuth, requireRole('candidate'), async (req, res) => {
  try {
    const interview = await MockInterview.findById(req.params.interviewId);
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    const candidate = await Candidate.findOne({ clerkUserId: req.user.id });
    
    if (interview.candidateId.toString() !== candidate._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({ interview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
