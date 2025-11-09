// Test the backend import endpoint
const http = require('http');

async function testImport() {
  const postData = JSON.stringify({
    keyword: 'React Developer',
    location: 'San Francisco',
    country: 'us'
  });

  const options = {
    hostname: 'localhost',
    port: 5000,
    path: '/api/adzuna/import',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData)
    }
  };

  console.log('🧪 Testing Backend Import Endpoint...\n');

  const req = http.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const response = JSON.parse(data);

        if (res.statusCode === 200) {
          console.log('✅ Import successful!');
          console.log(`📊 Imported: ${response.imported} jobs`);
          console.log(`❌ Errors: ${response.errors}`);
          console.log('');

          if (response.jobs && response.jobs.length > 0) {
            console.log('Sample imported jobs:');
            console.log('─'.repeat(60));
            response.jobs.slice(0, 3).forEach((job, i) => {
              console.log(`${i + 1}. ${job.title}`);
              console.log(`   Company: ${job.company.name}`);
              console.log(`   Skills: ${job.requirements.skills.technical.join(', ')}`);
              console.log(`   Job Type: ${job.jobType}`);
              console.log('');
            });
          }
        } else {
          console.error('❌ Error:', response);
        }
      } catch (error) {
        console.error('❌ Parse error:', error.message);
        console.log('Raw data:', data);
      }
    });
  });

  req.on('error', (error) => {
    console.error('❌ Request failed:', error.message);
  });

  req.write(postData);
  req.end();
}

testImport();
