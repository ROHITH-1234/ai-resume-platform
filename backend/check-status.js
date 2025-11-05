const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-resume')
  .then(async () => {
    console.log('✅ Connected to MongoDB\n');
    
    const Resume = mongoose.model('Resume', new mongoose.Schema({}, { strict: false }));
    const Candidate = mongoose.model('Candidate', new mongoose.Schema({}, { strict: false }));
    const Match = mongoose.model('Match', new mongoose.Schema({}, { strict: false }));
    
    const resumes = await Resume.find();
    const candidates = await Candidate.find();
    const matches = await Match.find();
    
    console.log(`📊 Database Status:`);
    console.log(`   Resumes: ${resumes.length}`);
    console.log(`   Candidates: ${candidates.length}`);
    console.log(`   Matches: ${matches.length}\n`);
    
    if (resumes.length > 0) {
      console.log('📄 Latest Resume:');
      const latest = resumes[resumes.length - 1];
      console.log(`   Status: ${latest.parseStatus}`);
      console.log(`   File: ${latest.originalFileName}`);
      console.log(`   Uploaded: ${latest.createdAt}`);
      if (latest.parsedData) {
        console.log(`   Name: ${latest.parsedData.name}`);
        console.log(`   Skills: ${latest.parsedData.skills?.slice(0, 5).join(', ')}...`);
      }
    }
    
    if (matches.length > 0) {
      console.log(`\n🎯 Matches Found: ${matches.length}`);
      matches.forEach((m, i) => {
        console.log(`   ${i + 1}. Score: ${m.matchScore}% - Status: ${m.status}`);
      });
    }
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
