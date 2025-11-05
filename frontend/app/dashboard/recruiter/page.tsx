'use client'

import { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { 
  Briefcase, Users, Calendar, TrendingUp, Clock, CheckCircle, 
  Search, Filter, Mail, Star, AlertCircle, BarChart3, 
  UserCheck, UserX, Eye, MessageSquare, Plus, ArrowRight,
  Award, Target, Zap, ChevronRight, FileText, Activity
} from 'lucide-react'
import Link from 'next/link'

export default function RecruiterDashboard() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<any>(null)
  const [recentMatches, setRecentMatches] = useState<any[]>([])
  const [topCandidates, setTopCandidates] = useState<any[]>([])
  const [interviews, setInterviews] = useState<any[]>([])
  const [recentJobs, setRecentJobs] = useState<any[]>([])

  useEffect(() => {
    // Safely check role
    const metadata = user?.publicMetadata as Record<string, any> | undefined
    const userRole = metadata?.role
    
    if (userRole !== 'recruiter') {
      router.push('/dashboard')
      return
    }
    loadDashboard()
  }, [user])

  const loadDashboard = async () => {
    try {
      const token = await getToken()
      if (token) apiClient.setToken(token)

      const [analyticsRes, interviewsRes, jobsRes, matchesRes] = await Promise.allSettled([
        apiClient.getRecruiterAnalytics(),
        apiClient.getInterviews({ upcoming: 'true', limit: 5 }),
        apiClient.getRecruiterJobs({ limit: 5 }),
        apiClient.getAllMatches({ limit: 10 })
      ])

      // Handle responses safely
      if (analyticsRes.status === 'fulfilled') {
        setAnalytics(analyticsRes.value.data)
      } else {
        console.warn('Analytics failed:', analyticsRes.reason?.message)
        setAnalytics({ overview: { totalJobs: 0, totalMatches: 0, totalInterviews: 0, avgHiringTime: 0 } })
      }

      if (interviewsRes.status === 'fulfilled') {
        setInterviews(interviewsRes.value.data.interviews || [])
      } else {
        console.warn('Interviews failed:', interviewsRes.reason?.message)
        setInterviews([])
      }

      if (jobsRes.status === 'fulfilled') {
        setRecentJobs(jobsRes.value.data.jobs || [])
      } else {
        console.warn('Jobs failed:', jobsRes.reason?.message)
        setRecentJobs([])
      }

      if (matchesRes.status === 'fulfilled') {
        const allMatches = matchesRes.value.data.matches || []
        // Get top candidates (highest scoring)
        const sorted = [...allMatches].sort((a, b) => b.matchScore - a.matchScore)
        setTopCandidates(sorted.slice(0, 5))
        setRecentMatches(allMatches.slice(0, 8))
      } else {
        console.warn('Matches failed:', matchesRes.reason?.message)
        setRecentMatches([])
        setTopCandidates([])
      }
    } catch (error: any) {
      console.error('Error loading dashboard:', error?.message || error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-7 h-7 text-white" />
                </div>
                Recruiter Dashboard
              </h1>
              <p className="text-gray-600 mt-2 text-lg">Welcome back, {user?.firstName}! Here's your hiring overview.</p>
            </div>
            <Link 
              href="/jobs/create" 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 transition flex items-center gap-2 font-semibold shadow-lg"
            >
              <Plus className="w-5 h-5" />
              Post New Job
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Briefcase className="w-7 h-7" />}
            title="Active Jobs"
            value={analytics?.overview?.totalJobs || 0}
            change="+12%"
            color="blue"
            link="/jobs"
          />
          <StatCard
            icon={<Users className="w-7 h-7" />}
            title="Total Candidates"
            value={analytics?.overview?.totalMatches || 0}
            change="+28%"
            color="green"
            link="/matches"
          />
          <StatCard
            icon={<Calendar className="w-7 h-7" />}
            title="Interviews Scheduled"
            value={analytics?.overview?.totalInterviews || 0}
            change="+5%"
            color="purple"
            link="/interviews"
          />
          <StatCard
            icon={<Clock className="w-7 h-7" />}
            title="Avg. Time to Hire"
            value={`${analytics?.overview?.avgHiringTime || 0} days`}
            change="-3 days"
            color="orange"
            link="#"
          />
        </div>

        {/* Quick Actions Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8 border border-gray-100">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-500" />
            Quick Actions
          </h2>
          <div className="grid md:grid-cols-5 gap-3">
            <ActionButton icon={<Search />} label="Find Candidates" href="/candidates" color="blue" />
            <ActionButton icon={<UserCheck />} label="Review Matches" href="/matches" color="green" />
            <ActionButton icon={<Calendar />} label="Schedule Interview" href="/interviews/schedule" color="purple" />
            <ActionButton icon={<Mail />} label="Send Message" href="/messages" color="indigo" />
            <ActionButton icon={<BarChart3 />} label="View Analytics" href="/analytics" color="orange" />
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 mb-8">
          {/* Top Candidates */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Star className="w-6 h-6 text-yellow-500" />
                Top Matched Candidates
              </h2>
              <Link href="/matches" className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1">
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {topCandidates.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 mb-4">No candidate matches yet</p>
                <Link href="/jobs/create" className="text-blue-600 hover:underline">
                  Post a job to start receiving candidates
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {topCandidates.map((match, idx) => (
                  <CandidateCard key={match._id} match={match} rank={idx + 1} />
                ))}
              </div>
            )}
          </div>

          {/* Hiring Pipeline */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600" />
              Hiring Pipeline
            </h2>
            <div className="space-y-4">
              <PipelineStage 
                label="New Applications" 
                count={analytics?.pipeline?.newApplications || 0} 
                color="blue"
                percentage={100}
              />
              <PipelineStage 
                label="In Review" 
                count={analytics?.pipeline?.inReview || 0} 
                color="yellow"
                percentage={75}
              />
              <PipelineStage 
                label="Interview Scheduled" 
                count={analytics?.pipeline?.scheduled || 0} 
                color="purple"
                percentage={50}
              />
              <PipelineStage 
                label="Final Round" 
                count={analytics?.pipeline?.finalRound || 0} 
                color="indigo"
                percentage={30}
              />
              <PipelineStage 
                label="Offers Sent" 
                count={analytics?.pipeline?.offers || 0} 
                color="green"
                percentage={15}
              />
            </div>
            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Conversion Rate</span>
                <span className="font-bold text-green-600">15%</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Upcoming Interviews */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Calendar className="w-6 h-6 text-purple-600" />
                Upcoming Interviews
              </h2>
              <Link href="/interviews" className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1">
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {interviews.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">No upcoming interviews</p>
              </div>
            ) : (
              <div className="space-y-3">
                {interviews.map((interview) => (
                  <InterviewCard key={interview._id} interview={interview} />
                ))}
              </div>
            )}
          </div>

          {/* Recent Jobs */}
          <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Activity className="w-6 h-6 text-blue-600" />
                Active Job Postings
              </h2>
              <Link href="/jobs" className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1">
                View All
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
            {recentJobs.length === 0 ? (
              <div className="text-center py-8">
                <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-3">No active jobs</p>
                <Link 
                  href="/jobs/create" 
                  className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Post Your First Job
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentJobs.map((job) => (
                  <JobCard key={job._id} job={job} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity Feed */}
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Activity className="w-6 h-6 text-green-600" />
            Recent Activity
          </h2>
          <div className="space-y-4">
            {recentMatches.slice(0, 5).map((match, idx) => (
              <ActivityItem key={idx} match={match} />
            ))}
            {recentMatches.length === 0 && (
              <p className="text-gray-500 text-center py-8">No recent activity</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, title, value, change, color, link }: any) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
  }

  const Content = (
    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100 hover:shadow-md transition cursor-pointer">
      <div className={`bg-gradient-to-r ${colors[color as keyof typeof colors]} w-14 h-14 rounded-xl flex items-center justify-center mb-4 text-white`}>
        {icon}
      </div>
      <h3 className="text-gray-600 text-sm mb-1 font-medium">{title}</h3>
      <div className="flex items-end justify-between">
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        <span className="text-xs text-green-600 font-semibold">{change}</span>
      </div>
    </div>
  )

  return link !== '#' ? <Link href={link}>{Content}</Link> : Content
}

function ActionButton({ icon, label, href, color }: any) {
  const colors = {
    blue: 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-200',
    green: 'hover:bg-green-50 hover:text-green-600 hover:border-green-200',
    purple: 'hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200',
    indigo: 'hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200',
    orange: 'hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200',
  }

  return (
    <Link 
      href={href}
      className={`flex flex-col items-center gap-2 p-4 border-2 border-gray-100 rounded-xl transition ${colors[color as keyof typeof colors]}`}
    >
      <div className="w-10 h-10 flex items-center justify-center">
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-700">{label}</span>
    </Link>
  )
}

function CandidateCard({ match, rank }: any) {
  const candidate = match.candidateId
  const job = match.jobId
  
  return (
    <div className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-sm transition">
      <div className="flex items-center gap-4 flex-1">
        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold rounded-lg">
          #{rank}
        </div>
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{candidate?.name || 'Anonymous Candidate'}</p>
          <p className="text-sm text-gray-600">{job?.title || 'Position'}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-500">
              {candidate?.skills?.technical?.slice(0, 3).join(', ') || 'Skills not available'}
            </span>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <div className="text-2xl font-bold text-green-600">{match.matchScore}%</div>
          <div className="text-xs text-gray-500">Match</div>
        </div>
        <Link 
          href={`/candidates/${candidate?._id}`}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
        >
          View Profile
        </Link>
      </div>
    </div>
  )
}

function PipelineStage({ label, count, color, percentage }: any) {
  const colors = {
    blue: 'bg-blue-500',
    yellow: 'bg-yellow-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500',
    green: 'bg-green-500',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-lg font-bold text-gray-900">{count}</span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div 
          className={`${colors[color as keyof typeof colors]} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

function InterviewCard({ interview }: any) {
  return (
    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-purple-200 hover:bg-purple-50/30 transition">
      <div className="flex-1">
        <p className="font-semibold text-gray-900 text-sm">{interview.candidateId?.name || 'Candidate'}</p>
        <p className="text-xs text-gray-600">{interview.jobId?.title || 'Position'}</p>
        <p className="text-xs text-gray-500 mt-1">
          {new Date(interview.scheduledDateTime).toLocaleDateString()} at {new Date(interview.scheduledDateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      <Link 
        href={`/interviews/${interview._id}`}
        className="text-purple-600 hover:text-purple-700 text-sm font-medium"
      >
        <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  )
}

function JobCard({ job }: any) {
  const applicants = job.applicants || 0
  const isNew = new Date(job.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  
  // Format location properly
  const location = job.location 
    ? typeof job.location === 'string' 
      ? job.location 
      : job.location.city || job.location.state || job.location.country || 'Remote'
    : 'Location not specified'

  return (
    <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:border-blue-200 hover:bg-blue-50/30 transition">
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold text-gray-900 text-sm">{job.title}</p>
          {isNew && <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-medium">New</span>}
        </div>
        <p className="text-xs text-gray-600">{location} • {job.type}</p>
        <p className="text-xs text-gray-500 mt-1">{applicants} applicants</p>
      </div>
      <Link 
        href={`/jobs/${job._id}`}
        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
      >
        <ArrowRight className="w-5 h-5" />
      </Link>
    </div>
  )
}

function ActivityItem({ match }: any) {
  const timeDiff = Date.now() - new Date(match.createdAt).getTime()
  const hoursAgo = Math.floor(timeDiff / (1000 * 60 * 60))
  const timeStr = hoursAgo < 1 ? 'Just now' : hoursAgo < 24 ? `${hoursAgo}h ago` : `${Math.floor(hoursAgo / 24)}d ago`

  return (
    <div className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-lg transition">
      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
        <UserCheck className="w-5 h-5 text-green-600" />
      </div>
      <div className="flex-1">
        <p className="text-sm text-gray-900">
          <span className="font-semibold">{match.candidateId?.name || 'New candidate'}</span> matched for{' '}
          <span className="font-semibold">{match.jobId?.title || 'position'}</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {timeStr} • {match.matchScore}% match
        </p>
      </div>
      <Link 
        href={`/candidates/${match.candidateId?._id}`}
        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
      >
        View
      </Link>
    </div>
  )
}
