import Link from 'next/link'
import { ArrowRight, Briefcase, Users, Calendar, Brain } from 'lucide-react'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Brain className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-800">AI Resume Matcher</span>
          </div>
          <div className="space-x-4">
            <Link href="/sign-in" className="text-gray-600 hover:text-gray-800">
              Sign In
            </Link>
            <Link href="/sign-up" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
          Smart Hiring with <span className="text-blue-600">AI-Powered</span> Matching
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
          Revolutionize your hiring process with AI resume parsing, intelligent job matching, 
          automated interview scheduling, and comprehensive analytics.
        </p>
        <div className="flex justify-center space-x-4">
          <Link href="/sign-up?role=candidate" 
            className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2">
            <span>I'm a Candidate</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/sign-up?role=recruiter" 
            className="bg-gray-800 text-white px-8 py-4 rounded-lg hover:bg-gray-900 transition flex items-center space-x-2">
            <span>I'm a Recruiter</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-4xl font-bold text-center mb-16">Platform Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard 
            icon={<Brain className="w-12 h-12 text-blue-600" />}
            title="AI Resume Parser"
            description="Automatically extract and analyze resume data with 95%+ accuracy"
          />
          <FeatureCard 
            icon={<Briefcase className="w-12 h-12 text-green-600" />}
            title="Smart Job Matching"
            description="AI-powered matching based on skills, experience, and preferences"
          />
          <FeatureCard 
            icon={<Calendar className="w-12 h-12 text-purple-600" />}
            title="Auto Scheduling"
            description="Intelligent interview scheduling with calendar integration"
          />
          <FeatureCard 
            icon={<Users className="w-12 h-12 text-orange-600" />}
            title="Mock Interviews"
            description="AI-driven practice interviews with real-time feedback"
          />
        </div>
      </section>

      {/* Stats */}
      <section className="bg-blue-600 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <StatCard number="10,000+" label="Active Candidates" />
            <StatCard number="5,000+" label="Jobs Posted" />
            <StatCard number="50,000+" label="Successful Matches" />
            <StatCard number="95%" label="Match Accuracy" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 AI Resume Matcher. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

function StatCard({ number, label }: { number: string, label: string }) {
  return (
    <div>
      <div className="text-4xl font-bold mb-2">{number}</div>
      <div className="text-blue-200">{label}</div>
    </div>
  )
}
