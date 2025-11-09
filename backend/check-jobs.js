const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-resume')
  .then(async () => {
    const Job = mongoose.model('Job', new mongoose.Schema({}, { strict: false }));
    const allJobs = await Job.find();
    
    console.log(`\n📊 Found ${allJobs.length} jobs in database\n`);
    
    const adzunaJobs = allJobs.filter(j => j.metadata?.source === 'adzuna');
    const manualJobs = allJobs.filter(j => j.metadata?.source !== 'adzuna');

    console.log(`🔹 Adzuna jobs: ${adzunaJobs.length}`);
    console.log(`🔹 Manual jobs: ${manualJobs.length}\n`);

    console.log('═'.repeat(80));
    console.log('ADZUNA JOBS (showing first 5):\n');
    
    adzunaJobs.slice(0, 5).forEach((job, index) => {
      const skills = job.requirements?.skills?.technical || [];
      console.log(`${index + 1}. ${job.title}`);
      console.log(`   Company: ${job.company?.name || job.company}`);
      console.log(`   Source: ${job.metadata?.source || 'N/A'}`);
      console.log(`   External URL: ${job.metadata?.externalUrl ? '✅ Has URL' : '❌ No URL'}`);
      console.log(`   Skills (${skills.length}): ${skills.slice(0, 5).join(', ')}${skills.length > 5 ? '...' : ''}`);
      console.log('');
    });

    if (adzunaJobs.length === 0) {
      console.log('\n⚠️  No Adzuna jobs found!');
    }

    console.log('\n═'.repeat(80));
    console.log('MANUAL JOBS (showing first 3):\n');
    
    manualJobs.slice(0, 3).forEach((job, index) => {
      console.log(`${index + 1}. ${job.title}`);
      console.log(`   Company: ${job.company?.name || job.company}`);
      console.log(`   Status: ${job.status}`);
      console.log('');
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
