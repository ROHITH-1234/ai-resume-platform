"use client"

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, MapPin, DollarSign, Briefcase, TrendingUp, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react'
import { apiClient } from '@/lib/api'
import { useAuth, useUser } from '@clerk/nextjs'

function Spinner() {
  return (
    <motion.div
      className="w-12 h-12 border-4 border-t-transparent border-blue-600 rounded-full mx-auto"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1 }}
    />
  )
}

interface ImportedJob {
  _id: string
  title: string
  company: { name: string; website?: string }
  description: string
  location: { city?: string; state?: string; remote?: boolean }
  salary?: { min?: number; max?: number }
  jobType: string
  requirements: {
    skills: { technical: string[] }
  }
  metadata?: {
    source: string
    externalUrl: string
  }
}

export default function AdzunaJobImporter() {
  const { getToken } = useAuth()
  const { user } = useUser()
  
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const [salary, setSalary] = useState('')
  const [country, setCountry] = useState('us')
  
  const [loading, setLoading] = useState(false)
  const [importing, setImporting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [importedJobs, setImportedJobs] = useState<ImportedJob[]>([])
  const [matches, setMatches] = useState<Record<string, any>>({})
  
  const metadata = user?.publicMetadata as Record<string, any> | undefined
  const userRole = typeof metadata?.role === 'string' ? metadata.role : null

  useEffect(() => {
    const token = getToken()
    if (token) {
      token.then(t => {
        if (t) apiClient.setToken(t)
      })
    }
  }, [getToken])

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setImporting(true)
    setError('')
    setSuccess('')
    setImportedJobs([])
    
    try {
      const token = await getToken()
      if (token) apiClient.setToken(token)

      let response;
      
      // Try authenticated endpoint first
      try {
        response = await apiClient.importAdzunaJobs({
          keyword,
          location,
          salary,
          country
        })
      } catch (authError: any) {
        // If auth fails, try public endpoint
        console.log('Auth import failed, trying public endpoint...')
        response = await apiClient.importAdzunaJobsPublic({
          keyword,
          location,
          salary,
          country
        })
      }

      const data = response.data
      
      if (data.success) {
        setSuccess(`✅ Successfully imported ${data.imported} jobs! Matching in progress...`)
        setImportedJobs(data.jobs || [])
        
        // If candidate, load matches after a brief delay
        if (userRole === 'candidate') {
          setTimeout(() => loadMatches(), 2000)
        }
      } else {
        setError('Import completed with errors')
      }
      
    } catch (err: any) {
      console.error('Import error:', err)
      setError(err.response?.data?.error || err.message || 'Failed to import jobs')
    } finally {
      setLoading(false)
      setImporting(false)
    }
  }

  const loadMatches = async () => {
    try {
      const token = await getToken()
      if (token) apiClient.setToken(token)
      
      const response = await apiClient.getCandidateMatches({ limit: 100 })
      const matchesData: Record<string, any> = {}
      
      response.data.matches?.forEach((match: any) => {
        if (match.jobId?._id) {
          matchesData[match.jobId._id] = match
        }
      })
      
      setMatches(matchesData)
    } catch (error) {
      console.error('Failed to load matches:', error)
    }
  }

  const getMatchScoreColor = (score: number) => {
    if (score >= 70) return 'bg-green-100 text-green-800 border-green-300'
    if (score >= 50) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    return 'bg-orange-100 text-orange-800 border-orange-300'
  }

  const formatSalary = (min?: number, max?: number) => {
    if (!min && !max) return null
    const safeMin = min ?? max ?? 0
    const safeMax = max ?? min ?? 0
    return `$${(safeMin / 1000).toFixed(0)}k - $${(safeMax / 1000).toFixed(0)}k`
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-2">
          <Briefcase className="w-8 h-8" />
          Import Jobs from Adzuna
        </h2>
        <p className="text-gray-300">
          Search and import jobs from Adzuna API. Jobs will be automatically matched with candidates.
        </p>
      </motion.div>

      {/* Search Form */}
      <motion.form
        onSubmit={handleImport}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Job keyword (e.g., React Developer)"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Location"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="Min Salary"
              type="number"
              className="w-full pl-10 pr-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="px-4 py-3 rounded-lg bg-white/20 border border-white/30 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="us">🇺🇸 USA</option>
            <option value="gb">🇬🇧 UK</option>
            <option value="ca">🇨🇦 Canada</option>
            <option value="au">🇦🇺 Australia</option>
            <option value="de">🇩🇪 Germany</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={loading || !keyword}
          className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <motion.div
                className="w-5 h-5 border-2 border-t-transparent border-white rounded-full"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1 }}
              />
              Importing Jobs...
            </>
          ) : (
            <>
              <TrendingUp className="w-5 h-5" />
              Import & Match Jobs
            </>
          )}
        </button>
      </motion.form>

      {/* Status Messages */}
      {error && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6 flex items-center gap-2"
        >
          <AlertCircle className="w-5 h-5" />
          {error}
        </motion.div>
      )}

      {success && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-green-500/20 border border-green-500 text-green-200 p-4 rounded-lg mb-6 flex items-center gap-2"
        >
          <CheckCircle className="w-5 h-5" />
          {success}
        </motion.div>
      )}

      {/* Results */}
      {importing && (
        <div className="text-center py-12">
          <Spinner />
          <p className="text-gray-300 mt-4">Importing jobs and calculating matches...</p>
        </div>
      )}

      {importedJobs.length > 0 && !importing && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-2xl font-bold text-white mb-4">
            Imported Jobs ({importedJobs.length})
          </h3>

          <div className="grid gap-4">
            {importedJobs.map((job, index) => {
              const match = matches[job._id]
              const matchScore = match?.matchScore || 0

              return (
                <motion.div
                  key={job._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:border-white/40 transition"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-white mb-2">{job.title}</h4>
                      <p className="text-gray-300 mb-2">{job.company.name}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-3 py-1 bg-blue-500/20 text-blue-300 rounded-full text-xs">
                          {job.jobType}
                        </span>
                        {job.location.remote ? (
                          <span className="px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-xs">
                            Remote
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-gray-500/20 text-gray-300 rounded-full text-xs flex items-center gap-1">
                            <MapPin className="w-3 h-3" />
                            {job.location.city}, {job.location.state}
                          </span>
                        )}
                        {job.salary && formatSalary(job.salary.min, job.salary.max) && (
                          <span className="px-3 py-1 bg-yellow-500/20 text-yellow-300 rounded-full text-xs flex items-center gap-1">
                            <DollarSign className="w-3 h-3" />
                            {formatSalary(job.salary.min, job.salary.max)}
                          </span>
                        )}
                      </div>

                      {job.requirements.skills.technical.length > 0 && (
                        <div className="mb-3">
                          <p className="text-sm text-gray-400 mb-1">Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {job.requirements.skills.technical.slice(0, 8).map((skill, i) => (
                              <span key={i} className="px-2 py-1 bg-indigo-500/20 text-indigo-300 rounded text-xs">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      <p className="text-gray-400 text-sm line-clamp-2">{job.description}</p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      {userRole === 'candidate' && match && (
                        <div className={`px-4 py-2 rounded-lg border font-bold ${getMatchScoreColor(matchScore)}`}>
                          {matchScore}% Match
                        </div>
                      )}
                      
                      {job.metadata?.externalUrl && (
                        <a
                          href={job.metadata.externalUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-blue-400 hover:text-blue-300 text-sm"
                        >
                          Apply <ExternalLink className="w-4 h-4" />
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}
    </div>
  )
}
