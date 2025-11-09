"use client"

import React, { useState } from 'react'
// Local JobCard component to avoid missing external module
function JobCard({ job }: { job: any }) {
  return (
    <div className="bg-white/5 p-4 rounded-lg">
      <a href={job.redirect_url || job.link || '#'} target="_blank" rel="noreferrer" className="block">
        <h3 className="text-lg font-semibold text-white">{job.title || job.job_title || 'Untitled'}</h3>
        {job.company && <div className="text-sm text-gray-300">{(job.company && (job.company.display_name || job.company))}</div>}
        <div className="text-sm text-gray-300 mt-2">
          {(job.location && (job.location.display_name || job.location)) || job.location}
          {job.salary_min && <span className="ml-2">• {job.salary_min}</span>}
        </div>
        {job.description && <p className="mt-2 text-sm text-gray-400 line-clamp-3">{job.description}</p>}
      </a>
    </div>
  )
}
import { motion } from 'framer-motion'

function Spinner() {
  return (
    <motion.div
      className="w-12 h-12 border-4 border-t-transparent border-white rounded-full"
      animate={{ rotate: 360 }}
      transition={{ repeat: Infinity, duration: 1 }}
    />
  )
}

export default function SearchJobs() {
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const [salary, setSalary] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setLoading(true)
    setError('')
    setResults([])
    try {
      const params = new URLSearchParams()
      if (keyword) params.set('keyword', keyword)
      if (location) params.set('location', location)
      if (salary) params.set('salary', salary)

      const res = await fetch(`/api/adzuna?${params.toString()}`)
      const json = await res.json()
      if (!res.ok) {
        setError(json.error || 'Failed to fetch')
      } else {
        setResults(json.results || [])
      }
    } catch (err: any) {
      setError(err.message || 'Unknown error')
    }
    setLoading(false)
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-6">
        <input value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Keyword (e.g., frontend, data scientist)" className="md:col-span-2 p-3 rounded-lg bg-white/10 placeholder-gray-300 text-white" />
        <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Location (city or zip)" className="md:col-span-2 p-3 rounded-lg bg-white/10 placeholder-gray-300 text-white" />
        <input value={salary} onChange={(e) => setSalary(e.target.value)} placeholder="Min salary (e.g., 70000)" className="md:col-span-1 p-3 rounded-lg bg-white/10 placeholder-gray-300 text-white" />
        <button type="submit" className="md:col-span-1 bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-3">Search</button>
      </form>

      {loading && <div className="flex justify-center my-8"><Spinner /></div>}
      {error && <div className="text-red-400 my-4">{error}</div>}
      {!loading && results.length === 0 && <div className="text-gray-300">No results</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {results.map((r) => (
          <JobCard key={r.id} job={r} />
        ))}
      </div>
    </div>
  )
}
