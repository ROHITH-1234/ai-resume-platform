'use client'

import { useState } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { Brain, Play, CheckCircle, Loader2, Award } from 'lucide-react'

export default function MockInterviewPage() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [domain, setDomain] = useState('technical')
  const [difficulty, setDifficulty] = useState('medium')
  const [starting, setStarting] = useState(false)

  const handleStart = async () => {
    try {
      setStarting(true)
      const token = await getToken()
      if (token) apiClient.setToken(token)

      const response = await apiClient.startMockInterview(domain, difficulty)
      
      // Redirect to interview session page
      router.push(`/mock-interview/${response.data.interview._id}`)
    } catch (error: any) {
      console.error('Failed to start interview:', error)
      alert(error.response?.data?.message || 'Failed to start interview')
    } finally {
      setStarting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-purple-100 rounded-full mb-6">
            <Brain className="w-10 h-10 text-purple-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI Mock Interview
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Practice your interview skills with AI-generated questions and get instant feedback
          </p>
        </div>

        <div className="max-w-3xl mx-auto">
          {/* Setup Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Customize Your Interview
            </h2>

            {/* Domain Selection */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Interview Domain
              </label>
              <div className="grid md:grid-cols-3 gap-4">
                {['technical', 'behavioral', 'situational'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setDomain(type)}
                    className={`p-4 rounded-xl border-2 transition ${
                      domain === type
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold text-gray-900 capitalize">{type}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {type === 'technical' && 'Coding, algorithms, system design'}
                      {type === 'behavioral' && 'Past experience, teamwork, leadership'}
                      {type === 'situational' && 'Problem solving, decision making'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Difficulty Selection */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">
                Difficulty Level
              </label>
              <div className="grid md:grid-cols-3 gap-4">
                {['easy', 'medium', 'hard'].map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`p-4 rounded-xl border-2 transition ${
                      difficulty === level
                        ? 'border-purple-600 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <p className="font-semibold text-gray-900 capitalize">{level}</p>
                    <p className="text-xs text-gray-600 mt-1">
                      {level === 'easy' && 'Entry level questions'}
                      {level === 'medium' && 'Mid-level questions'}
                      {level === 'hard' && 'Senior level questions'}
                    </p>
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={handleStart}
              disabled={starting}
              className="w-full bg-purple-600 text-white py-4 rounded-xl hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg flex items-center justify-center gap-3"
            >
              {starting ? (
                <>
                  <Loader2 className="w-6 h-6 animate-spin" />
                  Preparing Interview...
                </>
              ) : (
                <>
                  <Play className="w-6 h-6" />
                  Start Mock Interview
                </>
              )}
            </button>
          </div>

          {/* Info Cards */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="bg-blue-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Brain className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">AI-Generated Questions</h3>
              <p className="text-sm text-gray-600">
                Get 5 unique questions tailored to your selected domain and difficulty
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Instant Feedback</h3>
              <p className="text-sm text-gray-600">
                Receive AI-powered evaluation and suggestions for each answer
              </p>
            </div>

            <div className="bg-white rounded-xl p-6 shadow-md">
              <div className="bg-purple-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <Award className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-bold text-gray-900 mb-2">Performance Score</h3>
              <p className="text-sm text-gray-600">
                Track your progress with detailed scoring and improvement tips
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
