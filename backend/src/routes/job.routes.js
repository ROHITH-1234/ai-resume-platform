const express = require('express');
const router = express.Router();
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const Job = require('../models/Job.model');
const jobMatchingService = require('../services/jobMatching.service');

// Create job posting
router.post('/', requireAuth, requireRole('recruiter', 'admin'), async (req, res) => {
  try {
    const jobData = {
      ...req.body,
      recruiterId: req.user.id
    };

    const job = await Job.create(jobData);
    console.log(`✅ Job created: ${job.title} (ID: ${job._id})`);

    // Return response immediately
    res.status(201).json({ job });

    // Trigger matching for all candidates (async in background)
    setImmediate(async () => {
      try {
        console.log(`🔄 Starting auto-matching for job: ${job.title}`);
        const matches = await jobMatchingService.findMatchesForJob(job._id);
        const savedMatches = await jobMatchingService.saveMatches(matches);
        console.log(`✅ Auto-matching completed: ${savedMatches.length} matches created for job: ${job.title}`);
      } catch (error) {
        console.error('❌ Auto-matching error:', error.message);
      }
    });
  } catch (error) {
    console.error('❌ Error creating job:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get all jobs (with filters) - Public for browsing, enhanced for authenticated users
router.get('/', async (req, res) => {
  try {
    const { search, location, jobType, status, page = 1, limit = 20 } = req.query;
    
    const query = {};
    
    if (search) {
      query.$text = { $search: search };
    }
    
    if (location) {
      query['location.city'] = new RegExp(location, 'i');
    }
    
    if (jobType) {
      query.jobType = jobType;
    }
    
    // Default to active jobs for public viewing
    if (status) {
      query.status = status;
    } else {
      query.status = 'active';
    }

    const skip = (page - 1) * limit;
    
    const jobs = await Job.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Job.countDocuments(query);

    res.json({
      jobs,
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

// Get single job - Public for browsing
router.get('/:jobId', async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    // Increment view count
    job.views += 1;
    await job.save();

    res.json({ job });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update job
router.put('/:jobId', requireAuth, requireRole('recruiter', 'admin'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.recruiterId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    Object.assign(job, req.body);
    await job.save();

    res.json({ job });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete job
router.delete('/:jobId', requireAuth, requireRole('recruiter', 'admin'), async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    
    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.recruiterId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await job.deleteOne();

    res.json({ message: 'Job deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
