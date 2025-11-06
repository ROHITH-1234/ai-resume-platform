const express = require('express');
const router = express.Router();
const Candidate = require('../models/Candidate.model');
const { requireAuth } = require('../middleware/auth.middleware');

// @route   GET /api/candidates
// @desc    Get all candidates (for recruiters)
// @access  Private (Recruiter only)
router.get('/', requireAuth, async (req, res) => {
  try {
    // Check if user is recruiter
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ error: 'Access denied. Recruiters only.' });
    }

    const { 
      skills, 
      experience, 
      location, 
      availability,
      minExperience,
      maxExperience,
      limit = 100,
      skip = 0
    } = req.query;

    // Build query
    let query = { status: 'active' };

    // Filter by skills
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      query.$or = [
        { 'skills.technical': { $in: skillsArray } },
        { 'skills.soft': { $in: skillsArray } },
        { skills: { $in: skillsArray } }
      ];
    }

    // Filter by experience
    if (minExperience || maxExperience) {
      query.$or = query.$or || [];
      const expQuery = {};
      if (minExperience) expQuery.$gte = parseInt(minExperience);
      if (maxExperience) expQuery.$lte = parseInt(maxExperience);
      query.$or.push(
        { 'experience.totalYears': expQuery },
        { totalExperience: expQuery }
      );
    }

    // Filter by location
    if (location) {
      query.$or = query.$or || [];
      query.$or.push(
        { 'location.city': new RegExp(location, 'i') },
        { location: new RegExp(location, 'i') }
      );
    }

    // Filter by availability
    if (availability) {
      query.availability = availability;
    }

    // Fetch candidates with populated userId
    const candidates = await Candidate.find(query)
      .limit(parseInt(limit))
      .skip(parseInt(skip))
      .sort({ createdAt: -1 })
      .lean();

    // Format candidates to match expected frontend structure
    const formattedCandidates = candidates.map(candidate => ({
      ...candidate,
      userId: {
        name: candidate.name,
        email: candidate.email
      },
      // Flatten skills if nested
      skills: candidate.skills?.technical || candidate.skills || [],
      // Map experience to expected format
      totalExperience: candidate.experience?.totalYears || 0,
      experience: candidate.experience?.jobs || [],
      // Handle location format
      location: candidate.location?.city 
        ? `${candidate.location.city}${candidate.location.state ? ', ' + candidate.location.state : ''}`
        : candidate.location || 'Not specified',
      // Map preferences to expected fields
      expectedSalary: candidate.preferences?.expectedSalary?.max || 0,
      availability: candidate.availability?.length > 0 ? 'Available' : 'Not specified',
      noticePeriod: candidate.noticePeriod || 'Immediate',
      resumeUrl: candidate.resume?.fileUrl || candidate.resumeUrl
    }));

    // Get total count for pagination
    const total = await Candidate.countDocuments(query);

    res.json({
      success: true,
      candidates: formattedCandidates,
      pagination: {
        total,
        limit: parseInt(limit),
        skip: parseInt(skip),
        hasMore: total > (parseInt(skip) + parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({ 
      error: 'Failed to fetch candidates',
      message: error.message 
    });
  }
});

// @route   GET /api/candidates/me
// @desc    Get current user's candidate profile
// @access  Private (Candidate only)
router.get('/me', requireAuth, async (req, res) => {
  try {
    // Check if user is candidate
    if (req.user.role !== 'candidate') {
      return res.status(403).json({ error: 'Access denied. Candidates only.' });
    }

    const candidate = await Candidate.findOne({ clerkUserId: req.user.id })
      .lean();

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate profile not found' });
    }

    // Format response to match expected structure
    const formattedCandidate = {
      ...candidate,
      userId: {
        name: candidate.name,
        email: candidate.email
      },
      skills: candidate.skills?.technical || candidate.skills || [],
      totalExperience: candidate.experience?.totalYears || 0,
      experience: candidate.experience?.jobs || [],
      location: candidate.location?.city 
        ? `${candidate.location.city}${candidate.location.state ? ', ' + candidate.location.state : ''}`
        : candidate.location || 'Not specified',
      expectedSalary: candidate.preferences?.expectedSalary?.max || 0,
      availability: candidate.availability?.length > 0 ? 'Available' : 'Not specified'
    };

    res.json({
      success: true,
      data: formattedCandidate
    });
  } catch (error) {
    console.error('Error fetching candidate profile:', error);
    res.status(500).json({ 
      error: 'Failed to fetch candidate profile',
      message: error.message 
    });
  }
});

