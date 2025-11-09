// Test skill extraction directly
require('dotenv').config();
const axios = require('axios');

// Copy the extractSkills function from adzuna.routes.js
function extractSkills(description) {
  const skills = new Set();
  const text = description.toLowerCase();
  
  // Comprehensive skill database (200+ keywords)
  const skillKeywords = [
    // Frontend
    'javascript', 'typescript', 'react', 'reactjs', 'react.js', 'vue', 'vuejs', 'vue.js',
    'angular', 'angularjs', 'svelte', 'next.js', 'nextjs', 'nuxt', 'gatsby', 'html', 'html5',
    'css', 'css3', 'sass', 'scss', 'less', 'tailwind', 'tailwindcss', 'bootstrap', 'material-ui',
    'mui', 'chakra ui', 'redux', 'mobx', 'zustand', 'recoil', 'webpack', 'vite', 'rollup',
    'babel', 'jquery', 'graphql', 'apollo', 'relay',
    
    // Backend
    'node', 'node.js', 'nodejs', 'express', 'expressjs', 'nestjs', 'fastify', 'koa',
    'python', 'django', 'flask', 'fastapi', 'java', 'spring', 'spring boot', 'springboot',
    'hibernate', 'php', 'laravel', 'symfony', 'ruby', 'rails', 'ruby on rails', 'go', 'golang',
    'c#', 'csharp', '.net', 'dotnet', 'asp.net', 'rust', 'scala', 'kotlin', 'elixir', 'phoenix',
    
    // Mobile
    'react native', 'flutter', 'ios', 'swift', 'swiftui', 'objective-c', 'android', 'kotlin',
    'java', 'xamarin', 'ionic', 'cordova',
    
    // Databases
    'sql', 'mysql', 'postgresql', 'postgres', 'mongodb', 'mongo', 'redis', 'elasticsearch',
    'cassandra', 'dynamodb', 'sqlite', 'oracle', 'mariadb', 'mssql', 'sql server',
    'firebase', 'firestore', 'supabase', 'prisma', 'typeorm', 'sequelize', 'mongoose',
    
    // Cloud/DevOps
    'aws', 'azure', 'gcp', 'google cloud', 'docker', 'kubernetes', 'k8s', 'jenkins',
    'gitlab ci', 'github actions', 'circleci', 'terraform', 'ansible', 'chef', 'puppet',
    'ci/cd', 'cicd', 'nginx', 'apache', 'linux', 'unix', 'bash', 'shell scripting',
    
    // Testing
    'jest', 'mocha', 'chai', 'jasmine', 'cypress', 'selenium', 'playwright', 'puppeteer',
    'testing library', 'enzyme', 'junit', 'pytest', 'rspec', 'unit testing', 'integration testing',
    'e2e', 'tdd', 'bdd',
    
    // Tools & Methodologies
    'git', 'github', 'gitlab', 'bitbucket', 'jira', 'confluence', 'slack', 'agile', 'scrum',
    'kanban', 'rest api', 'restful', 'microservices', 'serverless', 'lambda', 'api design',
    'websocket', 'grpc', 'oauth', 'jwt', 'authentication', 'authorization',
    
    // Data/ML
    'machine learning', 'ml', 'ai', 'artificial intelligence', 'tensorflow', 'pytorch',
    'keras', 'scikit-learn', 'sklearn', 'pandas', 'numpy', 'data science', 'data analysis',
    'data engineering', 'etl', 'apache spark', 'hadoop', 'kafka', 'airflow',
    
    // Other
    'webpack', 'vite', 'eslint', 'prettier', 'typescript', 'soap', 'xml', 'json',
    'yaml', 'figma', 'sketch', 'adobe xd', 'photoshop', 'illustrator'
  ];

  // Extract skills using keyword matching
  skillKeywords.forEach(skill => {
    const regex = new RegExp(`\\b${skill.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    if (regex.test(text)) {
      // Normalize skill names
      let normalized = skill.toLowerCase();
      if (normalized === 'reactjs' || normalized === 'react.js') normalized = 'react';
      if (normalized === 'vuejs' || normalized === 'vue.js') normalized = 'vue';
      if (normalized === 'nodejs' || normalized === 'node.js') normalized = 'node';
      if (normalized === 'nextjs') normalized = 'next.js';
      if (normalized === 'k8s') normalized = 'kubernetes';
      if (normalized === 'mongo') normalized = 'mongodb';
      if (normalized === 'postgres') normalized = 'postgresql';
      
      skills.add(normalized);
    }
  });

  // Extract skills from patterns like "X years of Y" or "proficient in X"
  const patternMatches = text.match(/(\d+)\s*years?\s+(?:of\s+)?([a-z0-9.#+\s]+)/gi);
  if (patternMatches) {
    patternMatches.forEach(match => {
      const parts = match.split(/years?\s+(?:of\s+)?/i);
      if (parts[1]) {
        const skill = parts[1].trim().toLowerCase();
        skillKeywords.forEach(keyword => {
          if (skill.includes(keyword)) {
            skills.add(keyword);
          }
        });
      }
    });
  }

  return Array.from(skills);
}

async function testSkillExtraction() {
  try {
    console.log('🧪 Testing Adzuna API and Skill Extraction\n');

    const response = await axios.get('https://api.adzuna.com/v1/api/jobs/us/search/1', {
      params: {
        app_id: process.env.ADZUNA_APP_ID,
        app_key: process.env.ADZUNA_APP_KEY,
        what: 'React Developer',
        where: 'San Francisco',
        results_per_page: 5
      }
    });

    const jobs = response.data.results;
    console.log(`✅ Found ${jobs.length} jobs from Adzuna\n`);
    console.log('═'.repeat(80));

    jobs.forEach((job, index) => {
      console.log(`\n📌 JOB ${index + 1}: ${job.title}`);
      console.log(`🏢 Company: ${job.company.display_name}`);
      console.log(`📍 Location: ${job.location.display_name}`);
      
      const title = job.title || '';
      const description = job.description || '';
      const combinedText = `${title} ${description}`;
      
      const skillsFromTitle = extractSkills(title);
      const skillsFromDesc = extractSkills(description);
      const skillsFromBoth = extractSkills(combinedText);
      
      console.log(`\n🔧 EXTRACTED SKILLS:`);
      console.log(`   From Title (${skillsFromTitle.length}): ${skillsFromTitle.join(', ') || 'None'}`);
      console.log(`   From Desc (${skillsFromDesc.length}): ${skillsFromDesc.join(', ') || 'None'}`);
      console.log(`   TOTAL (${skillsFromBoth.length}): ${skillsFromBoth.join(', ')}`);
      
      console.log('─'.repeat(80));
    });

    console.log('\n\n📊 SUMMARY:');
    const totalSkills = jobs.reduce((sum, job) => {
      const combinedText = `${job.title} ${job.description || ''}`;
      return sum + extractSkills(combinedText).length;
    }, 0);
    console.log(`   Average skills per job: ${(totalSkills / jobs.length).toFixed(1)}`);
    console.log(`   Total skills found: ${totalSkills}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

testSkillExtraction();
