const Candidate = require('../models/Candidate.model');
const Job = require('../models/Job.model');
const Match = require('../models/Match.model');

class JobMatchingService {
  // Calculate skills similarity using Jaccard similarity
  calculateSkillsSimilarity(candidateSkills, jobSkills) {
    const candidateTech = new Set(candidateSkills.technical.map(s => s.toLowerCase()));
    const jobTech = new Set(jobSkills.technical.map(s => s.toLowerCase()));
    
    const intersection = new Set([...candidateTech].filter(x => jobTech.has(x)));
    const union = new Set([...candidateTech, ...jobTech]);
    
    if (union.size === 0) return 0;
    
    return (intersection.size / union.size) * 100;
  }

  // Calculate experience match
  calculateExperienceMatch(candidateExp, jobExpReq) {
    if (!jobExpReq || (!jobExpReq.min && !jobExpReq.max)) {
      return 100; // No experience requirement
    }

    const candidateYears = candidateExp.totalYears || 0;
    const minRequired = jobExpReq.min || 0;
    const maxRequired = jobExpReq.max || minRequired + 10;

    if (candidateYears >= minRequired && candidateYears <= maxRequired) {
      return 100;
    } else if (candidateYears < minRequired) {
      const diff = minRequired - candidateYears;
      return Math.max(0, 100 - (diff * 20)); // Penalize 20% per year short
    } else {
      const diff = candidateYears - maxRequired;
      return Math.max(0, 100 - (diff * 10)); // Slight penalty for overqualification
    }
  }

  // Calculate location match
  calculateLocationMatch(candidateLocation, jobLocation) {
    if (!jobLocation) return 100;
    
    if (jobLocation.remote) {
      return 100; // Remote jobs match everyone
    }

    if (!candidateLocation) return 50; // Unknown location

    // Check city match
    if (candidateLocation.city?.toLowerCase() === jobLocation.city?.toLowerCase()) {
      return 100;
    }

    // Check state match
    if (candidateLocation.state?.toLowerCase() === jobLocation.state?.toLowerCase()) {
      return 75;
    }

    // Check country match
    if (candidateLocation.country?.toLowerCase() === jobLocation.country?.toLowerCase()) {
      return 50;
    }

    return 25; // Different country
  }

  // Calculate salary match
  calculateSalaryMatch(candidatePrefs, jobSalary) {
    if (!candidatePrefs?.expectedSalary || !jobSalary) {
      return 100; // No salary info provided
    }

    const candidateMin = candidatePrefs.expectedSalary.min || 0;
    const candidateMax = candidatePrefs.expectedSalary.max || candidateMin * 1.5;
    const jobMin = jobSalary.min || 0;
    const jobMax = jobSalary.max || jobMin * 1.3;

    // Check for overlap
    if (candidateMin <= jobMax && candidateMax >= jobMin) {
      const overlapStart = Math.max(candidateMin, jobMin);
      const overlapEnd = Math.min(candidateMax, jobMax);
      const overlapRange = overlapEnd - overlapStart;
      const candidateRange = candidateMax - candidateMin;
      
      return (overlapRange / candidateRange) * 100;
    }

    // No overlap
    if (candidateMin > jobMax) {
      const gap = candidateMin - jobMax;
      const penalty = (gap / candidateMin) * 100;
      return Math.max(0, 100 - penalty);
    }

    return 50; // Candidate willing to accept less
  }

  // Calculate job type match
  calculateJobTypeMatch(candidatePrefs, jobType) {
    if (!candidatePrefs?.jobType || candidatePrefs.jobType.length === 0) {
      return 100; // No preference specified
    }

    if (candidatePrefs.jobType.includes(jobType)) {
      return 100;
    }

    return 0;
  }

