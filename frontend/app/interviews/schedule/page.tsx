'use client'

import { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { 
  Calendar, Clock, MapPin, Video, MessageSquare, User, 
  Briefcase, CheckCircle, X, ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

export default function ScheduleInterviewPage() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get candidateId and jobId from URL params if available
  const candidateIdParam = searchParams.get('candidateId')
  const jobIdParam = searchParams.get('jobId')

  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [candidates, setCandidates] = useState<any[]>([])
  const [jobs, setJobs] = useState<any[]>([])

  // Form state
  const [formData, setFormData] = useState({
    candidateId: candidateIdParam || '',
    jobId: jobIdParam || '',
    scheduledDate: '',
    scheduledTime: '',
    duration: '30',
    type: 'video',
    location: '',
    meetingLink: '',
    interviewerName: user?.fullName || '',
    interviewerEmail: user?.emailAddresses?.[0]?.emailAddress || '',
    notes: '',
    round: 'technical'
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const metadata = user?.publicMetadata as Record<string, any> | undefined
    const userRole = metadata?.role
    
    if (userRole !== 'recruiter') {
      router.push('/dashboard')
      return
    }

    loadData()
  }, [user])

  const loadData = async () => {
    try {
      setLoading(true)
      const token = await getToken()
      if (token) apiClient.setToken(token)

      // Load candidates and jobs for dropdowns
      const [candidatesRes, jobsRes] = await Promise.allSettled([
        apiClient.get('/candidates'),
        apiClient.getJobs({ limit: 100 })
      ])

      if (candidatesRes.status === 'fulfilled') {
        setCandidates(candidatesRes.value.data.candidates || candidatesRes.value.data || [])
      }

      if (jobsRes.status === 'fulfilled') {
        setJobs(jobsRes.value.data.jobs || jobsRes.value.data || [])
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.candidateId) newErrors.candidateId = 'Please select a candidate'
    if (!formData.jobId) newErrors.jobId = 'Please select a job'
    if (!formData.scheduledDate) newErrors.scheduledDate = 'Please select a date'
    if (!formData.scheduledTime) newErrors.scheduledTime = 'Please select a time'
    if (!formData.interviewerName) newErrors.interviewerName = 'Interviewer name is required'
    if (!formData.interviewerEmail) newErrors.interviewerEmail = 'Interviewer email is required'
    
    if (formData.type === 'in-person' && !formData.location) {
      newErrors.location = 'Location is required for in-person interviews'
    }
    
    if (formData.type === 'video' && !formData.meetingLink) {
      newErrors.meetingLink = 'Meeting link is required for video interviews'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    try {
      setSubmitting(true)
      const token = await getToken()
      if (token) apiClient.setToken(token)

      // First, find or create a match between candidate and job
      let matchId = null
      try {
        console.log('Looking for match with candidateId:', formData.candidateId, 'jobId:', formData.jobId)
        
        // Try to find existing match
        const matchesResponse = await apiClient.getAllMatches()
        console.log('Matches response:', matchesResponse.data)
        
        // The backend returns { matches: [...] } so we need to access .matches
        const matchesList = matchesResponse.data.matches || matchesResponse.data || []
        console.log('Matches list:', matchesList)
        
        const existingMatch = matchesList.find(
          (m: any) => {
            const candidateMatch = m.candidateId?._id === formData.candidateId || m.candidateId === formData.candidateId
            const jobMatch = m.jobId?._id === formData.jobId || m.jobId === formData.jobId
            return candidateMatch && jobMatch
          }
        )
        
        if (existingMatch) {
          console.log('Found existing match:', existingMatch._id)
          matchId = existingMatch._id
        } else {
          console.log('No existing match found, creating manual match...')
          
          // Create a manual match using the new endpoint
          const manualMatchResponse = await apiClient.createManualMatch(formData.candidateId, formData.jobId)
          console.log('Manual match created:', manualMatchResponse.data)
          matchId = manualMatchResponse.data.match._id
        }
      } catch (matchError: any) {
        console.error('Error finding/creating match:', matchError)
        console.error('Match error details:', matchError.response?.data)
        const errorMsg = matchError.response?.data?.error || matchError.message
        alert(`Failed to create candidate-job match: ${errorMsg}\n\nPlease ensure:\n1. The candidate exists in the system\n2. The job exists and you own it\n3. You have recruiter permissions`)
        return
      }

      // Combine date and time into ISO string
      const scheduledDateTime = new Date(`${formData.scheduledDate}T${formData.scheduledTime}`)

      // Determine meeting platform based on type
      let meetingPlatform = 'in-person'
      if (formData.type === 'video') {
        // Try to detect platform from meeting link
        if (formData.meetingLink?.includes('zoom.us')) {
          meetingPlatform = 'zoom'
        } else if (formData.meetingLink?.includes('meet.google.com')) {
          meetingPlatform = 'google-meet'
        } else if (formData.meetingLink?.includes('teams.microsoft.com')) {
          meetingPlatform = 'microsoft-teams'
        } else {
          meetingPlatform = 'other'
        }
      } else if (formData.type === 'phone') {
        meetingPlatform = 'phone'
      }

      const interviewData = {
        matchId,
        scheduledDateTime: scheduledDateTime.toISOString(),
        duration: parseInt(formData.duration),
        type: formData.type,
        meetingPlatform,
        location: formData.type === 'in-person' ? formData.location : undefined,
        notes: formData.notes
      }

      console.log('Sending interview data:', interviewData)
      await apiClient.scheduleInterview(interviewData)
      
      alert('Interview scheduled successfully!')
      router.push('/dashboard/recruiter')
    } catch (error: any) {
      console.error('Error scheduling interview:', error)
      console.error('Error response:', error.response)
      console.error('Error data:', error.response?.data)
      const errorMessage = error.response?.data?.error || error.response?.data?.message || error.message || 'Failed to schedule interview'
      alert(`Failed to schedule interview: ${errorMessage}`)
    } finally {
      setSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
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
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <Link
          href="/dashboard/recruiter"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="bg-white rounded-xl shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule Interview</h1>
            <p className="text-gray-600">Set up an interview with a candidate for a specific role</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Candidate and Job Selection */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="w-4 h-4 inline mr-1" />
                  Candidate *
                </label>
                <select
                  name="candidateId"
                  value={formData.candidateId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.candidateId ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                  required
                >
                  <option value="">Select a candidate</option>
                  {candidates.map(candidate => (
                    <option key={candidate._id} value={candidate._id}>
                      {candidate.userId?.name || candidate.name || 'Anonymous'} - {candidate.userId?.email}
                    </option>
                  ))}
                </select>
                {errors.candidateId && <p className="text-red-500 text-sm mt-1">{errors.candidateId}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Briefcase className="w-4 h-4 inline mr-1" />
                  Job Position *
                </label>
                <select
                  name="jobId"
                  value={formData.jobId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.jobId ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                  required
                >
                  <option value="">Select a job</option>
                  {jobs.map(job => {
                    const location = typeof job.location === 'string' 
                      ? job.location 
                      : job.location?.city 
                        ? `${job.location.city}${job.location.state ? ', ' + job.location.state : ''}`
                        : 'Location not specified';
                    return (
                      <option key={job._id} value={job._id}>
                        {job.title} - {location}
                      </option>
                    );
                  })}
                </select>
                {errors.jobId && <p className="text-red-500 text-sm mt-1">{errors.jobId}</p>}
              </div>
            </div>

            {/* Date and Time */}
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date *
                </label>
                <input
                  type="date"
                  name="scheduledDate"
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  className={`w-full px-3 py-2 border ${errors.scheduledDate ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                  required
                />
                {errors.scheduledDate && <p className="text-red-500 text-sm mt-1">{errors.scheduledDate}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="w-4 h-4 inline mr-1" />
                  Time *
                </label>
                <input
                  type="time"
                  name="scheduledTime"
                  value={formData.scheduledTime}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.scheduledTime ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                  required
                />
                {errors.scheduledTime && <p className="text-red-500 text-sm mt-1">{errors.scheduledTime}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Duration (minutes) *
                </label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="15">15 minutes</option>
                  <option value="30">30 minutes</option>
                  <option value="45">45 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                </select>
              </div>
            </div>

            {/* Interview Type and Round */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="video">Video Call</option>
                  <option value="in-person">In-Person</option>
                  <option value="phone">Phone Call</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interview Round *
                </label>
                <select
                  name="round"
                  value={formData.round}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="screening">Screening</option>
                  <option value="technical">Technical Round</option>
                  <option value="hr">HR Round</option>
                  <option value="final">Final Round</option>
                  <option value="manager">Manager Round</option>
                </select>
              </div>
            </div>

            {/* Location or Meeting Link */}
            {formData.type === 'in-person' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location *
                </label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  placeholder="Enter interview location"
                  className={`w-full px-3 py-2 border ${errors.location ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                />
                {errors.location && <p className="text-red-500 text-sm mt-1">{errors.location}</p>}
              </div>
            )}

            {formData.type === 'video' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Video className="w-4 h-4 inline mr-1" />
                  Meeting Link *
                </label>
                <input
                  type="url"
                  name="meetingLink"
                  value={formData.meetingLink}
                  onChange={handleChange}
                  placeholder="https://meet.google.com/xyz or https://zoom.us/j/123"
                  className={`w-full px-3 py-2 border ${errors.meetingLink ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                />
                {errors.meetingLink && <p className="text-red-500 text-sm mt-1">{errors.meetingLink}</p>}
              </div>
            )}

            {/* Interviewer Details */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interviewer Name *
                </label>
                <input
                  type="text"
                  name="interviewerName"
                  value={formData.interviewerName}
                  onChange={handleChange}
                  placeholder="Enter interviewer name"
                  className={`w-full px-3 py-2 border ${errors.interviewerName ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                  required
                />
                {errors.interviewerName && <p className="text-red-500 text-sm mt-1">{errors.interviewerName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Interviewer Email *
                </label>
                <input
                  type="email"
                  name="interviewerEmail"
                  value={formData.interviewerEmail}
                  onChange={handleChange}
                  placeholder="interviewer@company.com"
                  className={`w-full px-3 py-2 border ${errors.interviewerEmail ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-blue-500`}
                  required
                />
                {errors.interviewerEmail && <p className="text-red-500 text-sm mt-1">{errors.interviewerEmail}</p>}
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="w-4 h-4 inline mr-1" />
                Notes (Optional)
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Add any additional notes or instructions for the interview..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Scheduling...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Schedule Interview
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                <X className="w-5 h-5 inline mr-1" />
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
