'use client'

import { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { Briefcase, MapPin, DollarSign, Clock, Search, Filter, Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function JobsPage() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [location, setLocation] = useState('')
  const [jobType, setJobType] = useState('')
  const [matches, setMatches] = useState<Record<string, any>>({})

  // Safely extract role
  const metadata = user?.publicMetadata as Record<string, any> | undefined
  const userRole = typeof metadata?.role === 'string' ? metadata.role : null

  useEffect(() => {
    loadJobs()
  }, [search, location, jobType])

  useEffect(() => {
    if (userRole === 'candidate' && jobs.length > 0) {
      loadMatches()
    }
  }, [jobs, userRole])

  const loadMatches = async () => {
    try {
      const token = await getToken()
      if (token) {
        apiClient.setToken(token)
        const response = await apiClient.getCandidateMatches({ limit: 100 })
        const matchesData: Record<string, any> = {}
        response.data.matches?.forEach((match: any) => {
          if (match.jobId?._id) {
            matchesData[match.jobId._id] = match
          }
        })
        setMatches(matchesData)
      }
    } catch (error) {
      console.error('Failed to load matches:', error)
    }
  }

  const loadJobs = async () => {
    try {
      setLoading(true)
      const token = await getToken()
      if (token) apiClient.setToken(token)

      const params: any = {}
      if (search) params.search = search
      if (location) params.location = location
      if (jobType) params.jobType = jobType

      const response = await apiClient.getJobs(params)
      setJobs(response.data.jobs || [])
    } catch (error) {
      console.error('Failed to load jobs:', error)
      setJobs([])
    } finally {
      setLoading(false)
    }
  }

  const formatSalary = (min?: number, max?: number) => {
    if (min == null && max == null) return null
    const safeMin = min ?? max ?? 0
    const safeMax = max ?? min ?? 0
    return `$${(safeMin / 1000).toFixed(0)}k - $${(safeMax / 1000).toFixed(0)}k`
  }

  const getJobTypeColor = (type: string) => {
    const colors: any = {
      'full-time': 'bg-green-100 text-green-700',
      'part-time': 'bg-blue-100 text-blue-700',
      'contract': 'bg-purple-100 text-purple-700',
      'internship': 'bg-orange-100 text-orange-700'
    }
    return colors[type] || 'bg-gray-100 text-gray-700'
  }

  const resolveLocation = (location: any) => {
    if (!location) return null
    if (typeof location === 'string') return location

    const isRemote = Boolean(location.isRemote ?? location.remote)
    if (isRemote) return 'Remote'

    const parts = [location.city, location.state].filter(Boolean)
    return parts.length > 0 ? parts.join(', ') : null
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 70) return 'bg-green-100 text-green-800 border border-green-300'
    if (score >= 50) return 'bg-yellow-100 text-yellow-800 border border-yellow-300'
    return 'bg-orange-100 text-orange-800 border border-orange-300'
  }

  const getMatchScoreLabel = (score: number) => {
    if (score >= 70) return '🎯 Excellent Match'
    if (score >= 50) return '👍 Good Match'
    return '💡 Potential Match'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Browse Jobs</h1>
          <p className="text-lg text-gray-600">
            Discover opportunities that match your skills and experience
          </p>
        </div>

        {/* Resume Upload CTA for Candidates */}
        {userRole === 'candidate' && Object.keys(matches).length === 0 && !loading && (
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="bg-blue-100 p-3 rounded-full">
                <Briefcase className="w-8 h-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-gray-900 mb-1">Get Personalized Job Matches!</h3>
                <p className="text-gray-600 text-sm">
                  Upload your resume to see how well you match with each job and get ranked by compatibility.
                </p>
              </div>
              <Link
                href="/resume/upload"
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium whitespace-nowrap"
              >
                Upload Resume
              </Link>
            </div>
          </div>
        )}

        {/* Search & Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by title, skills, company..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="full-time">Full-time</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
          </div>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No jobs found</h3>
            <p className="text-gray-600">
              Try adjusting your search filters or check back later for new opportunities
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {jobs.map((job) => {
              const locationLabel = resolveLocation(job.location)
              const salaryLabel = job.salary ? formatSalary(job.salary.min, job.salary.max) : null

              return (
                <div
                  key={job._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-6"
                >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-2xl font-bold text-gray-900">
                        {job.title}
                      </h3>
                      {/* Match Score Badge for Candidates */}
                      {userRole === 'candidate' && matches[job._id] && (
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-4 py-2 rounded-full text-sm font-bold ${getMatchScoreColor(matches[job._id].matchScore)}`}>
                            {matches[job._id].matchScore}% Match
                          </span>
                          <span className="text-xs text-gray-500">
                            {getMatchScoreLabel(matches[job._id].matchScore)}
                          </span>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{job.company?.name || job.company || 'Company'}</p>
                    <div className="flex flex-wrap gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getJobTypeColor(job.jobType)}`}>
                        {job.jobType}
                      </span>
                      {locationLabel && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {locationLabel}
                        </span>
                      )}
                      {salaryLabel && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          {salaryLabel}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 mb-4 line-clamp-3">{job.description}</p>

                {job.requiredSkills && job.requiredSkills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Required Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {job.requiredSkills.slice(0, 6).map((skill: string, index: number) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {job.requiredSkills.length > 6 && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium">
                          +{job.requiredSkills.length - 6} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-3">
                  <Link
                    href={`/jobs/${job._id}`}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
                  >
                    View Details
                  </Link>
                  <button className="border border-blue-600 text-blue-600 px-6 py-2 rounded-lg hover:bg-blue-50 transition font-medium">
                    Save Job
                  </button>
                </div>
              </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
