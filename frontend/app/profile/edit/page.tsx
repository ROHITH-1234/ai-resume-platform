'use client'

import { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { 
  User, Mail, Phone, MapPin, Briefcase, Calendar, Award, 
  Globe, Linkedin, Github, Twitter, DollarSign, Clock, 
  Save, X, Plus, Trash2, GraduationCap, FileText, Link as LinkIcon
} from 'lucide-react'
import LoadingSpinner from '@/components/LoadingSpinner'

export default function EditProfile() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [candidate, setCandidate] = useState<any>(null)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    location: {
      city: '',
      state: '',
      country: ''
    },
    headline: '',
    bio: '',
    website: '',
    linkedin: '',
    github: '',
    twitter: '',
    skills: {
      technical: [] as string[],
      soft: [] as string[]
    },
    experience: {
      totalYears: 0,
      jobs: [] as any[]
    },
    education: [] as any[],
    certifications: [] as any[],
    preferences: {
      jobType: [] as string[],
      expectedSalary: {
        min: 0,
        max: 0,
        currency: 'USD'
      },
      preferredLocations: [] as string[],
      willingToRelocate: false
    },
    languages: [] as any[],
    projects: [] as any[]
  })

  const [newSkill, setNewSkill] = useState('')
  const [newSoftSkill, setNewSoftSkill] = useState('')
  const [newLocation, setNewLocation] = useState('')
  const [newLanguage, setNewLanguage] = useState({ name: '', proficiency: 'intermediate' })

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

      const response = await apiClient.get('/candidates/me')
      const candidateData = response.data
      setCandidate(candidateData)

      // Populate form with existing data
      setFormData({
        name: candidateData.name || user?.fullName || '',
        phone: candidateData.phone || '',
        location: candidateData.location || { city: '', state: '', country: '' },
        headline: candidateData.headline || '',
        bio: candidateData.bio || '',
        website: candidateData.website || '',
        linkedin: candidateData.linkedin || '',
        github: candidateData.github || '',
        twitter: candidateData.twitter || '',
        skills: candidateData.skills || { technical: [], soft: [] },
        experience: candidateData.experience || { totalYears: 0, jobs: [] },
        education: candidateData.education || [],
        certifications: candidateData.certifications || [],
        preferences: candidateData.preferences || {
          jobType: [],
          expectedSalary: { min: 0, max: 0, currency: 'USD' },
          preferredLocations: [],
          willingToRelocate: false
        },
        languages: candidateData.languages || [],
        projects: candidateData.projects || []
      })
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const token = await getToken()
      if (token) apiClient.setToken(token)

      await apiClient.put('/candidates/me', formData)
      
      alert('Profile updated successfully!')
      router.push('/profile')
    } catch (error: any) {
      console.error('Error updating profile:', error)
      alert(error.response?.data?.message || 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  const addTechnicalSkill = () => {
    if (newSkill.trim()) {
      setFormData({
        ...formData,
        skills: {
          ...formData.skills,
          technical: [...formData.skills.technical, newSkill.trim()]
        }
      })
      setNewSkill('')
    }
  }

  const removeTechnicalSkill = (index: number) => {
    setFormData({
      ...formData,
      skills: {
        ...formData.skills,
        technical: formData.skills.technical.filter((_, i) => i !== index)
      }
    })
  }

  const addSoftSkill = () => {
    if (newSoftSkill.trim()) {
      setFormData({
        ...formData,
        skills: {
          ...formData.skills,
          soft: [...formData.skills.soft, newSoftSkill.trim()]
        }
      })
      setNewSoftSkill('')
    }
  }

  const removeSoftSkill = (index: number) => {
    setFormData({
      ...formData,
      skills: {
        ...formData.skills,
        soft: formData.skills.soft.filter((_, i) => i !== index)
      }
    })
  }

  const addJob = () => {
    setFormData({
      ...formData,
      experience: {
        ...formData.experience,
        jobs: [
          ...formData.experience.jobs,
          {
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            current: false,
            description: ''
          }
        ]
      }
    })
  }

  const updateJob = (index: number, field: string, value: any) => {
    const updatedJobs = [...formData.experience.jobs]
    updatedJobs[index] = { ...updatedJobs[index], [field]: value }
    setFormData({
      ...formData,
      experience: { ...formData.experience, jobs: updatedJobs }
    })
  }

  const removeJob = (index: number) => {
    setFormData({
      ...formData,
      experience: {
        ...formData.experience,
        jobs: formData.experience.jobs.filter((_, i) => i !== index)
      }
    })
  }

  const addEducation = () => {
    setFormData({
      ...formData,
      education: [
        ...formData.education,
        {
          degree: '',
          institution: '',
          fieldOfStudy: '',
          graduationYear: new Date().getFullYear(),
          gpa: 0
        }
      ]
    })
  }

  const updateEducation = (index: number, field: string, value: any) => {
    const updatedEducation = [...formData.education]
    updatedEducation[index] = { ...updatedEducation[index], [field]: value }
    setFormData({ ...formData, education: updatedEducation })
  }

  const removeEducation = (index: number) => {
    setFormData({
      ...formData,
      education: formData.education.filter((_, i) => i !== index)
    })
  }

  const addCertification = () => {
    setFormData({
      ...formData,
      certifications: [
        ...formData.certifications,
        {
          name: '',
          issuer: '',
          dateIssued: '',
          expiryDate: '',
          credentialId: ''
        }
      ]
    })
  }

  const updateCertification = (index: number, field: string, value: any) => {
    const updatedCerts = [...formData.certifications]
    updatedCerts[index] = { ...updatedCerts[index], [field]: value }
    setFormData({ ...formData, certifications: updatedCerts })
  }

  const removeCertification = (index: number) => {
    setFormData({
      ...formData,
      certifications: formData.certifications.filter((_, i) => i !== index)
    })
  }

  const addProject = () => {
    setFormData({
      ...formData,
      projects: [
        ...formData.projects,
        {
          name: '',
          description: '',
          technologies: [],
          url: '',
          startDate: '',
          endDate: ''
        }
      ]
    })
  }

  const updateProject = (index: number, field: string, value: any) => {
    const updatedProjects = [...formData.projects]
    updatedProjects[index] = { ...updatedProjects[index], [field]: value }
    setFormData({ ...formData, projects: updatedProjects })
  }

  const removeProject = (index: number) => {
    setFormData({
      ...formData,
      projects: formData.projects.filter((_, i) => i !== index)
    })
  }

  const addPreferredLocation = () => {
    if (newLocation.trim()) {
      setFormData({
        ...formData,
        preferences: {
          ...formData.preferences,
          preferredLocations: [...formData.preferences.preferredLocations, newLocation.trim()]
        }
      })
      setNewLocation('')
    }
  }

  const removePreferredLocation = (index: number) => {
    setFormData({
      ...formData,
      preferences: {
        ...formData.preferences,
        preferredLocations: formData.preferences.preferredLocations.filter((_, i) => i !== index)
      }
    })
  }

  const toggleJobType = (type: string) => {
    const current = formData.preferences.jobType
    setFormData({
      ...formData,
      preferences: {
        ...formData.preferences,
        jobType: current.includes(type)
          ? current.filter(t => t !== type)
          : [...current, type]
      }
    })
  }

  const addLanguage = () => {
    if (newLanguage.name.trim()) {
      setFormData({
        ...formData,
        languages: [...formData.languages, { ...newLanguage }]
      })
      setNewLanguage({ name: '', proficiency: 'intermediate' })
    }
  }

  const removeLanguage = (index: number) => {
    setFormData({
      ...formData,
      languages: formData.languages.filter((_, i) => i !== index)
    })
  }

  if (loading) {
    return <LoadingSpinner fullScreen message="Loading profile..." size="lg" />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Edit Profile</h1>
            <button
              onClick={() => router.push('/profile')}
              className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
            >
              <X className="w-5 h-5" />
              <span>Cancel</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <User className="w-5 h-5 mr-2" />
              Basic Information
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Professional Headline</label>
                <input
                  type="text"
                  placeholder="e.g., Senior Full Stack Developer | React & Node.js Expert"
                  value={formData.headline}
                  onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Bio / Summary</label>
                <textarea
                  rows={4}
                  placeholder="Write a brief summary about yourself, your experience, and career goals..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <MapPin className="w-5 h-5 mr-2" />
              Location
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  value={formData.location.city}
                  onChange={(e) => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  value={formData.location.state}
                  onChange={(e) => setFormData({ ...formData, location: { ...formData.location, state: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  value={formData.location.country}
                  onChange={(e) => setFormData({ ...formData, location: { ...formData.location, country: e.target.value } })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <LinkIcon className="w-5 h-5 mr-2" />
              Social Links & Portfolio
            </h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Globe className="w-4 h-4 inline mr-1" />
                  Website / Portfolio
                </label>
                <input
                  type="url"
                  placeholder="https://yourportfolio.com"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Linkedin className="w-4 h-4 inline mr-1" />
                  LinkedIn
                </label>
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/yourprofile"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Github className="w-4 h-4 inline mr-1" />
                  GitHub
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/yourusername"
                  value={formData.github}
                  onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  <Twitter className="w-4 h-4 inline mr-1" />
                  Twitter
                </label>
                <input
                  type="url"
                  placeholder="https://twitter.com/yourhandle"
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Technical Skills */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2" />
              Technical Skills
            </h2>
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a skill (e.g., React, Python, AWS)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnicalSkill())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addTechnicalSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.technical.map((skill, idx) => (
                <span key={idx} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeTechnicalSkill(idx)}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Soft Skills */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Soft Skills</h2>
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Add a soft skill (e.g., Leadership, Communication)"
                  value={newSoftSkill}
                  onChange={(e) => setNewSoftSkill(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSoftSkill())}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={addSoftSkill}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.skills.soft.map((skill, idx) => (
                <span key={idx} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSoftSkill(idx)}
                    className="text-green-600 hover:text-green-800"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Work Experience */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <Briefcase className="w-5 h-5 mr-2" />
                Work Experience
              </h2>
              <button
                type="button"
                onClick={addJob}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Job
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Years of Experience</label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={formData.experience.totalYears}
                onChange={(e) => setFormData({
                  ...formData,
                  experience: { ...formData.experience, totalYears: parseFloat(e.target.value) || 0 }
                })}
                className="w-full md:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="space-y-4">
              {formData.experience.jobs.map((job, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold">Job #{idx + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeJob(idx)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
                      <input
                        type="text"
                        required
                        value={job.company}
                        onChange={(e) => updateJob(idx, 'company', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Position *</label>
                      <input
                        type="text"
                        required
                        value={job.position}
                        onChange={(e) => updateJob(idx, 'position', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={job.startDate}
                        onChange={(e) => updateJob(idx, 'startDate', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={job.endDate}
                        onChange={(e) => updateJob(idx, 'endDate', e.target.value)}
                        disabled={job.current}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={job.current}
                          onChange={(e) => updateJob(idx, 'current', e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Currently working here</span>
                      </label>
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={job.description}
                        onChange={(e) => updateJob(idx, 'description', e.target.value)}
                        placeholder="Describe your responsibilities and achievements..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Education */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <GraduationCap className="w-5 h-5 mr-2" />
                Education
              </h2>
              <button
                type="button"
                onClick={addEducation}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Education
              </button>
            </div>
            <div className="space-y-4">
              {formData.education.map((edu, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold">Education #{idx + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeEducation(idx)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Degree *</label>
                      <input
                        type="text"
                        required
                        value={edu.degree}
                        onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                        placeholder="e.g., Bachelor of Science"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Institution *</label>
                      <input
                        type="text"
                        required
                        value={edu.institution}
                        onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                        placeholder="e.g., MIT"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study</label>
                      <input
                        type="text"
                        value={edu.fieldOfStudy}
                        onChange={(e) => updateEducation(idx, 'fieldOfStudy', e.target.value)}
                        placeholder="e.g., Computer Science"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Year</label>
                      <input
                        type="number"
                        min="1950"
                        max="2050"
                        value={edu.graduationYear}
                        onChange={(e) => updateEducation(idx, 'graduationYear', parseInt(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">GPA (optional)</label>
                      <input
                        type="number"
                        min="0"
                        max="4"
                        step="0.01"
                        value={edu.gpa}
                        onChange={(e) => updateEducation(idx, 'gpa', parseFloat(e.target.value))}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <Award className="w-5 h-5 mr-2" />
                Certifications
              </h2>
              <button
                type="button"
                onClick={addCertification}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Certification
              </button>
            </div>
            <div className="space-y-4">
              {formData.certifications.map((cert, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold">Certification #{idx + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeCertification(idx)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Certification Name *</label>
                      <input
                        type="text"
                        required
                        value={cert.name}
                        onChange={(e) => updateCertification(idx, 'name', e.target.value)}
                        placeholder="e.g., AWS Certified Solutions Architect"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Organization</label>
                      <input
                        type="text"
                        value={cert.issuer}
                        onChange={(e) => updateCertification(idx, 'issuer', e.target.value)}
                        placeholder="e.g., Amazon Web Services"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date Issued</label>
                      <input
                        type="date"
                        value={cert.dateIssued}
                        onChange={(e) => updateCertification(idx, 'dateIssued', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date (if applicable)</label>
                      <input
                        type="date"
                        value={cert.expiryDate}
                        onChange={(e) => updateCertification(idx, 'expiryDate', e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Credential ID</label>
                      <input
                        type="text"
                        value={cert.credentialId}
                        onChange={(e) => updateCertification(idx, 'credentialId', e.target.value)}
                        placeholder="Certification ID or credential number"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold flex items-center">
                <FileText className="w-5 h-5 mr-2" />
                Projects
              </h2>
              <button
                type="button"
                onClick={addProject}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                Add Project
              </button>
            </div>
            <div className="space-y-4">
              {formData.projects.map((project, idx) => (
                <div key={idx} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-semibold">Project #{idx + 1}</h3>
                    <button
                      type="button"
                      onClick={() => removeProject(idx)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
                      <input
                        type="text"
                        required
                        value={project.name}
                        onChange={(e) => updateProject(idx, 'name', e.target.value)}
                        placeholder="e.g., E-Commerce Platform"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea
                        rows={3}
                        value={project.description}
                        onChange={(e) => updateProject(idx, 'description', e.target.value)}
                        placeholder="Describe the project, your role, and key achievements..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Technologies Used (comma separated)</label>
                      <input
                        type="text"
                        value={project.technologies?.join(', ')}
                        onChange={(e) => updateProject(idx, 'technologies', e.target.value.split(',').map((t: string) => t.trim()))}
                        placeholder="e.g., React, Node.js, MongoDB, AWS"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project URL</label>
                      <input
                        type="url"
                        value={project.url}
                        onChange={(e) => updateProject(idx, 'url', e.target.value)}
                        placeholder="https://github.com/..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                      <input
                        type="text"
                        value={project.startDate && project.endDate ? `${project.startDate} - ${project.endDate}` : ''}
                        onChange={(e) => {
                          const [start, end] = e.target.value.split('-').map((d: string) => d.trim())
                          updateProject(idx, 'startDate', start)
                          updateProject(idx, 'endDate', end)
                        }}
                        placeholder="e.g., Jan 2023 - Mar 2023"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4">Languages</h2>
            <div className="mb-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Language name"
                  value={newLanguage.name}
                  onChange={(e) => setNewLanguage({ ...newLanguage, name: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={newLanguage.proficiency}
                  onChange={(e) => setNewLanguage({ ...newLanguage, proficiency: e.target.value })}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="native">Native</option>
                </select>
                <button
                  type="button"
                  onClick={addLanguage}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="space-y-2">
              {formData.languages.map((lang, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <span className="font-medium">{lang.name}</span>
                    <span className="text-sm text-gray-600 ml-2">({lang.proficiency})</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeLanguage(idx)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Job Preferences */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Job Preferences
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Job Types</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {['full-time', 'part-time', 'contract', 'remote'].map((type) => (
                    <label key={type} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.preferences.jobType.includes(type)}
                        onChange={() => toggleJobType(type)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm capitalize">{type.replace('-', ' ')}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Salary Range</label>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.preferences.expectedSalary.min}
                      onChange={(e) => setFormData({
                        ...formData,
                        preferences: {
                          ...formData.preferences,
                          expectedSalary: {
                            ...formData.preferences.expectedSalary,
                            min: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      placeholder="Min"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.preferences.expectedSalary.max}
                      onChange={(e) => setFormData({
                        ...formData,
                        preferences: {
                          ...formData.preferences,
                          expectedSalary: {
                            ...formData.preferences.expectedSalary,
                            max: parseInt(e.target.value) || 0
                          }
                        }
                      })}
                      placeholder="Max"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <select
                      value={formData.preferences.expectedSalary.currency}
                      onChange={(e) => setFormData({
                        ...formData,
                        preferences: {
                          ...formData.preferences,
                          expectedSalary: {
                            ...formData.preferences.expectedSalary,
                            currency: e.target.value
                          }
                        }
                      })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="INR">INR</option>
                    </select>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preferred Work Locations</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Add a location (e.g., New York, NY)"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPreferredLocation())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addPreferredLocation}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.preferences.preferredLocations.map((loc, idx) => (
                    <span key={idx} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                      {loc}
                      <button
                        type="button"
                        onClick={() => removePreferredLocation(idx)}
                        className="text-purple-600 hover:text-purple-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.preferences.willingToRelocate}
                    onChange={(e) => setFormData({
                      ...formData,
                      preferences: {
                        ...formData.preferences,
                        willingToRelocate: e.target.checked
                      }
                    })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Willing to relocate</span>
                </label>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Clock className="w-5 h-5 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Profile
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => router.push('/profile')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
