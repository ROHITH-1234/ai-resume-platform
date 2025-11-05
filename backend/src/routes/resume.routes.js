const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const { requireAuth, requireRole } = require('../middleware/auth.middleware');
const resumeParserService = require('../services/resumeParser.service');
const jobMatchingService = require('../services/jobMatching.service');
const Resume = require('../models/Resume.model');
const Candidate = require('../models/Candidate.model');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../../uploads/resumes');
    try {
      await fs.mkdir(uploadDir, { recursive: true });
      cb(null, uploadDir);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${Math.random().toString(36).substring(7)}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOC files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Upload and parse resume
router.post('/upload', requireAuth, requireRole('candidate'), upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Find or create candidate profile
    let candidate = await Candidate.findOne({ clerkUserId: req.user.id });
    
    if (!candidate) {
      candidate = await Candidate.create({
        clerkUserId: req.user.id,
        email: req.user.email,
        name: req.body.name || req.user.email.split('@')[0]
      });
    }

    // Create resume record with pending status
    const fileType = path.extname(req.file.originalname).substring(1);
    const resume = await Resume.create({
      candidateId: candidate._id,
      originalFileName: req.file.originalname,
      fileUrl: req.file.path,
      fileType,
      extractedText: '',
      parseStatus: 'processing'
    });

    // Parse resume asynchronously
    (async () => {
      try {
        const parseResult = await resumeParserService.parseResume(req.file.path, fileType);
        
        resume.extractedText = parseResult.extractedText;
        resume.parsedData = parseResult.parsedData;
        resume.aiSuggestions = parseResult.aiSuggestions;
        resume.parseStatus = 'completed';
        await resume.save();

        // Update candidate profile with parsed data
        candidate.name = parseResult.parsedData.name || candidate.name;
        candidate.phone = parseResult.parsedData.phone || candidate.phone;
        candidate.skills = parseResult.parsedData.skills || candidate.skills;
        candidate.education = parseResult.parsedData.education || candidate.education;
        candidate.certifications = parseResult.parsedData.certifications || candidate.certifications;
        candidate.resume = resume._id;
        
        // Calculate total experience
        if (parseResult.parsedData.experience && parseResult.parsedData.experience.length > 0) {
          candidate.experience = {
            totalYears: parseResult.parsedData.experience.reduce((total, job) => {
              const start = new Date(job.startDate);
              const end = job.current ? new Date() : new Date(job.endDate);
              const years = (end - start) / (1000 * 60 * 60 * 24 * 365);
              return total + years;
            }, 0),
            jobs: parseResult.parsedData.experience
          };
        }

        await candidate.save();
        
        // Automatically find and create job matches
        console.log('🔍 Finding job matches for candidate:', candidate._id);
        try {
          const matches = await jobMatchingService.findMatchesForCandidate(candidate._id);
          if (matches && matches.length > 0) {
            await jobMatchingService.saveMatches(matches);
            console.log(`✅ Created ${matches.length} job matches for candidate`);
          } else {
            console.log('ℹ️  No matching jobs found');
          }
        } catch (matchError) {
          console.error('❌ Error creating matches:', matchError);
          // Don't fail the resume upload if matching fails
        }
      } catch (error) {
        console.error('❌ Resume parsing error:', error);
        console.error('Error details:', {
          message: error.message,
          stack: error.stack?.substring(0, 500),
          name: error.name
        });
        resume.parseStatus = 'failed';
        resume.parseError = error.message || 'Failed to parse resume';
        await resume.save();
      }
    })();

    res.status(202).json({
      message: 'Resume uploaded and parsing started',
      resumeId: resume._id,
      status: 'processing'
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get resume parsing status
router.get('/:resumeId/status', requireAuth, async (req, res) => {
  try {
    const resume = await Resume.findById(req.params.resumeId);
    
    if (!resume) {
      return res.status(404).json({ error: 'Resume not found' });
    }

    res.json({
      status: resume.parseStatus,
      error: resume.parseError,
      parsedData: resume.parseStatus === 'completed' ? resume.parsedData : null,
      suggestions: resume.parseStatus === 'completed' ? resume.aiSuggestions : null
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get candidate's resumes
router.get('/my-resumes', requireAuth, requireRole('candidate'), async (req, res) => {
  try {
    const candidate = await Candidate.findOne({ clerkUserId: req.user.id });
    
    if (!candidate) {
      return res.json({ resumes: [] });
    }

    const resumes = await Resume.find({ candidateId: candidate._id }).sort({ createdAt: -1 });
    
    res.json({ resumes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
