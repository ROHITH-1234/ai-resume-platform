'use client'

import { useState } from 'react'
import { useAuth } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { Briefcase, MapPin, DollarSign, FileText, Users, Clock, Plus, X, Loader2 } from 'lucide-react'

export default function CreateJobPage() {
  const { getToken } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const [formData, setFormData] = useState({
    title: '',
    company: '',
    description: '',
    requirements: '',
    responsibilities: '',
    jobType: 'full-time',
    experienceLevel: 'mid',
    locationCity: '',
    locationState: '',
    locationCountry: 'USA',
    isRemote: false,
    salaryMin: '',
    salaryMax: '',
    salaryCurrency: 'USD',
    requiredSkills: [] as string[],
    preferredSkills: [] as string[],
    benefits: [] as string[],
    applicationDeadline: '',
  })

  const [currentSkill, setCurrentSkill] = useState('')
  const [currentPreferredSkill, setCurrentPreferredSkill] = useState('')
  const [currentBenefit, setCurrentBenefit] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const addSkill = () => {
    if (currentSkill.trim() && !formData.requiredSkills.includes(currentSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        requiredSkills: [...prev.requiredSkills, currentSkill.trim()]
      }))
      setCurrentSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      requiredSkills: prev.requiredSkills.filter(s => s !== skill)
    }))
  }

  const addPreferredSkill = () => {
    if (currentPreferredSkill.trim() && !formData.preferredSkills.includes(currentPreferredSkill.trim())) {
      setFormData(prev => ({
        ...prev,
        preferredSkills: [...prev.preferredSkills, currentPreferredSkill.trim()]
      }))
      setCurrentPreferredSkill('')
    }
  }

  const removePreferredSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      preferredSkills: prev.preferredSkills.filter(s => s !== skill)
    }))
  }

  const addBenefit = () => {
    if (currentBenefit.trim() && !formData.benefits.includes(currentBenefit.trim())) {
      setFormData(prev => ({
        ...prev,
        benefits: [...prev.benefits, currentBenefit.trim()]
      }))
      setCurrentBenefit('')
    }
  }

  const removeBenefit = (benefit: string) => {
    setFormData(prev => ({
      ...prev,
      benefits: prev.benefits.filter(b => b !== benefit)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus('idle')
    setErrorMessage('')

    try {
      const token = await getToken()
      if (!token) {
        setStatus('error')
        setErrorMessage('Please sign in to post a job')
        return
      }

      apiClient.setToken(token)

      // Prepare job data
      const jobData = {
        title: formData.title,
        company: formData.company,
        description: formData.description,
        requirements: formData.requirements,
        responsibilities: formData.responsibilities,
        jobType: formData.jobType,
        experienceLevel: formData.experienceLevel,
        location: {
          city: formData.locationCity,
          state: formData.locationState,
          country: formData.locationCountry,
          isRemote: formData.isRemote
        },
        salary: {
          min: parseInt(formData.salaryMin) || 0,
          max: parseInt(formData.salaryMax) || 0,
          currency: formData.salaryCurrency
        },
        requiredSkills: formData.requiredSkills,
        preferredSkills: formData.preferredSkills,
        benefits: formData.benefits,
        applicationDeadline: formData.applicationDeadline ? new Date(formData.applicationDeadline) : undefined
      }

      console.log('Posting job:', jobData)
      const response = await apiClient.createJob(jobData)
      console.log('Job posted successfully:', response.data)

      setStatus('success')
      setTimeout(() => {
        router.push('/dashboard/recruiter')
      }, 2000)
    } catch (error: any) {
      console.error('Failed to post job:', error)
      setStatus('error')
      setErrorMessage(error.response?.data?.error || error.message || 'Failed to post job')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Post a New Job</h1>
          <p className="text-lg text-gray-600">
            Find the perfect candidate for your open position
          </p>
        </div>

        {/* Status Messages */}
        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800 font-medium">✅ Job posted successfully! Redirecting...</p>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800 font-medium">❌ {errorMessage}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-md p-8">
          {/* Basic Information */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-blue-600" />
              Basic Information
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Senior Software Engineer"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  required
                  placeholder="e.g. Tech Corp Inc."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Type *
                  </label>
                  <select
                    name="jobType"
                    value={formData.jobType}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="full-time">Full-time</option>
                    <option value="part-time">Part-time</option>
                    <option value="contract">Contract</option>
                    <option value="internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Experience Level *
                  </label>
                  <select
                    name="experienceLevel"
                    value={formData.experienceLevel}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="entry">Entry Level</option>
                    <option value="mid">Mid Level</option>
                    <option value="senior">Senior Level</option>
                    <option value="lead">Lead/Principal</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              Job Description
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  placeholder="Describe the role, team, and what makes this opportunity unique..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Requirements *
                </label>
                <textarea
                  name="requirements"
                  value={formData.requirements}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  placeholder="List the required qualifications, education, and experience..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Responsibilities *
                </label>
                <textarea
                  name="responsibilities"
                  value={formData.responsibilities}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  placeholder="Describe the day-to-day responsibilities and expectations..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-blue-600" />
              Location
            </h2>

            <div className="space-y-4">
              <div className="flex items-center mb-4">
                <input
                  type="checkbox"
                  name="isRemote"
                  checked={formData.isRemote}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm font-medium text-gray-700">
                  Remote Position
                </label>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="locationCity"
                    value={formData.locationCity}
                    onChange={handleInputChange}
                    placeholder="e.g. San Francisco"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <input
                    type="text"
                    name="locationState"
                    value={formData.locationState}
                    onChange={handleInputChange}
                    placeholder="e.g. CA"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Country
                  </label>
                  <input
                    type="text"
                    name="locationCountry"
                    value={formData.locationCountry}
                    onChange={handleInputChange}
                    placeholder="e.g. USA"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Salary */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-blue-600" />
              Salary Range
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Salary
                </label>
                <input
                  type="number"
                  name="salaryMin"
                  value={formData.salaryMin}
                  onChange={handleInputChange}
                  placeholder="e.g. 80000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Salary
                </label>
                <input
                  type="number"
                  name="salaryMax"
                  value={formData.salaryMax}
                  onChange={handleInputChange}
                  placeholder="e.g. 120000"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Currency
                </label>
                <select
                  name="salaryCurrency"
                  value={formData.salaryCurrency}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="CAD">CAD</option>
                </select>
              </div>
            </div>
          </div>

          {/* Skills */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Skills & Benefits
            </h2>

            <div className="space-y-6">
              {/* Required Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Required Skills
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentSkill}
                    onChange={(e) => setCurrentSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                    placeholder="e.g. React, Node.js, Python"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addSkill}
                    className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.requiredSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="hover:text-indigo-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Preferred Skills */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preferred Skills
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentPreferredSkill}
                    onChange={(e) => setCurrentPreferredSkill(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addPreferredSkill())}
                    placeholder="e.g. AWS, Docker, Kubernetes"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addPreferredSkill}
                    className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.preferredSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removePreferredSkill(skill)}
                        className="hover:text-blue-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Benefits */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Benefits
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentBenefit}
                    onChange={(e) => setCurrentBenefit(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addBenefit())}
                    placeholder="e.g. Health Insurance, 401k, Remote Work"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={addBenefit}
                    className="bg-blue-600 text-white px-4 py-3 rounded-lg hover:bg-blue-700 transition"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.benefits.map((benefit, index) => (
                    <span
                      key={index}
                      className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1"
                    >
                      {benefit}
                      <button
                        type="button"
                        onClick={() => removeBenefit(benefit)}
                        className="hover:text-green-900"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Application Deadline */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Clock className="w-6 h-6 text-blue-600" />
              Application Deadline
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Deadline (Optional)
              </label>
              <input
                type="date"
                name="applicationDeadline"
                value={formData.applicationDeadline}
                onChange={handleInputChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Posting Job...
                </>
              ) : (
                <>
                  <Briefcase className="w-5 h-5" />
                  Post Job
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.back()}
              className="px-8 py-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-semibold text-lg"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
