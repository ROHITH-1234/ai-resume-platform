'use client'

import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { apiClient } from '@/lib/api'

export default function OnboardingPage() {
  const { user } = useUser()
  const { getToken } = useAuth()
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const handleRoleSelection = async () => {
    if (!selectedRole || !user) return

    setLoading(true)
    try {
      // Prefer secure endpoint using current session
      const token = await getToken()
      if (token) {
        // Set token so backend can authenticate
        apiClient.setToken(token)
        await apiClient.syncMyRole(selectedRole)
      } else {
        // Fallback to legacy endpoint without auth
        await apiClient.syncRole(user.id, selectedRole)
      }
      
      // Reload to get updated metadata
      await user.reload()
      
      if (selectedRole === 'recruiter') {
        router.push('/dashboard/recruiter')
      } else {
        router.push('/dashboard/candidate')
      }
    } catch (error) {
      console.error('Error setting role:', error)
      alert('Failed to set role. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to AI Resume Matcher!</h1>
        <p className="text-gray-600 mb-8">Please select your role to get started</p>

        <div className="space-y-4">
          <button
            onClick={() => setSelectedRole('candidate')}
            className={`w-full p-6 rounded-xl border-2 transition ${
              selectedRole === 'candidate'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-left">
              <h3 className="text-xl font-semibold mb-2">👨‍💼 I'm a Candidate</h3>
              <p className="text-gray-600 text-sm">
                Looking for jobs, upload resume, get matched with opportunities
              </p>
            </div>
          </button>

          <button
            onClick={() => setSelectedRole('recruiter')}
            className={`w-full p-6 rounded-xl border-2 transition ${
              selectedRole === 'recruiter'
                ? 'border-blue-600 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="text-left">
              <h3 className="text-xl font-semibold mb-2">🏢 I'm a Recruiter</h3>
              <p className="text-gray-600 text-sm">
                Post jobs, find candidates, schedule interviews
              </p>
            </div>
          </button>
        </div>

        <button
          onClick={handleRoleSelection}
          disabled={!selectedRole || loading}
          className="w-full mt-8 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Setting up...' : 'Continue'}
        </button>
      </div>
    </div>
  )
}
