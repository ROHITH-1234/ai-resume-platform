// Simple test to import jobs and check database
require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');

async function testImport() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    // Import jobs
    console.log('📥 Importing jobs from Adzuna...');
    const response = await axios.post('http://localhost:5000/api/adzuna/import-public', {
      keyword: 'Full Stack Developer',
      location: 'Remote',
      country: 'us'
    });

    console.log(`\n✅ Import Response:`);
    console.log(`   Imported: ${response.data.imported} jobs`);
    console.log(`   Errors: ${response.data.errors}`);

    if (response.data.jobs && response.data.jobs.length > 0) {
      console.log(`\n📊 Sample Jobs with Skills:\n`);
      console.log('═'.repeat(80));
      
      response.data.jobs.slice(0, 5).forEach((job, i) => {
        const skills = job.requirements?.skills?.technical || [];
        const experience = job.requirements?.experience;
        
        console.log(`\n${i + 1}. ${job.title}`);
        console.log(`   🏢 ${job.company?.name || 'N/A'}`);
        console.log(`   📍 ${job.location?.city || 'N/A'}, ${job.location?.state || ''}`);
        console.log(`   🔧 Skills (${skills.length}): ${skills.join(', ') || 'None'}`);
        console.log(`   📅 Experience: ${experience?.min || 0}-${experience?.max || 10} years`);
        console.log(`   💼 Type: ${job.jobType}`);
        if (job.topMatch) {
          console.log(`   🎯 Match Score: ${job.topMatch.score}% (${job.topMatch.candidateName})`);
        }
      });
    }

    await mongoose.connection.close();
    console.log('\n\n✅ Test complete!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
    process.exit(1);
  }
}

testImport();
