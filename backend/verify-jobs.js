const mongoose = require('mongoose');
require('dotenv').config();

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-resume')
  .then(async () => {
    console.log('✅ Connected to MongoDB');
    
    const Job = mongoose.model('Job', new mongoose.Schema({}, { strict: false }));
    const Company = mongoose.model('Company', new mongoose.Schema({}, { strict: false }));
    
    const jobs = await Job.find().populate('company');
    
    console.log(`\n📊 Jobs with populated company data:\n`);
    
    jobs.forEach((job, index) => {
      console.log(`${index + 1}. ${job.title}`);
      console.log(`   Company: ${job.company?.name || 'N/A'}`);
      console.log(`   Location: ${job.location}`);
      console.log(`   Experience: ${job.experience}`);
      console.log(`   Salary: ₹${job.salary?.min?.toLocaleString()} - ₹${job.salary?.max?.toLocaleString()}`);
      console.log(`   Required Skills (${job.requiredSkills?.length}): ${job.requiredSkills?.slice(0, 4).join(', ')}`);
      console.log('');
    });
    
    const companies = await Company.find();
    console.log(`\n🏢 Companies in database: ${companies.length}\n`);
    companies.forEach(c => {
      console.log(`- ${c.name} (${c.industry})`);
    });
    
    process.exit(0);
  })
  .catch(err => {
    console.error('Error:', err);
    process.exit(1);
  });
