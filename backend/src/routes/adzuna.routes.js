const express = require('express');
const router = express.Router();
const axios = require('axios');
const { requireAuth } = require('../middleware/auth.middleware');
const Job = require('../models/Job.model');
const jobMatchingService = require('../services/jobMatching.service');

// Import jobs from Adzuna API into the system
router.post('/import', requireAuth, async (req, res) => {
  try {
    console.log('📥 Import request received from user:', req.user?.id);
    const { keyword, location, salary, country = 'us', recruiterId } = req.body;
    console.log('🔍 Search params:', { keyword, location, salary, country });

    const app_id = process.env.ADZUNA_APP_ID;
    const app_key = process.env.ADZUNA_APP_KEY;

    if (!app_id || !app_key) {
      console.error('❌ Missing Adzuna credentials');
      return res.status(500).json({ 
        error: 'Adzuna API credentials not configured. Set ADZUNA_APP_ID and ADZUNA_APP_KEY.' 
      });
    }
    console.log('✅ Adzuna credentials found');

    // Build Adzuna API request
    const params = new URLSearchParams({ 
      app_id, 
      app_key, 
      results_per_page: '20' 
    });
    
    if (keyword) params.set('what', keyword);
    if (location) params.set('where', location);
    if (salary) params.set('salary_min', salary);

    const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/${encodeURIComponent(country)}/search/1?${params.toString()}`;

    // Fetch from Adzuna
    const response = await axios.get(adzunaUrl);
    const adzunaJobs = response.data.results || [];

    console.log(`📥 Fetched ${adzunaJobs.length} jobs from Adzuna`);

    // Transform and save jobs
    const importedJobs = [];
    const errors = [];

    for (const adzunaJob of adzunaJobs) {
      try {
        // Extract skills from BOTH title and description
        const title = adzunaJob.title || '';
        const description = adzunaJob.description || '';
        const combinedText = `${title} ${description}`;
        const technicalSkills = extractSkills(combinedText);
        
        // Parse location
        const locationData = parseLocation(adzunaJob.location?.display_name || adzunaJob.location || location);

        // Create job object matching our schema
        const jobData = {
          recruiterId: recruiterId || req.user.id,
          title: adzunaJob.title || 'Untitled Position',
          company: {
            name: adzunaJob.company?.display_name || adzunaJob.company || 'Company',
            website: adzunaJob.redirect_url
          },
          description: cleanHtml(description),
          requirements: {
            skills: {
              technical: technicalSkills,
              soft: []
            },
            experience: extractExperience(combinedText)
          },
          location: locationData,
          jobType: detectJobType(title, description),
          salary: {
            min: adzunaJob.salary_min || null,
            max: adzunaJob.salary_max || null,
            currency: 'USD'
          },
          status: 'active',
          // Store original Adzuna data for reference
          metadata: {
            source: 'adzuna',
            externalId: adzunaJob.id,
            externalUrl: adzunaJob.redirect_url,
            importedAt: new Date()
          }
        };

        // Check if job already exists (by external ID)
        const existingJob = await Job.findOne({ 
          'metadata.source': 'adzuna',
          'metadata.externalId': adzunaJob.id 
        });

        let job;
        if (existingJob) {
          console.log(`♻️  Updating existing job: ${jobData.title}`);
          Object.assign(existingJob, jobData);
          job = await existingJob.save();
        } else {
          console.log(`✨ Creating new job: ${jobData.title}`);
          job = await Job.create(jobData);
        }

        importedJobs.push(job);

      } catch (error) {
        console.error(`❌ Error importing job "${adzunaJob.title}":`, error.message);
        errors.push({ 
          title: adzunaJob.title, 
          error: error.message 
        });
      }
    }

    console.log(`✅ Imported ${importedJobs.length} jobs successfully`);

    // Return response immediately
    res.status(200).json({
      success: true,
      imported: importedJobs.length,
      errors: errors.length,
      jobs: importedJobs,
      errorDetails: errors
    });

    // Trigger matching in background
    if (importedJobs.length > 0) {
      setImmediate(async () => {
        try {
          console.log(`🔄 Starting auto-matching for ${importedJobs.length} imported jobs...`);
          let totalMatches = 0;
          
          for (const job of importedJobs) {
            try {
              const matches = await jobMatchingService.findMatchesForJob(job._id);
              const savedMatches = await jobMatchingService.saveMatches(matches);
              totalMatches += savedMatches.length;
              console.log(`  ✅ ${savedMatches.length} matches for: ${job.title}`);
            } catch (matchError) {
              console.error(`  ❌ Matching error for ${job.title}:`, matchError.message);
            }
          }
          
          console.log(`✅ Auto-matching completed: ${totalMatches} total matches created`);
        } catch (error) {
          console.error('❌ Background matching error:', error.message);
        }
      });
    }

  } catch (error) {
    console.error('❌ Adzuna import error:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.response?.data 
    });
  }
});

// Helper: Extract technical skills from job description
function extractSkills(text) {
  // Comprehensive skill keywords database
  const skillKeywords = [
    // Frontend
    'javascript', 'typescript', 'react', 'reactjs', 'react.js', 'vue', 'vuejs', 'vue.js',
    'angular', 'angularjs', 'svelte', 'next.js', 'nextjs', 'nuxt', 'gatsby',
    'html', 'html5', 'css', 'css3', 'sass', 'scss', 'less', 'tailwind', 'tailwindcss',
    'bootstrap', 'material-ui', 'mui', 'chakra', 'styled-components',
    'webpack', 'vite', 'rollup', 'parcel', 'babel', 'eslint', 'prettier',
    'redux', 'mobx', 'zustand', 'recoil', 'context api', 'hooks',
    'jquery', 'backbone', 'ember', 'knockout',
    
    // Backend
    'node', 'nodejs', 'node.js', 'express', 'expressjs', 'nestjs', 'nest.js',
    'koa', 'fastify', 'hapi', 'meteor',
    'python', 'django', 'flask', 'fastapi', 'tornado', 'pyramid',
    'java', 'spring', 'spring boot', 'springboot', 'hibernate', 'jpa',
    'c#', 'csharp', '.net', 'dotnet', 'asp.net', 'entity framework',
    'php', 'laravel', 'symfony', 'codeigniter', 'wordpress', 'drupal',
    'ruby', 'rails', 'ruby on rails', 'sinatra',
    'go', 'golang', 'gin', 'echo', 'fiber',
    'rust', 'actix', 'rocket', 'tokio',
    'scala', 'play', 'akka',
    'kotlin', 'ktor', 'spring',
    'swift', 'vapor',
    'elixir', 'phoenix',
    
    // Mobile
    'react native', 'flutter', 'dart', 'ionic', 'cordova', 'phonegap',
    'xamarin', 'android', 'ios', 'swift', 'objective-c', 'swiftui',
    
    // Databases
    'sql', 'mysql', 'postgresql', 'postgres', 'mariadb', 'sqlite',
    'mongodb', 'mongo', 'nosql', 'dynamodb', 'cassandra', 'couchdb',
    'redis', 'memcached', 'elasticsearch', 'elastic', 'solr',
    'neo4j', 'graph database', 'firebase', 'firestore', 'supabase',
    'oracle', 'mssql', 'sql server', 'db2',
    
    // Cloud & DevOps
    'aws', 'amazon web services', 'ec2', 's3', 'lambda', 'rds', 'dynamodb',
    'azure', 'microsoft azure', 'gcp', 'google cloud', 'cloud platform',
    'docker', 'kubernetes', 'k8s', 'helm', 'istio', 'terraform',
    'ansible', 'puppet', 'chef', 'saltstack',
    'jenkins', 'gitlab ci', 'github actions', 'circleci', 'travis ci',
    'ci/cd', 'continuous integration', 'continuous deployment',
    'nginx', 'apache', 'tomcat', 'iis', 'caddy',
    'linux', 'unix', 'ubuntu', 'centos', 'debian', 'redhat',
    'bash', 'shell', 'powershell', 'scripting',
    
    // Testing
    'jest', 'mocha', 'chai', 'jasmine', 'karma', 'cypress', 'playwright',
    'selenium', 'webdriver', 'puppeteer', 'testcafe',
    'junit', 'testng', 'pytest', 'unittest', 'rspec',
    'tdd', 'bdd', 'unit testing', 'integration testing', 'e2e',
    
    // Version Control
    'git', 'github', 'gitlab', 'bitbucket', 'svn', 'mercurial',
    'version control', 'source control',
    
    // APIs & Architecture
    'rest', 'restful', 'rest api', 'graphql', 'grpc', 'soap',
    'api', 'microservices', 'monolith', 'serverless',
    'websocket', 'sse', 'webhook', 'event-driven',
    'message queue', 'rabbitmq', 'kafka', 'activemq', 'redis pub/sub',
    
    // Data & Analytics
    'machine learning', 'ml', 'deep learning', 'ai', 'artificial intelligence',
    'tensorflow', 'pytorch', 'keras', 'scikit-learn', 'pandas', 'numpy',
    'data science', 'data analysis', 'data engineering', 'etl',
    'spark', 'hadoop', 'hive', 'pig', 'flink',
    'tableau', 'power bi', 'looker', 'metabase',
    'jupyter', 'r', 'matlab', 'sas', 'spss',
    
    // Methodologies
    'agile', 'scrum', 'kanban', 'waterfall', 'lean', 'devops',
    'pair programming', 'code review', 'sprint', 'standup',
    
    // Security
    'oauth', 'jwt', 'saml', 'sso', 'authentication', 'authorization',
    'encryption', 'ssl', 'tls', 'https', 'security', 'penetration testing',
    'owasp', 'xss', 'csrf', 'sql injection',
    
    // Other
    'blockchain', 'web3', 'ethereum', 'solidity', 'smart contract',
    'iot', 'raspberry pi', 'arduino',
    'unity', 'unreal', 'game development',
    'ui/ux', 'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator'
  ];

  const lowerText = text.toLowerCase();
  const foundSkills = new Set();

  for (const skill of skillKeywords) {
    // Create regex that matches whole words or phrases
    const escapedSkill = skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escapedSkill}\\b`, 'i');
    
    if (regex.test(lowerText)) {
      // Normalize the skill name
      let normalizedSkill = skill;
      if (skill === 'reactjs' || skill === 'react.js') normalizedSkill = 'react';
      if (skill === 'vuejs' || skill === 'vue.js') normalizedSkill = 'vue';
      if (skill === 'nodejs' || skill === 'node.js') normalizedSkill = 'node';
      if (skill === 'nextjs') normalizedSkill = 'next.js';
      if (skill === 'nestjs' || skill === 'nest.js') normalizedSkill = 'nestjs';
      if (skill === 'springboot') normalizedSkill = 'spring boot';
      if (skill === 'postgres') normalizedSkill = 'postgresql';
      if (skill === 'mongo') normalizedSkill = 'mongodb';
      if (skill === 'k8s') normalizedSkill = 'kubernetes';
      if (skill === 'csharp') normalizedSkill = 'c#';
      if (skill === 'golang') normalizedSkill = 'go';
      if (skill === 'elastic') normalizedSkill = 'elasticsearch';
      if (skill === 'ml') normalizedSkill = 'machine learning';
      
      foundSkills.add(normalizedSkill);
    }
  }

  // Also extract skills from common patterns like "X years of Y"
  const patterns = [
    /(\d+)\+?\s*years?\s+(?:of\s+)?(?:experience\s+)?(?:with\s+)?([a-z0-9.#+\s]+?)(?:\s+(?:and|or|,|\.|experience))/gi,
    /experience\s+(?:with\s+)?([a-z0-9.#+\s,]+?)(?:\s+(?:is|and|or|\.))/gi,
    /proficient\s+in\s+([a-z0-9.#+\s,]+?)(?:\s+(?:and|or|\.))/gi,
    /knowledge\s+of\s+([a-z0-9.#+\s,]+?)(?:\s+(?:and|or|\.))/gi,
    /strong\s+([a-z0-9.#+\s]+?)\s+skills/gi
  ];

  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const skillText = match[match.length - 1] || match[1];
      const skills = skillText.split(/[,/&]/).map(s => s.trim().toLowerCase());
      
      skills.forEach(skill => {
        if (skill.length > 2 && skill.length < 30) {
          // Check if it matches any known skill
          skillKeywords.forEach(knownSkill => {
            if (skill.includes(knownSkill) || knownSkill.includes(skill)) {
              foundSkills.add(knownSkill);
            }
          });
        }
      });
    }
  });

  return Array.from(foundSkills);
}

// Helper: Extract experience requirements
function extractExperience(text) {
  const lowerText = text.toLowerCase();
  
  // Patterns for experience requirements
  const patterns = [
    /(\d+)\s*-\s*(\d+)\s*years?\s+(?:of\s+)?experience/i,  // "2-5 years experience"
    /(\d+)\+\s*years?\s+(?:of\s+)?experience/i,             // "3+ years experience"
    /(\d+)\s+(?:to\s+)?(\d+)\s+years?\s+(?:of\s+)?experience/i, // "2 to 5 years"
    /(\d+)\s+years?\s+(?:of\s+)?experience/i,               // "3 years experience"
    /minimum\s+(?:of\s+)?(\d+)\s+years?/i,                  // "minimum 2 years"
    /at least\s+(\d+)\s+years?/i,                           // "at least 3 years"
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[2]) {
        // Range found (e.g., "2-5 years")
        return { 
          min: parseInt(match[1]), 
          max: parseInt(match[2]) 
        };
      } else {
        // Single value found
        const years = parseInt(match[1]);
        return { 
          min: years, 
          max: years + 2 
        };
      }
    }
  }

  // Check for seniority levels
  if (lowerText.includes('senior') || lowerText.includes('sr.') || lowerText.includes('lead')) {
    return { min: 5, max: 10 };
  }
  if (lowerText.includes('junior') || lowerText.includes('jr.') || lowerText.includes('entry')) {
    return { min: 0, max: 2 };
  }
  if (lowerText.includes('mid-level') || lowerText.includes('intermediate')) {
    return { min: 2, max: 5 };
  }
  if (lowerText.includes('principal') || lowerText.includes('staff') || lowerText.includes('architect')) {
    return { min: 8, max: 15 };
  }

  // Default
  return { min: 0, max: 10 };
}

// Helper: Parse location string
function parseLocation(locationStr) {
  if (!locationStr) return { remote: false };
  
  const lower = locationStr.toLowerCase();
  
  // Check for remote
  if (lower.includes('remote') || lower.includes('anywhere')) {
    return { remote: true };
  }

  // Parse "City, State" or "City, Country"
  const parts = locationStr.split(',').map(s => s.trim());
  
  if (parts.length >= 2) {
    return {
      city: parts[0],
      state: parts[1],
      country: parts[2] || 'USA',
      remote: false
    };
  }

  return {
    city: locationStr,
    remote: false
  };
}

// Helper: Detect job type from title/description
function detectJobType(title, description) {
  const text = `${title} ${description}`.toLowerCase();
  
  // Priority order matters
  if (text.match(/\b(intern|internship)\b/)) return 'internship';
  if (text.match(/\b(contract|contractor|freelance|temporary|temp|consultant)\b/)) return 'contract';
  if (text.match(/\b(part-time|part time|parttime)\b/)) return 'part-time';
  if (text.match(/\b(remote|work from home|wfh|anywhere)\b/)) return 'remote';
  if (text.match(/\b(full-time|full time|fulltime|permanent)\b/)) return 'full-time';
  
  return 'full-time'; // Default
}

// Helper: Clean HTML tags from description
function cleanHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

// Public test endpoint (no auth required)
router.get('/test', async (req, res) => {
  try {
    const { keyword = 'developer', location = 'new york', country = 'us' } = req.query;

    const app_id = process.env.ADZUNA_APP_ID;
    const app_key = process.env.ADZUNA_APP_KEY;

    if (!app_id || !app_key) {
      return res.status(500).json({ 
        error: 'Adzuna API credentials not configured.' 
      });
    }

    const params = new URLSearchParams({ app_id, app_key, results_per_page: '5' });
    if (keyword) params.set('what', keyword);
    if (location) params.set('where', location);

    const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/${encodeURIComponent(country)}/search/1?${params.toString()}`;

    const response = await axios.get(adzunaUrl);
    const jobs = response.data.results || [];

    res.json({
      success: true,
      count: jobs.length,
      total: response.data.count,
      jobs: jobs.map(j => ({
        title: j.title,
        company: j.company?.display_name || j.company,
        location: j.location?.display_name || j.location,
        salary: j.salary_min ? `$${j.salary_min} - $${j.salary_max}` : null
      }))
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// PUBLIC IMPORT ENDPOINT (NO AUTH) - FOR TESTING ONLY
router.post('/import-public', async (req, res) => {
  try {
    console.log('📥 PUBLIC Import request received (NO AUTH)');
    const { keyword, location, salary, country = 'us', recruiterId = 'system' } = req.body;
    console.log('🔍 Search params:', { keyword, location, salary, country });

    const app_id = process.env.ADZUNA_APP_ID;
    const app_key = process.env.ADZUNA_APP_KEY;

    if (!app_id || !app_key) {
      console.error('❌ Missing Adzuna credentials');
      return res.status(500).json({ 
        error: 'Adzuna API credentials not configured.' 
      });
    }
    console.log('✅ Adzuna credentials found');

    // Build Adzuna API request
    const params = new URLSearchParams({ 
      app_id, 
      app_key, 
      results_per_page: '20' 
    });
    
    if (keyword) params.set('what', keyword);
    if (location) params.set('where', location);
    if (salary) params.set('salary_min', salary);

    const adzunaUrl = `https://api.adzuna.com/v1/api/jobs/${encodeURIComponent(country)}/search/1?${params.toString()}`;
    console.log('🌐 Fetching from Adzuna...');

    // Fetch from Adzuna
    const response = await axios.get(adzunaUrl);
    const adzunaJobs = response.data.results || [];

    console.log(`📥 Fetched ${adzunaJobs.length} jobs from Adzuna`);

    // Transform and save jobs
    const importedJobs = [];
    const errors = [];

    for (const adzunaJob of adzunaJobs) {
      try {
        // Extract skills from BOTH title and description
        const title = adzunaJob.title || '';
        const description = adzunaJob.description || '';
        const combinedText = `${title} ${description}`;
        const technicalSkills = extractSkills(combinedText);
        
        // Parse location
        const locationData = parseLocation(adzunaJob.location?.display_name || adzunaJob.location || location);

        // Create job object
        const jobData = {
          recruiterId: recruiterId,
          title: adzunaJob.title || 'Untitled Position',
          company: {
            name: adzunaJob.company?.display_name || adzunaJob.company || 'Company',
            website: adzunaJob.redirect_url
          },
          description: cleanHtml(description),
          requirements: {
            skills: {
              technical: technicalSkills,
              soft: []
            },
            experience: extractExperience(combinedText)
          },
          location: locationData,
          jobType: detectJobType(title, description),
          salary: {
            min: adzunaJob.salary_min || null,
            max: adzunaJob.salary_max || null,
            currency: 'USD'
          },
          status: 'active',
          metadata: {
            source: 'adzuna',
            externalId: adzunaJob.id,
            externalUrl: adzunaJob.redirect_url,
            importedAt: new Date()
          }
        };

        // Check if job already exists
        const existingJob = await Job.findOne({ 
          'metadata.source': 'adzuna',
          'metadata.externalId': adzunaJob.id 
        });

        let job;
        if (existingJob) {
          console.log(`♻️  Updating: ${jobData.title}`);
          Object.assign(existingJob, jobData);
          job = await existingJob.save();
        } else {
          console.log(`✨ Creating: ${jobData.title}`);
          job = await Job.create(jobData);
        }

        importedJobs.push(job);

      } catch (error) {
        console.error(`❌ Error importing "${adzunaJob.title}":`, error.message);
        errors.push({ 
          title: adzunaJob.title, 
          error: error.message 
        });
      }
    }

    console.log(`✅ Imported ${importedJobs.length} jobs successfully`);

    // Return response
    res.status(200).json({
      success: true,
      imported: importedJobs.length,
      errors: errors.length,
      jobs: importedJobs,
      errorDetails: errors
    });

    // Trigger matching in background
    if (importedJobs.length > 0) {
      setImmediate(async () => {
        try {
          console.log(`🔄 Starting auto-matching for ${importedJobs.length} jobs...`);
          let totalMatches = 0;
          
          for (const job of importedJobs) {
            try {
              const matches = await jobMatchingService.findMatchesForJob(job._id);
              const savedMatches = await jobMatchingService.saveMatches(matches);
              totalMatches += savedMatches.length;
              console.log(`  ✅ ${savedMatches.length} matches for: ${job.title}`);
            } catch (matchError) {
              console.error(`  ❌ Matching error for ${job.title}:`, matchError.message);
            }
          }
          
          console.log(`✅ Auto-matching completed: ${totalMatches} total matches`);
        } catch (error) {
          console.error('❌ Background matching error:', error.message);
        }
      });
    }

  } catch (error) {
    console.error('❌ Adzuna import error:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.response?.data 
    });
  }
});

module.exports = router;
