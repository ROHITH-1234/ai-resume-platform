'use client'

import { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { Calendar, Clock, MapPin, Video, Phone, User, Briefcase, FileText, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function InterviewsPage() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [interviews, setInterviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed' | 'cancelled'>('upcoming')
  
  // Safely extract role
  const metadata = user?.publicMetadata as Record<string, any> | undefined
  const userRole = typeof metadata?.role === 'string' ? metadata.role : null

  useEffect(() => {
    loadInterviews()
  }, [filter])

  const loadInterviews = async () => {
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
        params.status = filter === 'upcoming' ? 'scheduled' : filter
      }

      const response = await apiClient.getInterviews(params)
      setInterviews(response.data.interviews || [])
    } catch (error) {
      console.error('Failed to load interviews:', error)
      setInterviews([])
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (interviewId: string, status: string) => {
    try {
      const token = await getToken()
      if (!token) return

      apiClient.setToken(token)
      await apiClient.updateInterviewStatus(interviewId, status)
      
      // Refresh interviews
      loadInterviews()
    } catch (error) {
      console.error('Failed to update status:', error)
      alert('Failed to update status. Please try again.')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: any = {
      'scheduled': 'bg-blue-100 text-blue-700',
      'confirmed': 'bg-green-100 text-green-700',
      'completed': 'bg-gray-100 text-gray-700',
      'cancelled': 'bg-red-100 text-red-700',
      'rescheduled': 'bg-orange-100 text-orange-700'
    }
    return colors[status] || 'bg-gray-100 text-gray-700'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
      case 'confirmed':
        return <Clock className="w-4 h-4" />
      case 'completed':
        return <CheckCircle className="w-4 h-4" />
      case 'cancelled':
        return <XCircle className="w-4 h-4" />
      case 'rescheduled':
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getInterviewTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="w-5 h-5" />
      case 'phone':
        return <Phone className="w-5 h-5" />
      case 'in-person':
        return <MapPin className="w-5 h-5" />
      default:
        return <Calendar className="w-5 h-5" />
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return {
      date: date.toLocaleDateString('en-US', { 
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      time: date.toLocaleTimeString('en-US', { 
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  }

  const isUpcoming = (dateString: string) => {
    return new Date(dateString) > new Date()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Interviews</h1>
          <p className="text-lg text-gray-600">
            Manage your scheduled interviews and feedback
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                filter === 'upcoming'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              Upcoming
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                filter === 'completed'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <CheckCircle className="w-4 h-4" />
              Completed
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
                filter === 'cancelled'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <XCircle className="w-4 h-4" />
              Cancelled
            </button>
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition ${
                filter === 'all'
                  ? 'bg-gray-800 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
          </div>
        </div>

        {/* Interviews List */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
          </div>
        ) : interviews.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No interviews scheduled</h3>
            <p className="text-gray-600 mb-6">
              {filter === 'all'
                ? 'You don\'t have any interviews yet'
                : `No ${filter} interviews`}
            </p>
            {filter === 'all' && userRole === 'candidate' && (
              <Link
                href="/matches"
                className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-medium"
              >
                View Job Matches
              </Link>
            )}
          </div>
        ) : (
          <div className="grid gap-6">
            {interviews.map((interview) => {
              const { date, time } = formatDateTime(interview.scheduledDateTime)
              const upcoming = isUpcoming(interview.scheduledDateTime)

              return (
                <div
                  key={interview._id}
                  className="bg-white rounded-xl shadow-md hover:shadow-xl transition p-6"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          {getInterviewTypeIcon(interview.interviewType)}
                        </div>
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {interview.job?.title || 'Interview'}
                          </h3>
                          <p className="text-gray-600">{interview.job?.company || 'Company'}</p>
                        </div>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1 ${getStatusColor(interview.status)}`}>
                      {getStatusIcon(interview.status)}
                      {interview.status.charAt(0).toUpperCase() + interview.status.slice(1)}
                    </span>
                  </div>

                  {/* Interview Details */}
                  <div className="grid md:grid-cols-2 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Date</p>
                        <p className="font-semibold text-gray-900">{date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-xs text-gray-500">Time</p>
                        <p className="font-semibold text-gray-900">{time}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 flex items-center justify-center text-gray-400">
                        {getInterviewTypeIcon(interview.interviewType)}
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Type</p>
                        <p className="font-semibold text-gray-900 capitalize">{interview.interviewType}</p>
                      </div>
                    </div>

                    {interview.duration && (
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-gray-400" />
                        <div>
                          <p className="text-xs text-gray-500">Duration</p>
                          <p className="font-semibold text-gray-900">{interview.duration} minutes</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Interviewer Info */}
                  {interview.interviewer && (
                    <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Interviewer</p>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-blue-600" />
                        <span className="text-gray-900">{interview.interviewer.name || 'Not specified'}</span>
                        {interview.interviewer.email && (
                          <span className="text-gray-600">({interview.interviewer.email})</span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Meeting Link */}
                  {interview.meetingLink && interview.status !== 'cancelled' && (
                    <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Meeting Link</p>
                      <a
                        href={interview.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline flex items-center gap-2"
                      >
                        <Video className="w-4 h-4" />
                        Join Meeting
                      </a>
                    </div>
                  )}

                  {/* Notes */}
                  {interview.notes && (
                    <div className="mb-4">
                      <p className="text-sm font-semibold text-gray-700 mb-2">Notes</p>
                      <p className="text-gray-600 text-sm">{interview.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-wrap gap-3">
                    {upcoming && interview.status === 'scheduled' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(interview._id, 'confirmed')}
                          className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition font-medium flex items-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Confirm
                        </button>
                        <Link
                          href={`/interviews/${interview._id}/reschedule`}
                          className="bg-orange-50 text-orange-700 border border-orange-200 px-6 py-2 rounded-lg hover:bg-orange-100 transition font-medium flex items-center gap-2"
                        >
                          <Clock className="w-4 h-4" />
                          Reschedule
                        </Link>
                        <button
                          onClick={() => handleStatusUpdate(interview._id, 'cancelled')}
                          className="bg-red-50 text-red-700 border border-red-200 px-6 py-2 rounded-lg hover:bg-red-100 transition font-medium flex items-center gap-2"
                        >
                          <XCircle className="w-4 h-4" />
                          Cancel
                        </button>
                      </>
                    )}

                    {interview.status === 'completed' && !interview.feedback && (
                      <Link
                        href={`/interviews/${interview._id}/feedback`}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Submit Feedback
                      </Link>
                    )}

                    {interview.status === 'completed' && interview.feedback && (
                      <Link
                        href={`/interviews/${interview._id}/feedback`}
                        className="bg-gray-100 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-200 transition font-medium flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        View Feedback
                      </Link>
                    )}

                    <Link
                      href={`/jobs/${interview.job?._id}`}
                      className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition font-medium flex items-center gap-2"
                    >
                      <Briefcase className="w-4 h-4" />
                      View Job
                    </Link>
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
