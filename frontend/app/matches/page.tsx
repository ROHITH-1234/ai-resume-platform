'use client'

import { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { Briefcase, User, Target, TrendingUp, Calendar, MessageCircle, Loader2, CheckCircle, XCircle } from 'lucide-react'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import PageTransition from '@/components/PageTransition'

export default function MatchesPage() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [matches, setMatches] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'interested' | 'not-interested'>('all')
  const [hasResume, setHasResume] = useState(false)
  const [checkingResume, setCheckingResume] = useState(true)
  
  // Safely extract role
  const metadata = user?.publicMetadata as Record<string, any> | undefined
  const userRole = typeof metadata?.role === 'string' ? metadata.role : null

  useEffect(() => {
    checkExistingResume()
    loadMatches()
  }, [filter])

  const checkExistingResume = async () => {
    try {
      const token = await getToken()
      if (token) {
        apiClient.setToken(token)
        const response = await apiClient.getMyResumes()
        setHasResume(response.data.resumes && response.data.resumes.length > 0)
      }
    } catch (err) {
      console.error('Error checking resume:', err)
    } finally {
      setCheckingResume(false)
    }
  }

  const loadMatches = async () => {
    try {
      setLoading(true)
      const token = await getToken()
      if (!token) {
        router.push('/sign-in')
        return
      }

      apiClient.setToken(token)

      const params: any = {}
      if (filter !== 'all') {
        params.candidateInterest = filter === 'interested'
      }

      const response = await apiClient.getCandidateMatches(params)
      setMatches(response.data.matches || [])
    } catch (err) {
      console.error('Failed to load matches:', err)
      setMatches([])
    } finally {
      setLoading(false)
    }
  }

  const handleInterest = async (matchId: string, interested: boolean) => {
    try {
      const token = await getToken()
      if (!token) return

      apiClient.setToken(token)
      await apiClient.expressInterest(matchId, interested)
      
      // Refresh matches
      loadMatches()
    } catch (err) {
      console.error('Failed to update interest:', err)
      alert('Failed to update interest. Please try again.')
    }
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-100'
    if (score >= 60) return 'text-blue-600 bg-blue-100'
    if (score >= 40) return 'text-orange-600 bg-orange-100'
    return 'text-red-600 bg-red-100'
  }

  const getMatchScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match'
    if (score >= 60) return 'Good Match'
    if (score >= 40) return 'Fair Match'
    return 'Potential Match'
  }

  if (loading && !matches.length) {
    return <LoadingSpinner fullScreen message="Finding your matches..." size="lg" />
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Job Matches</h1>
          <p className="text-lg text-gray-600">
            AI-powered job recommendations based on your resume and skills
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All Matches
            </button>
            <button
              onClick={() => setFilter('interested')}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                filter === 'interested'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Interested
            </button>
            <button
              onClick={() => setFilter('not-interested')}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                filter === 'not-interested'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <XCircle className="w-4 h-4" />
              Not Interested
            </button>
          </div>
        </div>

        {/* Matches List */}
        {loading || checkingResume ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          </div>
        ) : matches.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {hasResume ? 'No matches found yet' : 'No matches found'}
            </h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all' ? (
                hasResume ? (
                  <>
                    Your resume has been uploaded. We're processing it and finding the best matches for you.
                    <br />
                    Please check back in a few moments or browse available jobs.
                  </>
                ) : (
                  'Upload your resume to get personalized job recommendations'
                )
              ) : (
                `No ${filter.replace('-', ' ')} matches yet`
              )}
            </p>
            {filter === 'all' && (
              hasResume ? (
                <div className="flex gap-3 justify-center">
                  <Link
                    href="/jobs"
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    Browse All Jobs
                  </Link>
                  <button
                    onClick={() => {
                      setLoading(true)
                      loadMatches()
                    }}
                    className="inline-block bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition font-medium"
                  >
                    Refresh Matches
                  </button>
                </div>
              ) : (
                <Link
                  href="/resume/upload"
                  className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Upload Resume
                </Link>
              )
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {matches.map((match) => {
              // Handle both jobId and job field names (backend returns jobId)
              const job = match.jobId || match.job;
              const jobTitle = job?.title || 'Job Title';
              const jobCompany = job?.company?.name || job?.company || 'Company';
              const jobId = job?._id;

              return (
              <div
                key={match._id}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {jobTitle}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-bold ${getMatchScoreColor(match.matchScore)}`}>
                        {match.matchScore}% Match
                      </span>
                    </div>
                    <p className="text-gray-600 mb-2">{jobCompany}</p>
                    <p className="text-sm text-gray-500">{getMatchScoreLabel(match.matchScore)}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      Matched {new Date(match.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {/* Match Reasons */}
                {match.matchReasons && match.matchReasons.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Why this match?</p>
                    <ul className="list-disc list-inside space-y-1">
                      {match.matchReasons.slice(0, 3).map((reason: string, index: number) => (
                        <li key={index} className="text-sm text-gray-600">
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Skill Matches */}
                {match.matchedSkills && match.matchedSkills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Matching Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {match.matchedSkills.slice(0, 8).map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {match.matchedSkills.length > 8 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                          +{match.matchedSkills.length - 8} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap gap-3">
                  {jobId && (
                    <Link
                      href={`/jobs/${jobId}`}
                      className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
                    >
                      <Briefcase className="w-4 h-4" />
                      View Job Details
                    </Link>
                  )}

                  {match.candidateInterested === undefined && (
                    <>
                      <button
                        onClick={() => handleInterest(match._id, true)}
                        className="bg-green-50 text-green-700 border border-green-200 px-6 py-2 rounded-lg hover:bg-green-100 transition font-medium flex items-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Interested
                      </button>
                      <button
                        onClick={() => handleInterest(match._id, false)}
                        className="bg-red-50 text-red-700 border border-red-200 px-6 py-2 rounded-lg hover:bg-red-100 transition font-medium flex items-center gap-2"
                      >
                        <XCircle className="w-4 h-4" />
                        Not Interested
                      </button>
                    </>
                  )}

                  {match.candidateInterested === true && (
                    <button className="bg-green-100 text-green-700 px-6 py-2 rounded-lg font-medium flex items-center gap-2 cursor-default">
                      <CheckCircle className="w-4 h-4" />
                      Marked as Interested
                    </button>
                  )}

                  {match.candidateInterested === false && (
                    <button className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg font-medium flex items-center gap-2 cursor-default">
                      <XCircle className="w-4 h-4" />
                      Marked as Not Interested
                    </button>
                  )}

                  {match.status === 'recruiter_interested' && (
                    <Link
                      href={`/interviews/schedule?matchId=${match._id}`}
                      className="bg-purple-50 text-purple-700 border border-purple-200 px-6 py-2 rounded-lg hover:bg-purple-100 transition font-medium flex items-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Schedule Interview
                    </Link>
                  )}

                  {match.chat && (
                    <Link
                      href={`/chat/${match.chat}`}
                      className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Message
                    </Link>
                  )}
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
    </PageTransition>
  )
}
