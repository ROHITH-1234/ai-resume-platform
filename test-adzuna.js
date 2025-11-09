// Quick test script to verify Adzuna API credentials
const https = require('https');

const APP_ID = '69ce4769';
const APP_KEY = '526e0f82c3cfefd6f30b449ddb85e42c';
const KEYWORD = 'developer';
const LOCATION = 'new york';
const COUNTRY = 'us';

const params = new URLSearchParams({
  app_id: APP_ID,
  app_key: APP_KEY,
  results_per_page: '5',
  what: KEYWORD,
  where: LOCATION
});

const url = `https://api.adzuna.com/v1/api/jobs/${COUNTRY}/search/1?${params.toString()}`;

console.log('🔍 Testing Adzuna API...');
console.log('URL:', url);
console.log('');

https.get(url, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      
      if (json.results) {
        console.log(`✅ SUCCESS! Found ${json.results.length} jobs`);
        console.log(`📊 Total available: ${json.count}`);
        console.log('');
        console.log('Sample jobs:');
        console.log('─'.repeat(60));
        
        json.results.slice(0, 3).forEach((job, i) => {
          console.log(`${i + 1}. ${job.title}`);
          console.log(`   Company: ${job.company?.display_name || 'N/A'}`);
          console.log(`   Location: ${job.location?.display_name || 'N/A'}`);
          console.log(`   Salary: ${job.salary_min ? `$${job.salary_min} - $${job.salary_max}` : 'N/A'}`);
          console.log('');
        });
      } else {
        console.log('❌ No results found');
        console.log('Response:', json);
      }
    } catch (error) {
      console.error('❌ Error parsing response:', error.message);
      console.log('Raw data:', data);
    }
  });
}).on('error', (error) => {
  console.error('❌ Request failed:', error.message);
});
