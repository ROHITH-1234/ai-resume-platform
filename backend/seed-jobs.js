const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ai-resume')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Define schemas (simplified)
const companySchema = new mongoose.Schema({
  name: String,
  industry: String,
  size: String,
  location: String,
  website: String,
  description: String
});

const jobSchema = new mongoose.Schema({
  recruiterId: String,
  title: String,
  description: String,
  company: {
    name: String,
    logo: String,
    website: String
  },
  requirements: {
    skills: {
      technical: [String],
      soft: [String]
    },
    experience: {
      min: Number,
      max: Number
    },
    education: [String]
  },
  location: {
    city: String,
    state: String,
    country: String,
    remote: Boolean
  },
  jobType: String,
  salary: {
    min: Number,
    max: Number,
    currency: String,
    negotiable: Boolean
  },
  benefits: [String],
  applicationDeadline: Date,
  status: String
}, { timestamps: true });

const Company = mongoose.model('Company', companySchema);
const Job = mongoose.model('Job', jobSchema);

async function seedJobs() {
  try {
    console.log('🌱 Starting seed process...');

    // Clear existing data
    await Job.deleteMany({});
    await Company.deleteMany({});
    console.log('🗑️  Cleared existing jobs and companies');

    // Create sample companies
    const techCorp = await Company.create({
      name: 'TechCorp Solutions',
      industry: 'Information Technology',
      size: '500-1000',
      location: 'Bangalore, India',
      website: 'https://techcorp.example.com',
      description: 'Leading software development company specializing in AI and cloud solutions'
    });

    const digitalHub = await Company.create({
      name: 'Digital Hub India',
      industry: 'Digital Marketing',
      size: '100-500',
      location: 'Mumbai, India',
      website: 'https://digitalhub.example.com',
      description: 'Fast-growing digital marketing agency helping brands grow online'
    });

    const innovateLabs = await Company.create({
      name: 'Innovate Labs',
      industry: 'Software Development',
      size: '50-100',
      location: 'Hyderabad, India',
      website: 'https://innovatelabs.example.com',
      description: 'Startup focused on building innovative mobile and web applications'
    });

    console.log('✅ Created 3 companies');

    // Create sample jobs for freshers
    const jobs = await Job.insertMany([
      {
        recruiterId: 'system_seed',
        title: 'Junior Software Developer',
        description: `We are looking for an enthusiastic Junior Software Developer to join our growing team. 
        This is an excellent opportunity for fresh graduates to start their career in software development.
        
        You will work on real projects, learn from experienced developers, and contribute to building 
        cutting-edge applications using modern technologies.
        
        Responsibilities:
        • Develop and maintain web applications using React and Node.js
        • Write clean, maintainable, and efficient code
        • Collaborate with team members on project requirements
        • Debug and fix issues in existing applications
        • Participate in code reviews and team meetings`,
        company: {
          name: techCorp.name,
          logo: '',
          website: techCorp.website
        },
        location: {
          city: 'Bangalore',
          state: 'Karnataka',
          country: 'India',
          remote: false
        },
        jobType: 'full-time',
        requirements: {
          skills: {
            technical: ['JavaScript', 'HTML', 'CSS', 'React', 'Node.js', 'Git', 'MongoDB', 'Express.js', 'REST API'],
            soft: ['Problem Solving', 'Team Collaboration', 'Communication', 'Willingness to Learn']
          },
          experience: {
            min: 0,
            max: 1
          },
          education: ['Bachelor\'s degree in Computer Science, IT, or related field']
        },
        salary: {
          min: 300000,
          max: 500000,
          currency: 'INR',
          negotiable: true
        },
        benefits: [
          'Competitive salary',
          'Health insurance',
          'Learning and development opportunities',
          'Flexible working hours',
          'Modern office environment',
          'Annual performance bonus'
        ],
        status: 'active',
        applicationDeadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      },
      {
        recruiterId: 'system_seed',
        title: 'Frontend Developer Trainee',
        description: `Join our team as a Frontend Developer Trainee and kickstart your career in web development!
        
        We offer a comprehensive training program where you'll learn industry-standard practices and work 
        on real client projects. Perfect for recent graduates with a passion for creating beautiful user interfaces.
        
        Responsibilities:
        • Build responsive web pages from design mockups
        • Implement interactive features using JavaScript
        • Work with designers to create pixel-perfect UIs
        • Optimize applications for maximum speed
        • Ensure cross-browser compatibility`,
        company: {
          name: digitalHub.name,
          logo: '',
          website: digitalHub.website
        },
        location: {
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          remote: false
        },
        jobType: 'full-time',
        requirements: {
          skills: {
            technical: ['HTML', 'CSS', 'JavaScript', 'React', 'Tailwind CSS', 'Responsive Design', 'Git'],
            soft: ['Attention to Detail', 'Creativity', 'Communication', 'Time Management']
          },
          experience: {
            min: 0,
            max: 1
          },
          education: ['Bachelor\'s or Master\'s degree in any field']
        },
        salary: {
          min: 250000,
          max: 400000,
          currency: 'INR',
          negotiable: true
        },
        benefits: [
          '3-month intensive training program',
          'Mentorship from senior developers',
          'Health and wellness benefits',
          'Work from home options',
          'Performance incentives',
          'Career growth opportunities'
        ],
        status: 'active',
        applicationDeadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000)
      },
      {
        recruiterId: 'system_seed',
        title: 'Full Stack Developer - Entry Level',
        description: `Exciting opportunity for freshers to join our startup as a Full Stack Developer!
        
        You'll get hands-on experience with both frontend and backend technologies, work in a fast-paced 
        environment, and have the chance to make a real impact from day one. We value enthusiasm, 
        problem-solving skills, and a willingness to learn.
        
        Responsibilities:
        • Develop end-to-end features from database to UI
        • Build and integrate RESTful APIs
        • Create responsive and intuitive user interfaces
        • Write unit and integration tests
        • Troubleshoot and debug applications
        • Collaborate with cross-functional teams`,
        company: {
          name: innovateLabs.name,
          logo: '',
          website: innovateLabs.website
        },
        location: {
          city: 'Hyderabad',
          state: 'Telangana',
          country: 'India',
          remote: true
        },
        jobType: 'full-time',
        requirements: {
          skills: {
            technical: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'HTML', 'CSS', 'REST API', 'Git', 'Express.js', 'TypeScript'],
            soft: ['Problem Solving', 'Adaptability', 'Team Player', 'Quick Learner']
          },
          experience: {
            min: 0,
            max: 2
          },
          education: ['B.Tech/B.E. in Computer Science or related field']
        },
        salary: {
          min: 350000,
          max: 550000,
          currency: 'INR',
          negotiable: true
        },
        benefits: [
          'Startup culture with growth opportunities',
          'Stock options/ESOP',
          'Medical insurance for family',
          'Flexible work hours',
          'Latest tech stack and tools',
          'Friday fun activities',
          'Annual team outings'
        ],
        status: 'active',
        applicationDeadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
      }
    ]);

    console.log(`✅ Created ${jobs.length} sample jobs for freshers`);
    console.log('\n📋 Sample Jobs Created:');
    jobs.forEach((job, index) => {
      console.log(`\n${index + 1}. ${job.title}`);
      console.log(`   Company: ${job.company.name}`);
      console.log(`   Location: ${job.location.city}, ${job.location.country}`);
      console.log(`   Experience: ${job.requirements.experience.min}-${job.requirements.experience.max} years`);
      console.log(`   Technical Skills: ${job.requirements.skills.technical.slice(0, 4).join(', ')}...`);
      console.log(`   Salary: ₹${job.salary.min.toLocaleString()} - ₹${job.salary.max.toLocaleString()} ${job.salary.currency}`);
    });

    console.log('\n✅ Seed completed successfully!');
    console.log('You can now upload a resume and see job matches.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
}

// Run seed
seedJobs();
