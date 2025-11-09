// Direct MongoDB test - Create a job manually
require('dotenv').config();
const mongoose = require('mongoose');

async function testMongoInsert() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-resume');
    console.log('✅ Connected!\n');

    const Job = require('./src/models/Job.model');

    // Create a test job
    const testJob = {
      recruiterId: 'test-recruiter-123',
      title: 'Test React Developer from Script',
      company: {
        name: 'Test Company',
        website: 'https://test.com'
      },
      description: 'This is a test job to verify MongoDB is working',
      requirements: {
        skills: {
          technical: ['react', 'javascript', 'node'],
          soft: ['communication']
        },
        experience: {
          min: 2,
          max: 5
        }
      },
      location: {
        city: 'San Francisco',
        state: 'CA',
        remote: false
      },
      jobType: 'full-time',
      salary: {
        min: 100000,
        max: 150000,
        currency: 'USD'
      },
      status: 'active',
      metadata: {
        source: 'test',
        externalId: 'test-123',
        externalUrl: 'https://test.com/job',
        importedAt: new Date()
      }
    };

    console.log('📝 Creating test job...');
    const created = await Job.create(testJob);
    console.log('✅ Job created successfully!');
    console.log('📊 Job ID:', created._id);
    console.log('📄 Title:', created.title);
    console.log('🏢 Company:', created.company.name);
    console.log('\n');

    console.log('🔍 Fetching all jobs...');
    const allJobs = await Job.find({}).limit(10).sort({ createdAt: -1 });
    console.log(`✅ Found ${allJobs.length} jobs in database:`);
    
    allJobs.forEach((job, i) => {
      console.log(`  ${i + 1}. ${job.title} - ${job.company?.name || 'N/A'} (${job.metadata?.source || 'manual'})`);
    });

    // Check specifically for Adzuna jobs
    console.log('\n🔍 Checking for Adzuna jobs...');
    const adzunaJobs = await Job.find({ 'metadata.source': 'adzuna' });
    console.log(`📊 Adzuna jobs found: ${adzunaJobs.length}`);
    
    if (adzunaJobs.length > 0) {
      console.log('Sample Adzuna jobs:');
      adzunaJobs.slice(0, 3).forEach((job, i) => {
        console.log(`  ${i + 1}. ${job.title} - ${job.company?.name}`);
      });
    } else {
      console.log('⚠️  No Adzuna jobs found in database yet');
    }

    await mongoose.connection.close();
    console.log('\n✅ Test complete!');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testMongoInsert();
