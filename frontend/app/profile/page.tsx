'use client'

import { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { User, Mail, MapPin, Briefcase, Calendar, Award, FileText, Edit, CheckCircle, DollarSign, Clock } from 'lucide-react'
import Link from 'next/link'
import LoadingSpinner from '@/components/LoadingSpinner'
import PageTransition from '@/components/PageTransition'

export default function CandidateProfile() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [candidate, setCandidate] = useState<any>(null)
  const [resume, setResume] = useState<any>(null)
  const [appliedJobs, setAppliedJobs] = useState<any[]>([])
  const [matches, setMatches] = useState<any[]>([])

  useEffect(() => {
    const metadata = user?.publicMetadata as Record<string, any> | undefined
    const userRole = metadata?.role
    
    if (userRole !== 'candidate') {
      router.push('/dashboard')
      return
    }
    loadProfile()
  }, [user])

  const loadProfile = async () => {
    try {
      const token = await getToken()
      if (token) apiClient.setToken(token)

      // Get candidate profile, resume, and matches
      const [candidateRes, resumeRes, matchesRes] = await Promise.allSettled([
        apiClient.get('/candidates/me'),
        apiClient.get('/resumes/my-resume'),
        apiClient.getAllMatches({})
      ])

      if (candidateRes.status === 'fulfilled') {
        setCandidate(candidateRes.value.data)
      }

      if (resumeRes.status === 'fulfilled') {
        setResume(resumeRes.value.data)
      }

      if (matchesRes.status === 'fulfilled') {
        const allMatches = matchesRes.value.data.matches || matchesRes.value.data || []
        setMatches(allMatches)
        
        // Filter for applied jobs (where candidateInterested is true)
        const applied = allMatches.filter((match: any) => match.candidateInterested === true)
        setAppliedJobs(applied)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading your profile..." size="lg" />
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-start">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{candidate?.userId?.name || user?.fullName}</h1>
                <p className="text-gray-600 flex items-center mt-1">
                  <Mail className="w-4 h-4 mr-2" />
                  {candidate?.userId?.email || user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </div>
            <button
              onClick={() => router.push('/resume/upload')}
              className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Profile</span>
            </button>
          </div>
        </div>

        {/* Basic Info */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Profile Information</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-600">Phone</label>
              <p className="text-gray-900">{candidate?.phone || 'Not provided'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Location</label>
              <p className="text-gray-900 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {candidate?.location || 'Not provided'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Experience</label>
              <p className="text-gray-900">{candidate?.totalExperience || 0} years</p>
            </div>
            <div>
              <label className="text-sm text-gray-600">Expected Salary</label>
              <p className="text-gray-900">${candidate?.expectedSalary?.toLocaleString() || 'Not specified'}</p>
            </div>
          </div>
        </div>

        {/* Skills */}
        {candidate?.skills && candidate.skills.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2" />
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
        {candidate?.experience && candidate.experience.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Briefcase className="w-5 h-5 mr-2" />
              Work Experience
            </h2>
            <div className="space-y-4">
              {candidate.experience.map((exp: any, idx: number) => (
                <div key={idx} className="border-l-4 border-blue-600 pl-4">
                  <h3 className="font-semibold text-gray-900">{exp.title || exp.position}</h3>
                  <p className="text-gray-700">{exp.company}</p>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <Calendar className="w-4 h-4 mr-1" />
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
        {candidate?.education && candidate.education.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Education
            </h2>
            <div className="space-y-4">
              {candidate.education.map((edu: any, idx: number) => (
                <div key={idx} className="border-l-4 border-green-600 pl-4">
                  <h3 className="font-semibold text-gray-900">{edu.degree}</h3>
                  <p className="text-gray-700">{edu.institution}</p>
                  <p className="text-sm text-gray-600">
                    {edu.year || `${edu.startYear} - ${edu.endYear}`}
                  </p>
                  {edu.grade && (
                    <p className="text-sm text-gray-600 mt-1">Grade: {edu.grade}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Applied Jobs */}
        {appliedJobs.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
              Applied Jobs ({appliedJobs.length})
            </h2>
            <div className="space-y-4">
              {appliedJobs.map((match: any) => (
                <div key={match._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <Link 
                        href={`/jobs/${match.jobId?._id}`}
                        className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition"
                      >
                        {match.jobId?.title || 'Job Title'}
                      </Link>
                      <p className="text-gray-600 flex items-center gap-2 mt-1">
                        <Briefcase className="w-4 h-4" />
                        {match.jobId?.company || 'Company Name'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        match.matchScore >= 70 ? 'bg-green-100 text-green-800' :
                        match.matchScore >= 50 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {match.matchScore}% Match
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        match.status === 'shortlisted' ? 'bg-green-100 text-green-800' :
                        match.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        match.status === 'contacted' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {match.status || 'pending'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-3 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {match.jobId?.location || 'Location not specified'}
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      ${match.jobId?.salaryMin?.toLocaleString()} - ${match.jobId?.salaryMax?.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Applied {new Date(match.createdAt || match.matchedAt).toLocaleDateString()}
                    </div>
                  </div>

                  {match.jobId?.requiredSkills && match.jobId.requiredSkills.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {match.jobId.requiredSkills.slice(0, 5).map((skill: string, idx: number) => (
                        <span key={idx} className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs">
                          {skill}
                        </span>
                      ))}
                      {match.jobId.requiredSkills.length > 5 && (
                        <span className="text-xs text-gray-500">+{match.jobId.requiredSkills.length - 5} more</span>
                      )}
                    </div>
                  )}

                  <div className="mt-4 flex gap-3">
                    <Link
                      href={`/jobs/${match.jobId?._id}`}
                      className="flex-1 text-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition text-sm font-medium"
                    >
                      View Job Details
                    </Link>
                    {match.status === 'shortlisted' && (
                      <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                        <CheckCircle className="w-4 h-4" />
                        Shortlisted!
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications */}
        {candidate?.certifications && candidate.certifications.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Certifications
            </h2>
            <div className="space-y-2">
              {candidate.certifications.map((cert: any, idx: number) => (
                <div key={idx} className="flex items-start space-x-2">
                  <Award className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{cert.name || cert}</p>
                    {cert.issuer && <p className="text-sm text-gray-600">{cert.issuer}</p>}
                    {cert.year && <p className="text-xs text-gray-500">{cert.year}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resume File */}
        {resume && (
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2" />
              Resume Document
            </h2>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium text-gray-900">{resume.fileName || 'Resume.pdf'}</p>
                <p className="text-sm text-gray-600">Uploaded on {new Date(resume.uploadedAt || resume.createdAt).toLocaleDateString()}</p>
              </div>
              {resume.fileUrl && (
                <a
                  href={resume.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  Download →
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
    </PageTransition>
  )
}
