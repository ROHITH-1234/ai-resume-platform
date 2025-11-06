'use client'

import { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter, useParams } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { 
  User, Mail, MapPin, Briefcase, Calendar, Award, FileText, 
  ArrowLeft, MessageSquare, CalendarPlus, Star, Phone, Download,
  Target, TrendingUp, CheckCircle, XCircle
} from 'lucide-react'
import Link from 'next/link'

export default function CandidateProfileView() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const params = useParams()
  const candidateId = params.id as string

  const [loading, setLoading] = useState(true)
  const [candidate, setCandidate] = useState<any>(null)
  const [matches, setMatches] = useState<any[]>([])
  const [updatingStatus, setUpdatingStatus] = useState(false)

  useEffect(() => {
    const metadata = user?.publicMetadata as Record<string, any> | undefined
    const userRole = metadata?.role
    
    if (userRole !== 'recruiter') {
      router.push('/dashboard')
      return
    }
    
    if (candidateId) {
      loadCandidateProfile()
    }
  }, [user, candidateId])

  const loadCandidateProfile = async () => {
    try {
      const token = await getToken()
      if (token) apiClient.setToken(token)

      // Get candidate profile and their matches
      const [candidateRes, matchesRes] = await Promise.allSettled([
        apiClient.get(`/candidates/${candidateId}`),
        apiClient.getAllMatches({ candidateId, limit: 20 })
      ])

      if (candidateRes.status === 'fulfilled') {
        setCandidate(candidateRes.value.data)
      } else {
        console.error('Failed to load candidate:', candidateRes.reason)
      }

      if (matchesRes.status === 'fulfilled') {
        setMatches(matchesRes.value.data.matches || [])
      }
    } catch (error) {
      console.error('Error loading candidate profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateMatchStatus = async (matchId: string, status: string) => {
    try {
      setUpdatingStatus(true)
      const token = await getToken()
      if (token) apiClient.setToken(token)

      await apiClient.updateMatchStatus(matchId, status)
      alert(`Candidate ${status} successfully!`)
      loadCandidateProfile()
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Failed to update status')
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!candidate) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Candidate Not Found</h2>
          <Link href="/candidates" className="text-blue-600 hover:underline">
            ← Back to Candidates
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Back Button */}
        <Link
          href="/candidates"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Candidates
        </Link>

        {/* Header Card */}
        <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-6">
              <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-12 h-12 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {candidate.userId?.name || candidate.name || 'Anonymous Candidate'}
                </h1>
                <div className="space-y-1">
                  <p className="text-gray-600 flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {candidate.userId?.email || candidate.email || 'Email not available'}
                  </p>
                  {candidate.phone && (
                    <p className="text-gray-600 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      {candidate.phone}
                    </p>
                  )}
                  {candidate.location && (
                    <p className="text-gray-600 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {candidate.location}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-3">
              <Link
                href={`/interviews/schedule?candidateId=${candidateId}`}
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                <CalendarPlus className="w-4 h-4" />
                Schedule Interview
              </Link>
              <Link
                href={`/messages?candidateId=${candidateId}`}
                className="flex items-center gap-2 border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition"
              >
                <MessageSquare className="w-4 h-4" />
                Message
              </Link>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Summary */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-xl font-bold mb-4">Profile Summary</h2>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-600">Experience</label>
                  <p className="text-gray-900 font-medium">{candidate.totalExperience || 0} years</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Expected Salary</label>
                  <p className="text-gray-900 font-medium">${candidate.expectedSalary?.toLocaleString() || 'Not specified'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Notice Period</label>
                  <p className="text-gray-900 font-medium">{candidate.noticePeriod || 'Immediate'}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Availability</label>
                  <p className="text-gray-900 font-medium">{candidate.availability || 'Available'}</p>
                </div>
              </div>
            </div>

            {/* Skills */}
            {candidate.skills && candidate.skills.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-yellow-600" />
                  Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {candidate.skills.map((skill: string, idx: number) => (
                    <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Experience */}
            {candidate.experience && candidate.experience.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Work Experience
                </h2>
                <div className="space-y-4">
                  {candidate.experience.map((exp: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-blue-600 pl-4">
                      <h3 className="font-semibold text-gray-900">{exp.title || exp.position}</h3>
                      <p className="text-gray-700">{exp.company}</p>
                      <p className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <Calendar className="w-4 h-4" />
                        {exp.startDate} - {exp.endDate || 'Present'}
                        {exp.duration && <span className="ml-2">({exp.duration})</span>}
                      </p>
                      {exp.description && (
                        <p className="text-gray-600 mt-2">{exp.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education */}
            {candidate.education && candidate.education.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5" />
                  Education
                </h2>
                <div className="space-y-4">
                  {candidate.education.map((edu: any, idx: number) => (
                    <div key={idx} className="border-l-4 border-green-600 pl-4">
                      <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                      <p className="text-gray-700">{edu.institution}</p>
                      <p className="text-sm text-gray-600">{edu.year || `${edu.startYear} - ${edu.endYear}`}</p>
                      {edu.grade && <p className="text-sm text-gray-600 mt-1">Grade: {edu.grade}</p>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Match Status */}
            {matches.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold mb-4">Job Matches</h3>
                <div className="space-y-3">
                  {matches.slice(0, 5).map((match) => (
                    <div key={match._id} className="border-b pb-3 last:border-b-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium text-sm">{match.jobId?.title}</p>
                          <p className="text-xs text-gray-500">
                            {match.matchScore}% match
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          match.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                          match.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {match.status}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateMatchStatus(match._id, 'shortlisted')}
                          disabled={updatingStatus || match.status === 'shortlisted'}
                          className="flex-1 text-xs bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <CheckCircle className="w-3 h-3 inline mr-1" />
                          Shortlist
                        </button>
                        <button
                          onClick={() => handleUpdateMatchStatus(match._id, 'rejected')}
                          disabled={updatingStatus || match.status === 'rejected'}
                          className="flex-1 text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <XCircle className="w-3 h-3 inline mr-1" />
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="font-bold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Total Matches</span>
                  <span className="font-bold">{matches.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Avg. Match Score</span>
                  <span className="font-bold">
                    {matches.length > 0 
                      ? Math.round(matches.reduce((sum, m) => sum + m.matchScore, 0) / matches.length)
                      : 0}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Profile Views</span>
                  <span className="font-bold">{candidate.profileViews || 0}</span>
                </div>
              </div>
            </div>

            {/* Resume Download */}
            {candidate.resumeUrl && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Resume
                </h3>
                <a
                  href={candidate.resumeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition w-full"
                >
                  <Download className="w-4 h-4" />
                  Download Resume
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
