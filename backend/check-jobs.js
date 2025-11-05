const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-resume')
  .then(async () => {
    const Job = mongoose.model('Job', new mongoose.Schema({}, { strict: false }));
    const jobs = await Job.find().limit(5);
    
    console.log(`\n📊 Found ${jobs.length} jobs in database\n`);
    
    jobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title}`);
      console.log(`   Company: ${job.company}`);
      console.log(`   Location: ${job.location}`);
      console.log(`   Experience: ${job.experience}`);
      console.log(`   Status: ${job.status}`);
      console.log(`   Skills: ${job.requiredSkills?.slice(0, 3).join(', ')}...\n`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
