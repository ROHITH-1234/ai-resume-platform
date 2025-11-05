'use client'

import { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { Briefcase, Upload, Calendar, TrendingUp, Award, Eye } from 'lucide-react'
import Link from 'next/link'

export default function CandidateDashboard() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<any>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [interviews, setInterviews] = useState<any[]>([])
  const [mockInterviews, setMockInterviews] = useState<any[]>([])
  const [refreshingMatches, setRefreshingMatches] = useState(false)

  useEffect(() => {
    // Safely check role
    const metadata = user?.publicMetadata as Record<string, any> | undefined
    const userRole = metadata?.role
    
    if (userRole !== 'candidate') {
      router.push('/dashboard')
      return
    }
    loadDashboard()
  }, [user])

  const loadDashboard = async () => {
    try {
      const token = await getToken()
      if (token) apiClient.setToken(token)

      const [analyticsRes, matchesRes, interviewsRes, mocksRes] = await Promise.allSettled([
        apiClient.getCandidateAnalytics(),
        apiClient.getCandidateMatches({ minScore: 30, limit: 10 }), // Show matches from 30%
        apiClient.getInterviews({ upcoming: 'true', limit: 5 }),
        apiClient.getMyMockInterviews()
      ])

      // Handle each response safely
      if (analyticsRes.status === 'fulfilled') {
        setAnalytics(analyticsRes.value.data)
      } else {
        console.warn('Analytics failed:', analyticsRes.reason?.message)
        setAnalytics({ totalMatches: 0, highQualityMatches: 0 })
      }

      if (matchesRes.status === 'fulfilled') {
        setMatches(matchesRes.value.data.matches || [])
      } else {
        console.warn('Matches failed:', matchesRes.reason?.message)
        setMatches([])
      }

      if (interviewsRes.status === 'fulfilled') {
        setInterviews(interviewsRes.value.data.interviews || [])
      } else {
        console.warn('Interviews failed:', interviewsRes.reason?.message)
        setInterviews([])
      }

      if (mocksRes.status === 'fulfilled') {
        setMockInterviews(mocksRes.value.data.interviews || [])
      } else {
        console.warn('Mock interviews failed:', mocksRes.reason?.message)
        setMockInterviews([])
      }
    } catch (error: any) {
      console.error('Error loading dashboard:', error?.message || error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshMatches = async () => {
    try {
      setRefreshingMatches(true)
      const token = await getToken()
      if (token) apiClient.setToken(token)

      await apiClient.triggerCandidateMatching()
      
      // Reload matches
      const matchesRes = await apiClient.getCandidateMatches({ minScore: 30, limit: 10 })
      setMatches(matchesRes.data.matches || [])
      
      alert('Matches refreshed successfully!')
    } catch (error: any) {
      console.error('Error refreshing matches:', error)
      alert(error.response?.data?.error || 'Failed to refresh matches')
    } finally {
      setRefreshingMatches(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Candidate Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.firstName}!</p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Briefcase className="w-8 h-8" />}
            title="Total Matches"
            value={analytics?.overview?.totalMatches || 0}
            color="blue"
          />
          <StatCard
            icon={<TrendingUp className="w-8 h-8" />}
            title="High Matches"
            value={analytics?.overview?.highMatches || 0}
            color="green"
          />
          <StatCard
            icon={<Calendar className="w-8 h-8" />}
            title="Interviews"
            value={analytics?.overview?.totalInterviews || 0}
            color="purple"
          />
          <StatCard
            icon={<Eye className="w-8 h-8" />}
            title="Profile Views"
            value={analytics?.overview?.profileViews || 0}
            color="orange"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="flex flex-wrap gap-4">
            <Link href="/resume/upload" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2">
              <Upload className="w-5 h-5" />
              <span>Upload Resume</span>
            </Link>
            <Link href="/jobs" className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition">
              Browse Jobs
            </Link>
            <Link href="/mock-interview" className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>Practice Interview</span>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Top Matches */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Top Job Matches</h2>
              <button
                onClick={handleRefreshMatches}
                disabled={refreshingMatches}
                className="text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {refreshingMatches ? 'Refreshing...' : '🔄 Refresh'}
              </button>
            </div>
            {matches.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">No job matches found yet</p>
                <p className="text-sm text-gray-500 mb-4">
                  Upload your resume to get personalized job matches with match scores
                </p>
                <div className="flex gap-3 justify-center">
                  <Link
                    href="/resume/upload"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                  >
                    Upload Resume
                  </Link>
                  <button
                    onClick={handleRefreshMatches}
                    disabled={refreshingMatches}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-sm disabled:opacity-50"
                  >
                    {refreshingMatches ? 'Checking...' : 'Check for Matches'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {matches.slice(0, 5).map((match) => (
                  <div key={match._id} className="border-b pb-3 last:border-b-0">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{match.jobId?.title || 'Job Title'}</p>
                        <p className="text-sm text-gray-600">{match.jobId?.company?.name || 'Company'}</p>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                          match.matchScore >= 70 ? 'bg-green-100 text-green-800' :
                          match.matchScore >= 50 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-orange-100 text-orange-800'
                        }`}>
                          {match.matchScore}% Match
                        </span>
                        <span className="text-xs text-gray-500">
                          {match.matchScore >= 70 ? 'Excellent' :
                           match.matchScore >= 50 ? 'Good Fit' :
                           'Potential'}
                        </span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link 
                        href={`/jobs/${match.jobId?._id}`} 
                        className="text-blue-600 text-sm hover:underline font-medium"
                      >
                        View Job Details →
                      </Link>
                      {match.matchDetails?.matchingSkills?.length > 0 && (
                        <span className="text-xs text-gray-500">
                          {match.matchDetails.matchingSkills.length} matching skills
                        </span>
                      )}
                    </div>
                  </div>
                ))}
                {matches.length > 5 && (
                  <Link
                    href="/matches"
                    className="block text-center text-blue-600 hover:text-blue-700 font-medium pt-3"
                  >
                    View All {matches.length} Matches →
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Upcoming Interviews */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Upcoming Interviews</h2>
            {interviews.length === 0 ? (
              <p className="text-gray-500">No upcoming interviews</p>
            ) : (
              <div className="space-y-4">
                {interviews.map((interview) => (
                  <div key={interview._id} className="border-b pb-3">
                    <p className="font-semibold">{interview.jobId?.title}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(interview.scheduledDateTime).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 capitalize">{interview.type} Interview</p>
                    {interview.meetingLink && (
                      <a href={interview.meetingLink} target="_blank" className="text-blue-600 text-sm hover:underline">
                        Join Meeting →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Skill Gaps */}
        {analytics?.skillGaps && analytics.skillGaps.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
            <h2 className="text-xl font-bold mb-4">Skills to Improve</h2>
            <p className="text-gray-600 mb-4">These skills appear frequently in jobs that match your profile:</p>
            <div className="flex flex-wrap gap-2">
              {analytics.skillGaps.slice(0, 10).map((skill: any, idx: number) => (
                <span key={idx} className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm">
                  {skill.skill} ({skill.count} jobs)
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Mock Interview Stats */}
        {analytics?.mockInterviewStats && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Mock Interview Performance</h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-gray-600">Total Completed</p>
                <p className="text-2xl font-bold">{analytics.mockInterviewStats.completed || 0}</p>
              </div>
              <div>
                <p className="text-gray-600">Average Score</p>
                <p className="text-2xl font-bold">{analytics.mockInterviewStats.avgScore || 0}%</p>
              </div>
              <div>
                <Link href="/mock-interview" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition inline-block text-center">
                  Start New Practice
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({ icon, title, value, color }: any) {
  const colors = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  }

  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className={`${colors[color as keyof typeof colors]} w-16 h-16 rounded-lg flex items-center justify-center mb-4`}>
        {icon}
      </div>
      <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
      <p className="text-3xl font-bold">{value}</p>
    </div>
  )
}
