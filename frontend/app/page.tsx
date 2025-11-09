'use client'

import Link from 'next/link'
import { ArrowRight, Briefcase, Users, Calendar, Brain } from 'lucide-react'
import dynamic from 'next/dynamic'

// Dynamic import to avoid SSR issues with Three.js
const ThreeBackground = dynamic(() => import('@/components/ThreeBackground'), {
  ssr: false,
  loading: () => <div className="fixed inset-0 -z-10 bg-gradient-to-br from-black via-red-950 to-black" />
})

export default function Home() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      <ThreeBackground />
      {/* Header */}
      <header className="container mx-auto px-4 py-6 relative z-10">
        <nav className="flex justify-between items-center backdrop-blur-md bg-black/80 rounded-2xl px-6 py-4 border border-red-600/50 shadow-2xl shadow-red-900/50">
          <div className="flex items-center space-x-2">
            <Brain className="w-8 h-8 text-red-500" />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-500 to-red-700">AI Resume Matcher</span>
          </div>
          <div className="space-x-4">
            <Link href="/sign-in" className="text-gray-300 hover:text-white font-medium transition">
              Sign In
            </Link>
            <Link href="/sign-up" className="bg-gradient-to-r from-red-600 to-red-700 text-white px-6 py-2 rounded-lg hover:from-red-700 hover:to-red-800 transition shadow-lg shadow-red-600/50">
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center relative z-10">
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 drop-shadow-[0_4px_20px_rgba(255,0,0,0.5)]">
          Smart Hiring with <span className="text-red-500 drop-shadow-[0_0_30px_rgba(239,68,68,0.8)]">AI-Powered</span> Matching
        </h1>
        <p className="text-xl text-gray-200 mb-8 max-w-3xl mx-auto drop-shadow-lg font-medium">
          Revolutionize your hiring process with AI resume parsing, intelligent job matching, 
          automated interview scheduling, and comprehensive analytics.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/sign-up?role=candidate" 
            className="bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition flex items-center space-x-2 shadow-2xl shadow-red-600/40 font-semibold">
            <span>I'm a Candidate</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link href="/sign-up?role=recruiter" 
            className="bg-black border-2 border-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-950 transition flex items-center space-x-2 shadow-2xl shadow-black/60 font-semibold">
            <span>I'm a Recruiter</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20 relative z-10">
        <h2 className="text-4xl font-bold text-center mb-16 text-white drop-shadow-[0_4px_20px_rgba(255,0,0,0.5)]">Platform Features</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard 
            icon={<Brain className="w-12 h-12 text-red-500" />}
            title="AI Resume Parser"
            description="Automatically extract and analyze resume data with 95%+ accuracy"
          />
          <FeatureCard 
            icon={<Briefcase className="w-12 h-12 text-red-500" />}
            title="Smart Job Matching"
            description="AI-powered matching based on skills, experience, and preferences"
          />
          <FeatureCard 
            icon={<Calendar className="w-12 h-12 text-red-500" />}
            title="Auto Scheduling"
            description="Intelligent interview scheduling with calendar integration"
          />
          <FeatureCard 
            icon={<Users className="w-12 h-12 text-red-500" />}
            title="Mock Interviews"
            description="AI-driven practice interviews with real-time feedback"
          />
        </div>
      </section>

      {/* Stats */}
      <section className="relative z-10 py-20 backdrop-blur-lg bg-red-950/30 border-y border-red-600/30 shadow-2xl">
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
      <footer className="relative z-10 backdrop-blur-md bg-black/80 text-white py-12 border-t border-red-600/50 shadow-2xl">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2025 AI Resume Matcher. All rights reserved.</p>
        </div>
      </footer>
    </main>
  )
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="backdrop-blur-lg bg-black/60 p-6 rounded-xl border border-red-600/50 shadow-2xl hover:bg-black/80 hover:border-red-500 transition hover:scale-105 transform duration-300">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
      <p className="text-gray-300">{description}</p>
    </div>
  )
}

function StatCard({ number, label }: { number: string, label: string }) {
  return (
    <div className="backdrop-blur-sm bg-black/40 p-6 rounded-xl border border-red-600/30">
      <div className="text-4xl font-bold mb-2 text-red-500 drop-shadow-lg">{number}</div>
      <div className="text-gray-200 font-medium">{label}</div>
    </div>
  )
}
