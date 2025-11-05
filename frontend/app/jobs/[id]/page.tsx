'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter, useParams } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { 
  Briefcase, MapPin, DollarSign, Clock, Building, Users, 
  TrendingUp, Calendar, CheckCircle, Loader2, ArrowLeft 
} from 'lucide-react'
import Link from 'next/link'

export default function JobDetailPage() {
  const { getToken, userId } = useAuth()
  const router = useRouter()
  const params = useParams()
  const jobId = params.id as string

  const [job, setJob] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)

  useEffect(() => {
    if (jobId) {
      loadJobDetails()
    }
  }, [jobId])

  const loadJobDetails = async () => {
    try {
      setLoading(true)
      const token = await getToken()
      if (token) apiClient.setToken(token)

      const response = await apiClient.getJob(jobId)
      setJob(response.data.job)
    } catch (error) {
      console.error('Failed to load job details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    try {
      setApplying(true)
      const token = await getToken()
      if (!token) {
        router.push('/sign-in')
        return
      }

      apiClient.setToken(token)
      // TODO: Implement apply logic - for now just show success
      setApplied(true)
      setTimeout(() => setApplied(false), 3000)
    } catch (error) {
      console.error('Failed to apply:', error)
      alert('Failed to apply. Please try again.')
    } finally {
      setApplying(false)
    }
  }

  const formatSalary = (min: number, max: number, currency: string) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
    return `${formatter.format(min)} - ${formatter.format(max)}`
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

  const getExperienceLabel = (level: string) => {
    const labels: any = {
      'entry': 'Entry Level',
      'mid': 'Mid Level',
      'senior': 'Senior Level',
      'lead': 'Lead/Principal',
      'executive': 'Executive'
    }
    return labels[level] || level
  }

  const resolveLocation = (location: any) => {
    if (!location) {
      return { isRemote: false, display: null }
    }

    if (typeof location === 'string') {
      return { isRemote: false, display: location }
    }

    const isRemote = Boolean(location.isRemote ?? location.remote)
    const parts = [location.city, location.state, location.country].filter(Boolean)
    return {
      isRemote,
      display: isRemote ? 'Remote' : (parts.length > 0 ? parts.join(', ') : null)
    }
  }

  const deriveExperienceLabel = (jobData: any) => {
    if (!jobData) return 'All Experience Levels'

    if (jobData.experienceLevel) {
      return getExperienceLabel(jobData.experienceLevel)
    }

    const minExp = jobData.requirements?.experience?.min
    const maxExp = jobData.requirements?.experience?.max

    if (minExp == null && maxExp == null) {
      return 'All Experience Levels'
    }

    if ((minExp ?? 0) <= 1 && (maxExp ?? 1) <= 1) {
      return 'Entry Level'
    }

    const range = [minExp, maxExp]
      .filter((value) => value != null)
      .map((value) => `${value} yrs`)
      .join(' - ')

    return range || 'All Experience Levels'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Job Not Found</h2>
          <p className="text-gray-600 mb-4">The job you're looking for doesn't exist.</p>
          <Link href="/jobs" className="text-blue-600 hover:underline">
            ← Back to Jobs
          </Link>
        </div>
      </div>
    )
  }

  const locationInfo = resolveLocation(job.location)
  const requiredSkills: string[] = Array.isArray(job.requiredSkills)
    ? job.requiredSkills
    : job.requirements?.skills?.technical || []
  const preferredSkills: string[] = Array.isArray(job.preferredSkills)
    ? job.preferredSkills
    : job.requirements?.skills?.soft || []
  const educationRequirements: string[] = job.requirements?.education || []
  const experienceRange = job.requirements?.experience

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link
          href="/jobs"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Jobs
        </Link>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Header */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="bg-blue-100 rounded-xl p-4">
                  <Briefcase className="w-12 h-12 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-2 text-gray-600 mb-4">
                    <Building className="w-5 h-5" />
                    <span className="text-lg font-medium">{job.company?.name || job.company || 'Company'}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getJobTypeColor(job.jobType)}`}>
                      {job.jobType}
                    </span>
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-700">
                      {deriveExperienceLabel(job)}
                    </span>
                    {locationInfo.display && (
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {locationInfo.display}
                      </span>
                    )}
                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700 flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      Posted {new Date(job.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {applied && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <p className="text-green-800 font-medium flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" />
                    Application submitted successfully!
                  </p>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleApply}
                  disabled={applying || applied}
                  className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {applying ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Applying...
                    </>
                  ) : applied ? (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Applied
                    </>
                  ) : (
                    'Apply Now'
                  )}
                </button>
                <button className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold">
                  Save
                </button>
              </div>
            </div>

            {/* Job Description */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Job Description</h2>
              <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                {job.description}
              </div>
            </div>

            {/* Responsibilities */}
            {job.responsibilities && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Responsibilities</h2>
                <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                  {job.responsibilities}
                </div>
              </div>
            )}

            {/* Requirements */}
            {job.requirements && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Requirements</h2>
                {typeof job.requirements === 'string' ? (
                  <div className="prose max-w-none text-gray-700 whitespace-pre-line">
                    {job.requirements}
                  </div>
                ) : (
                  <div className="space-y-4 text-gray-700">
                    {(experienceRange?.min != null || experienceRange?.max != null) && (
                      <div>
                        <p className="font-semibold">Experience:</p>
                        <p>
                          {experienceRange?.min != null ? `${experienceRange.min} yrs` : '0 yrs'}
                          {experienceRange?.max != null ? ` - ${experienceRange.max} yrs` : '+'}
                        </p>
                      </div>
                    )}
                    {requiredSkills.length > 0 && (
                      <div>
                        <p className="font-semibold">Technical Skills:</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {requiredSkills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {preferredSkills.length > 0 && (
                      <div>
                        <p className="font-semibold">Soft Skills:</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {preferredSkills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                    {educationRequirements.length > 0 && (
                      <div>
                        <p className="font-semibold">Education:</p>
                        <ul className="list-disc list-inside">
                          {educationRequirements.map((item, index) => (
                            <li key={index}>{item}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Required Skills */}
            {requiredSkills.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                  Required Skills
                </h2>
                <div className="flex flex-wrap gap-2">
                  {requiredSkills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Preferred Skills */}
            {preferredSkills.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Preferred Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {preferredSkills.map((skill: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Benefits */}
            {job.benefits && job.benefits.length > 0 && (
              <div className="bg-white rounded-xl shadow-md p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Benefits</h2>
                <div className="grid md:grid-cols-2 gap-3">
                  {job.benefits.map((benefit: string, index: number) => (
                    <div key={index} className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Salary */}
            {job.salary && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  Salary Range
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  {formatSalary(job.salary.min, job.salary.max, job.salary.currency)}
                </p>
                <p className="text-sm text-gray-600 mt-1">Per year</p>
              </div>
            )}

            {/* Job Details */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Job Details</h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Job Type</p>
                  <p className="font-semibold text-gray-900 capitalize">{job.jobType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Experience Level</p>
                  <p className="font-semibold text-gray-900">{getExperienceLabel(job.experienceLevel)}</p>
                </div>
                {locationInfo.display && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Location</p>
                    <p className="font-semibold text-gray-900">
                      {locationInfo.display}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600 mb-1">Posted Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(job.createdAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                {job.applicationDeadline && (
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Application Deadline</p>
                    <p className="font-semibold text-red-600 flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(job.applicationDeadline).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Company Info */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                About {job.company?.name || job.company || 'Company'}
              </h3>
              <p className="text-gray-700 mb-4">
                Learn more about {job.company?.name || job.company || 'this company'} and their mission to create innovative solutions.
              </p>
              <button className="w-full border border-blue-600 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition font-medium">
                View Company Profile
              </button>
            </div>

            {/* Similar Jobs */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Similar Jobs
              </h3>
              <p className="text-gray-600 text-sm">
                Check out other opportunities that match your profile
              </p>
              <Link
                href="/jobs"
                className="mt-4 block w-full text-center border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Browse All Jobs
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
