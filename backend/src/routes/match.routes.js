const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const Match = require('../models/Match.model');
const Candidate = require('../models/Candidate.model');
const Job = require('../models/Job.model');
const jobMatchingService = require('../services/jobMatching.service');
const notificationService = require('../services/notification.service');

// Get all matches for recruiter (across all their jobs)
router.get('/', requireAuth, requireRole('recruiter', 'admin'), async (req, res) => {
  try {
    const { minScore = 30, limit = 50, status } = req.query;
    
    // Find all jobs by this recruiter
    const jobs = await Job.find({ recruiterId: req.user.id });
    const jobIds = jobs.map(job => job._id);

    const query = {
      jobId: { $in: jobIds },
      matchScore: { $gte: parseInt(minScore) }
    };
    
    if (status) {
      query.status = status;
    }

    const matches = await Match.find(query)
      .populate('candidateId')
      .populate('jobId')
  .sort({ createdAt: -1, matchScore: -1 })
      .limit(parseInt(limit));

    res.json({ matches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get matches for a candidate
router.get('/candidate', requireAuth, requireRole('candidate'), async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ clerkUserId: req.user.id });
    
    if (!candidate) {
      return res.json({ matches: [] });
    }

    const { minScore = 30, limit = 20, status } = req.query;
    
    const query = {
      candidateId: candidate._id,
      matchScore: { $gte: parseInt(minScore) }
    };
    
    if (status) {
      query.status = status;
    }

    const matches = await Match.find(query)
      .populate('jobId')
      .sort({ matchScore: -1 })
      .limit(parseInt(limit));

    res.json({ matches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get matches for a job (recruiter)
router.get('/job/:jobId', requireAuth, requireRole('recruiter', 'admin'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.recruiterId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const { minScore = 30, limit = 50, status } = req.query;
    
    const query = {
      jobId: job._id,
      matchScore: { $gte: parseInt(minScore) }
    };
    
    if (status) {
      query.status = status;
    }

    const matches = await Match.find(query)
      .populate('candidateId')
      .sort({ matchScore: -1 })
      .limit(parseInt(limit));

    res.json({ matches });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trigger matching for a candidate
router.post('/candidate/trigger', requireAuth, requireRole('candidate'), async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ clerkUserId: req.user.id });
    
    if (!candidate) {
      return res.status(404).json({ error: 'Candidate profile not found' });
    }

    // Run matching
    const matches = await jobMatchingService.findMatchesForCandidate(candidate._id);
    const savedMatches = await jobMatchingService.saveMatches(matches);

    // Send notifications for high matches
    const highMatches = savedMatches.filter(m => m.matchScore >= 70);
    for (const match of highMatches.slice(0, 3)) {
      const job = await Job.findById(match.jobId);
      if (job) {
        await notificationService.sendMatchNotification(candidate.email, {
          jobTitle: job.title,
          company: job.company?.name,
          matchScore: match.matchScore,
          location: `${job.location?.city}, ${job.location?.country}`,
          jobId: job._id
        });
      }
    }

    res.json({
      message: 'Matching completed',
      totalMatches: savedMatches.length,
      highMatches: highMatches.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trigger matching for a job (recruiter)
router.post('/job/:jobId/trigger', requireAuth, requireRole('recruiter', 'admin'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.recruiterId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const matches = await jobMatchingService.findMatchesForJob(job._id);
    const savedMatches = await jobMatchingService.saveMatches(matches);

    res.json({
      message: 'Matching completed',
      totalMatches: savedMatches.length
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update match status (recruiter)
router.patch('/:matchId/status', requireAuth, requireRole('recruiter', 'admin'), async (req, res) => {
  try {
    const { status, notes } = req.body;
    
    const match = await Match.findById(req.params.matchId).populate('jobId');
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.jobId.recruiterId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    match.status = status;
    if (notes) match.recruiterNotes = notes;
    
    await match.save();

    res.json({ match });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Express interest (candidate)
router.patch('/:matchId/interest', requireAuth, requireRole('candidate'), async (req, res) => {
  try {
    const { interested } = req.body;
    
    const candidate = await Candidate.findOne({ clerkUserId: req.user.id });
    const match = await Match.findById(req.params.matchId);
    
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }

    if (match.candidateId.toString() !== candidate._id.toString()) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    match.candidateInterested = interested;
    await match.save();

    res.json({ match });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