  // Calculate overall match score
  async calculateMatchScore(candidate, job) {
    const weights = {
      skills: 0.40,      // 40%
      experience: 0.25,  // 25%
      location: 0.15,    // 15%
      salary: 0.10,      // 10%
      jobType: 0.10      // 10%
    };

    const skillsScore = this.calculateSkillsSimilarity(
      candidate.skills || { technical: [], soft: [] },
      job.requirements?.skills || { technical: [], soft: [] }
    );

    const experienceScore = this.calculateExperienceMatch(
      candidate.experience || {},
      job.requirements?.experience
    );

    const locationScore = this.calculateLocationMatch(
      candidate.location,
      job.location
    );

    const salaryScore = this.calculateSalaryMatch(
      candidate.preferences,
      job.salary
    );

    const jobTypeScore = this.calculateJobTypeMatch(
      candidate.preferences,
      job.jobType
    );

    const overallScore = Math.round(
      (skillsScore * weights.skills) +
      (experienceScore * weights.experience) +
      (locationScore * weights.location) +
      (salaryScore * weights.salary) +
      (jobTypeScore * weights.jobType)
    );

    // Calculate detailed breakdown
    const candidateTech = new Set(candidate.skills?.technical?.map(s => s.toLowerCase()) || []);
    const jobTech = new Set(job.requirements?.skills?.technical?.map(s => s.toLowerCase()) || []);
    const matchingSkills = [...candidateTech].filter(s => jobTech.has(s));
    const missingSkills = [...jobTech].filter(s => !candidateTech.has(s));

    return {
      matchScore: overallScore,
      scoreBreakdown: {
        skillsMatch: Math.round(skillsScore),
        experienceMatch: Math.round(experienceScore),
        locationMatch: Math.round(locationScore),
        salaryMatch: Math.round(salaryScore),
        jobTypeMatch: Math.round(jobTypeScore)
      },
      matchDetails: {
        matchingSkills: Array.from(matchingSkills),
        missingSkills: Array.from(missingSkills),
        experienceDifference: (candidate.experience?.totalYears || 0) - (job.requirements?.experience?.min || 0),
        salaryCompatibility: this.getSalaryCompatibilityLabel(salaryScore),
        locationCompatibility: this.getLocationCompatibilityLabel(locationScore)
      }
    };
  }

  getSalaryCompatibilityLabel(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Moderate';
    return 'Poor';
  }

  getLocationCompatibilityLabel(score) {
    if (score === 100) return 'Perfect Match';
    if (score >= 75) return 'Same Region';
    if (score >= 50) return 'Same Country';
    return 'Different Location';
  }

  // Find matches for a candidate
  async findMatchesForCandidate(candidateId, limit = 20) {
    const candidate = await Candidate.findById(candidateId);
    if (!candidate) throw new Error('Candidate not found');

    const jobs = await Job.find({ status: 'active' }).limit(100);
    const matches = [];

    for (const job of jobs) {
      const matchData = await this.calculateMatchScore(candidate, job);
      
      // Only store matches above 30%
      if (matchData.matchScore >= 30) {
        matches.push({
          candidateId: candidate._id,
          jobId: job._id,
          ...matchData
        });
      }
    }

    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);
    
    return matches.slice(0, limit);
  }

  // Find matches for a job
  async findMatchesForJob(jobId, limit = 50) {
    const job = await Job.findById(jobId);
    if (!job) throw new Error('Job not found');

    const candidates = await Candidate.find({ status: 'active' }).limit(200);
    const matches = [];

    for (const candidate of candidates) {
      const matchData = await this.calculateMatchScore(candidate, job);
      
      // Only store matches above 30%
      if (matchData.matchScore >= 30) {
        matches.push({
          candidateId: candidate._id,
          jobId: job._id,
          ...matchData
        });
      }
    }

    // Sort by match score
    matches.sort((a, b) => b.matchScore - a.matchScore);
    
    return matches.slice(0, limit);
  }

  // Save matches to database
  async saveMatches(matches) {
    const savedMatches = [];
    
    for (const match of matches) {
      try {
        const existingMatch = await Match.findOne({
          candidateId: match.candidateId,
          jobId: match.jobId
        });

        if (existingMatch) {
          // Update existing match
          existingMatch.matchScore = match.matchScore;
          existingMatch.scoreBreakdown = match.scoreBreakdown;
          existingMatch.matchDetails = match.matchDetails;
          await existingMatch.save();
          savedMatches.push(existingMatch);
        } else {
          // Create new match
          const newMatch = await Match.create(match);
          savedMatches.push(newMatch);
        }
      } catch (error) {
        console.error('Error saving match:', error);
      }
    }

    return savedMatches;
  }
}

module.exports = new JobMatchingService();