// @route   GET /api/candidates/:id
// @desc    Get candidate by ID (for recruiters)
// @access  Private (Recruiter only)
router.get('/:id', requireAuth, async (req, res) => {
  try {
    // Check if user is recruiter
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ error: 'Access denied. Recruiters only.' });
    }

    const candidate = await Candidate.findById(req.params.id)
      .lean();

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate not found' });
    }

    // Increment profile views
    await Candidate.findByIdAndUpdate(req.params.id, {
      $inc: { profileVisibility: 1 }
    });

    // Format response to match expected structure
    const formattedCandidate = {
      ...candidate,
      userId: {
        name: candidate.name,
        email: candidate.email
      },
      skills: candidate.skills?.technical || candidate.skills || [],
      totalExperience: candidate.experience?.totalYears || 0,
      experience: candidate.experience?.jobs || [],
      location: candidate.location?.city 
        ? `${candidate.location.city}${candidate.location.state ? ', ' + candidate.location.state : ''}`
        : candidate.location || 'Not specified',
      expectedSalary: candidate.preferences?.expectedSalary?.max || 0,
      availability: candidate.availability?.length > 0 ? 'Available' : 'Not specified',
      profileViews: candidate.profileVisibility || 0
    };

    res.json({
      success: true,
      data: formattedCandidate
    });
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({ 
      error: 'Failed to fetch candidate',
      message: error.message 
    });
  }
});

// @route   PUT /api/candidates/me
// @desc    Update current user's candidate profile
// @access  Private (Candidate only)
router.put('/me', requireAuth, async (req, res) => {
  try {
    // Check if user is candidate
    if (req.user.role !== 'candidate') {
      return res.status(403).json({ error: 'Access denied. Candidates only.' });
    }

    const updates = req.body;
    
    // Don't allow updating certain fields
    delete updates._id;
    delete updates.clerkUserId;
    delete updates.createdAt;

    const candidate = await Candidate.findOneAndUpdate(
      { clerkUserId: req.user.id },
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!candidate) {
      return res.status(404).json({ error: 'Candidate profile not found' });
    }

    res.json({
      success: true,
      data: candidate
    });
  } catch (error) {
    console.error('Error updating candidate profile:', error);
    res.status(500).json({ 
      error: 'Failed to update candidate profile',
      message: error.message 
    });
  }
});

// @route   GET /api/candidates/stats/overview
// @desc    Get candidate statistics (for recruiters)
// @access  Private (Recruiter only)
router.get('/stats/overview', requireAuth, async (req, res) => {
  try {
    // Check if user is recruiter
    if (req.user.role !== 'recruiter') {
      return res.status(403).json({ error: 'Access denied. Recruiters only.' });
    }

    const totalCandidates = await Candidate.countDocuments();
    const activeCandidates = await Candidate.countDocuments({ status: 'active' });
    const newCandidates = await Candidate.countDocuments({
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    // Top skills
    const topSkills = await Candidate.aggregate([
      { $unwind: '$skills' },
      { $group: { _id: '$skills', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        total: totalCandidates,
        active: activeCandidates,
        new: newCandidates,
        topSkills: topSkills.map(s => ({ skill: s._id, count: s.count }))
      }
    });
  } catch (error) {
    console.error('Error fetching candidate stats:', error);
    res.status(500).json({ 
      error: 'Failed to fetch candidate statistics',
      message: error.message 
    });
  }
});

module.exports = router;
