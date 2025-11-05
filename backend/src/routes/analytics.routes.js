const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const Match = require('../models/Match.model');
const Interview = require('../models/Interview.model');
const Job = require('../models/Job.model');
const Candidate = require('../models/Candidate.model');
const MockInterview = require('../models/MockInterview.model');

// Recruiter analytics
router.get('/recruiter', requireAuth, requireRole('recruiter', 'admin'), async (req, res) => {
  try {
    const recruiterId = req.user.id;

    // Get all jobs by recruiter
    const jobs = await Job.find({ recruiterId });
    const jobIds = jobs.map(j => j._id);

    // Total matches
    const totalMatches = await Match.countDocuments({ jobId: { $in: jobIds } });

    // Matches by status
    const matchesByStatus = await Match.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Average hiring time (from match to hired)
    const hiredMatches = await Match.find({
      jobId: { $in: jobIds },
      status: 'hired'
    }).populate('candidateId');

    let avgHiringTime = 0;
    if (hiredMatches.length > 0) {
      const hiringTimes = hiredMatches.map(m => {
        const interviews = Interview.find({ matchId: m._id, status: 'completed' }).sort({ createdAt: 1 });
        return (m.updatedAt - m.createdAt) / (1000 * 60 * 60 * 24); // days
      });
      avgHiringTime = hiringTimes.reduce((a, b) => a + b, 0) / hiringTimes.length;
    }

    // Top matching skills
    const allMatches = await Match.find({ jobId: { $in: jobIds } }).limit(100);
    const skillCounts = {};
    allMatches.forEach(match => {
      match.matchDetails?.matchingSkills?.forEach(skill => {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1;
      });
    });
    const topSkills = Object.entries(skillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));

    // Interviews scheduled
    const totalInterviews = await Interview.countDocuments({ recruiterId });
    const interviewsByStatus = await Interview.aggregate([
      { $match: { recruiterId } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Match score distribution
    const scoreDistribution = await Match.aggregate([
      { $match: { jobId: { $in: jobIds } } },
      {
        $bucket: {
          groupBy: '$matchScore',
          boundaries: [0, 30, 50, 70, 85, 100],
          default: 'Other',
          output: { count: { $sum: 1 } }
        }
      }
    ]);

    res.json({
      overview: {
        totalJobs: jobs.length,
        totalMatches,
        totalInterviews,
        avgHiringTime: Math.round(avgHiringTime)
      },
      matchesByStatus: matchesByStatus.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      interviewsByStatus: interviewsByStatus.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      topSkills,
      scoreDistribution
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Candidate analytics
router.get('/candidate', requireAuth, requireRole('candidate'), async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ clerkUserId: req.user.id });
    
    if (!candidate) {
      return res.json({
        error: 'Candidate profile not found',
        overview: {}
      });
    }

    // Total matches
    const totalMatches = await Match.countDocuments({ candidateId: candidate._id });

    // Matches by score range
    const highMatches = await Match.countDocuments({ 
      candidateId: candidate._id,
      matchScore: { $gte: 70 }
    });
    
    const mediumMatches = await Match.countDocuments({ 
      candidateId: candidate._id,
      matchScore: { $gte: 50, $lt: 70 }
    });

    // Interviews
    const totalInterviews = await Interview.countDocuments({ candidateId: candidate._id });
    const upcomingInterviews = await Interview.countDocuments({
      candidateId: candidate._id,
      scheduledDateTime: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    });

    // Profile visibility
    const profileViews = candidate.profileVisibility || 0;

    // Skill gap analysis (most requested skills in high-scoring matches)
    const highScoringMatches = await Match.find({
      candidateId: candidate._id,
      matchScore: { $gte: 60 }
    }).limit(50);

    const missingSkillCounts = {};
    highScoringMatches.forEach(match => {
      match.matchDetails?.missingSkills?.forEach(skill => {
        missingSkillCounts[skill] = (missingSkillCounts[skill] || 0) + 1;
      });
    });
    
    const skillGaps = Object.entries(missingSkillCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([skill, count]) => ({ skill, count }));

    // Mock interviews
    const mockInterviews = await MockInterview.find({ candidateId: candidate._id });
    const completedMocks = mockInterviews.filter(m => m.status === 'completed');
    const avgMockScore = completedMocks.length > 0
      ? completedMocks.reduce((sum, m) => sum + (m.overallScore || 0), 0) / completedMocks.length
      : 0;

    // Application status distribution
    const applicationStatus = await Match.aggregate([
      { $match: { candidateId: candidate._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    res.json({
      overview: {
        totalMatches,
        highMatches,
        mediumMatches,
        totalInterviews,
        upcomingInterviews,
        profileViews,
        avgMockScore: Math.round(avgMockScore)
      },
      skillGaps,
      applicationStatus: applicationStatus.reduce((acc, curr) => {
        acc[curr._id] = curr.count;
        return acc;
      }, {}),
      mockInterviewStats: {
        total: mockInterviews.length,
        completed: completedMocks.length,
        avgScore: Math.round(avgMockScore)
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Admin analytics (global stats)
router.get('/admin', requireAuth, requireRole('admin'), async (req, res) => {
  try {
    const totalCandidates = await Candidate.countDocuments();
    const totalJobs = await Job.countDocuments();
    const totalMatches = await Match.countDocuments();
    const totalInterviews = await Interview.countDocuments();

    // Active users
    const activeCandidates = await Candidate.countDocuments({ status: 'active' });
    const activeJobs = await Job.countDocuments({ status: 'active' });

    // Top skills in demand
    const jobs = await Job.find({ status: 'active' }).limit(200);
    const skillDemand = {};
    jobs.forEach(job => {
      job.requirements?.skills?.technical?.forEach(skill => {
        skillDemand[skill] = (skillDemand[skill] || 0) + 1;
      });
    });
    const topSkillsInDemand = Object.entries(skillDemand)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([skill, count]) => ({ skill, count }));

    res.json({
      overview: {
        totalCandidates,
        totalJobs,
        totalMatches,
        totalInterviews,
        activeCandidates,
        activeJobs
      },
      topSkillsInDemand
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
