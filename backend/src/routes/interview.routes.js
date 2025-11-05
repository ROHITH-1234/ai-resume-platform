const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const Interview = require('../models/Interview.model');
const Match = require('../models/Match.model');
const Candidate = require('../models/Candidate.model');
const schedulerService = require('../services/scheduler.service');
const notificationService = require('../services/notification.service');

// Schedule interview (recruiter)
router.post('/', requireAuth, requireRole('recruiter', 'admin'), async (req, res) => {
  try {
    const {
      matchId,
      scheduledDateTime,
      duration,
      type,
      meetingPlatform,
      location,
      notes
    } = req.body;

    const match = await Match.findById(matchId)
      .populate('candidateId')
      .populate('jobId');
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.jobId.recruiterId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    // Generate meeting link if needed
    let meetingLink = null;
    let calendarEventId = null;

    if (meetingPlatform === 'google-meet' || meetingPlatform === 'zoom') {
      const startTime = new Date(scheduledDateTime);
      const endTime = new Date(startTime.getTime() + duration * 60000);
      
      if (meetingPlatform === 'google-meet') {
        // This requires OAuth setup with user tokens
        meetingLink = 'https://meet.google.com/example'; // Placeholder
      } else if (meetingPlatform === 'zoom') {
        const zoomMeeting = await schedulerService.generateZoomLink(
          `Interview - ${match.jobId.title}`,
          startTime,
          duration
        );
        meetingLink = zoomMeeting.meetingLink;
      }
    }

    const interview = await Interview.create({
      matchId,
      candidateId: match.candidateId._id,
      jobId: match.jobId._id,
      recruiterId: req.user.id,
      scheduledDateTime,
      duration,
      type,
      meetingPlatform,
      meetingLink,
      calendarEventId,
      location,
      notes,
      status: 'scheduled'
    });

    // Send notifications
    await notificationService.sendInterviewScheduledEmail(
      match.candidateId.email,
      req.user.email,
      {
        jobTitle: match.jobId.title,
        company: match.jobId.company?.name || 'Company',
        candidateName: match.candidateId.name,
        dateTime: scheduledDateTime,
        duration,
        type,
        meetingLink
      }
    );

    // Update match status
    match.status = 'interviewing';
    await match.save();

    res.status(201).json({ interview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get interviews (role-based)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { status, upcoming, page = 1, limit = 20 } = req.query;
    
    let query = {};
    
    if (req.user.role === 'candidate') {
      const candidate = await Candidate.findOne({ clerkUserId: req.user.id });
      if (!candidate) {
        return res.json({ interviews: [] });
      }
      query.candidateId = candidate._id;
    } else if (req.user.role === 'recruiter') {
      query.recruiterId = req.user.id;
    }
    
    if (status) {
      query.status = status;
    }
    
    if (upcoming === 'true') {
      query.scheduledDateTime = { $gte: new Date() };
      query.status = { $in: ['scheduled', 'confirmed'] };
    }

    const skip = (page - 1) * limit;

    const interviews = await Interview.find(query)
      .populate('candidateId')
      .populate('jobId')
      .sort({ scheduledDateTime: 1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Interview.countDocuments(query);

    res.json({
      interviews,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single interview
router.get('/:interviewId', requireAuth, async (req, res) => {
  try {
    const interview = await Interview.findById(req.params.interviewId)
      .populate('candidateId')
      .populate('jobId');
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    // Authorization check
    const candidate = await Candidate.findOne({ clerkUserId: req.user.id });
    const isAuthorized = 
      interview.recruiterId === req.user.id ||
      (candidate && interview.candidateId._id.toString() === candidate._id.toString()) ||
      req.user.role === 'admin';

    if (!isAuthorized) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    res.json({ interview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update interview status
router.patch('/:interviewId/status', requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    
    const interview = await Interview.findById(req.params.interviewId);
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    interview.status = status;
    await interview.save();

    res.json({ interview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Submit feedback (recruiter)
router.post('/:interviewId/feedback', requireAuth, requireRole('recruiter', 'admin'), async (req, res) => {
  try {
    const { rating, technicalSkills, communication, cultureFit, comments, decision } = req.body;
    
    const interview = await Interview.findById(req.params.interviewId);
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    if (interview.recruiterId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    interview.feedback = {
      rating,
      technicalSkills,
      communication,
      cultureFit,
      comments,
      decision
    };
    interview.status = 'completed';
    
    await interview.save();

    res.json({ interview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reschedule interview
router.patch('/:interviewId/reschedule', requireAuth, async (req, res) => {
  try {
    const { scheduledDateTime } = req.body;
    
    const interview = await Interview.findById(req.params.interviewId);
    
    if (!interview) {
      return res.status(404).json({ error: 'Interview not found' });
    }

    interview.scheduledDateTime = scheduledDateTime;
    interview.status = 'rescheduled';
    
    await interview.save();

    res.json({ interview });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
