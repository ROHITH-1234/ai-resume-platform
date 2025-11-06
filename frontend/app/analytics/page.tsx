'use client'

import { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import {
  TrendingUp, Users, Briefcase, Calendar, DollarSign, 
  Clock, Award, Target, BarChart3, PieChart, ArrowLeft,
  TrendingDown, CheckCircle, XCircle, MessageSquare
} from 'lucide-react'
import Link from 'next/link'
import {
  BarChart, Bar, LineChart, Line, PieChart as RePieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts'

export default function AnalyticsPage() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<any>(null)
  const [jobs, setJobs] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])
  const [interviews, setInterviews] = useState<any[]>([])

  useEffect(() => {
    const metadata = user?.publicMetadata as Record<string, any> | undefined
    const userRole = metadata?.role
    
    if (userRole !== 'recruiter') {
      router.push('/dashboard')
      return
    }

    loadAnalytics()
  }, [user])

  const loadAnalytics = async () => {
    try {
      setLoading(true)
      const token = await getToken()
      if (token) apiClient.setToken(token)

      // Load all data for analytics
      const [analyticsRes, jobsRes, matchesRes, interviewsRes] = await Promise.allSettled([
        apiClient.getRecruiterAnalytics(),
        apiClient.getJobs({ limit: 100 }),
        apiClient.getAllMatches({ limit: 1000 }),
        apiClient.getInterviews({ limit: 1000 })
      ])

      if (analyticsRes.status === 'fulfilled') {
        setAnalytics(analyticsRes.value.data)
      }

      if (jobsRes.status === 'fulfilled') {
        setJobs(jobsRes.value.data.jobs || jobsRes.value.data || [])
      }

      if (matchesRes.status === 'fulfilled') {
        setMatches(matchesRes.value.data.matches || matchesRes.value.data || [])
      }

      if (interviewsRes.status === 'fulfilled') {
        setInterviews(interviewsRes.value.data.interviews || interviewsRes.value.data || [])
      }
    } catch (error) {
      console.error('Error loading analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  // Calculate statistics
  const activeJobs = jobs.filter(j => j.status === 'active').length
  const totalApplications = matches.filter(m => m.candidateInterested).length
  const shortlistedCandidates = matches.filter(m => m.status === 'shortlisted').length
  const completedInterviews = interviews.filter(i => i.status === 'completed').length
  const upcomingInterviews = interviews.filter(i => i.status === 'scheduled' && new Date(i.scheduledAt) > new Date()).length

  // Match status distribution
  const matchStatusData = [
    { name: 'Pending', value: matches.filter(m => m.status === 'pending').length, color: '#FCD34D' },
    { name: 'Shortlisted', value: shortlistedCandidates, color: '#34D399' },
    { name: 'Rejected', value: matches.filter(m => m.status === 'rejected').length, color: '#F87171' },
    { name: 'Contacted', value: matches.filter(m => m.status === 'contacted').length, color: '#60A5FA' }
  ]

  // Interview status distribution
  const interviewStatusData = [
    { name: 'Scheduled', value: interviews.filter(i => i.status === 'scheduled').length, color: '#60A5FA' },
    { name: 'Completed', value: completedInterviews, color: '#34D399' },
    { name: 'Cancelled', value: interviews.filter(i => i.status === 'cancelled').length, color: '#F87171' }
  ]

  // Jobs performance (applications per job)
  const jobPerformanceData = jobs.slice(0, 5).map(job => ({
    name: job.title.substring(0, 20) + '...',
    applications: matches.filter(m => m.jobId?._id === job._id && m.candidateInterested).length,
    shortlisted: matches.filter(m => m.jobId?._id === job._id && m.status === 'shortlisted').length
  }))

  // Monthly trend (mock data - in real app, calculate from actual dates)
  const monthlyTrendData = [
    { month: 'Jan', applications: 45, interviews: 12, hires: 3 },
    { month: 'Feb', applications: 52, interviews: 15, hires: 4 },
    { month: 'Mar', applications: 48, interviews: 13, hires: 3 },
    { month: 'Apr', applications: 61, interviews: 18, hires: 5 },
    { month: 'May', applications: totalApplications, interviews: interviews.length, hires: 2 }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <Link
          href="/dashboard/recruiter"
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics Dashboard</h1>
          <p className="text-gray-600">Comprehensive overview of your recruitment metrics</p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Briefcase className="w-6 h-6 text-blue-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{activeJobs}</h3>
            <p className="text-sm text-gray-600">Active Job Postings</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{totalApplications}</h3>
            <p className="text-sm text-gray-600">Total Applications</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Award className="w-6 h-6 text-yellow-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{shortlistedCandidates}</h3>
            <p className="text-sm text-gray-600">Shortlisted Candidates</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Calendar className="w-6 h-6 text-purple-600" />
              </div>
              <TrendingUp className="w-5 h-5 text-green-500" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{upcomingInterviews}</h3>
            <p className="text-sm text-gray-600">Upcoming Interviews</p>
          </div>
        </div>

        {/* Charts Row 1 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Monthly Trends */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Monthly Trends
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="applications" stroke="#3B82F6" strokeWidth={2} name="Applications" />
                <Line type="monotone" dataKey="interviews" stroke="#10B981" strokeWidth={2} name="Interviews" />
                <Line type="monotone" dataKey="hires" stroke="#8B5CF6" strokeWidth={2} name="Hires" />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Job Performance */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              Top Job Postings
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={jobPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="applications" fill="#3B82F6" name="Applications" />
                <Bar dataKey="shortlisted" fill="#10B981" name="Shortlisted" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Charts Row 2 */}
        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          {/* Match Status Distribution */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <PieChart className="w-5 h-5 text-blue-600" />
              Match Status Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={matchStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {matchStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-2 gap-4 mt-4">
              {matchStatusData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Interview Status */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Interview Status
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <RePieChart>
                <Pie
                  data={interviewStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {interviewStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </RePieChart>
            </ResponsiveContainer>
            <div className="grid grid-cols-3 gap-4 mt-4">
              {interviewStatusData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-sm text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Additional Stats */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Success Rate</h3>
                <p className="text-2xl font-bold text-green-600">
                  {totalApplications > 0 ? Math.round((shortlistedCandidates / totalApplications) * 100) : 0}%
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">Applications to Shortlist conversion</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Avg. Time to Hire</h3>
                <p className="text-2xl font-bold text-blue-600">18 days</p>
              </div>
            </div>
            <p className="text-sm text-gray-600">From application to offer</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Target className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Interview Rate</h3>
                <p className="text-2xl font-bold text-purple-600">
                  {totalApplications > 0 ? Math.round((interviews.length / totalApplications) * 100) : 0}%
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">Applications to Interview conversion</p>
          </div>
        </div>
      </div>
    </div>
  )
}
