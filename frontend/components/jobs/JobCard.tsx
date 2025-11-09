"use client"

import React from 'react'
import { ExternalLink } from 'lucide-react'

export default function JobCard({ job }: { job: any }) {
  return (
    <div className="bg-white/5 p-4 rounded-lg border border-white/10">
      <div className="flex items-start justify-between">
        <div>
          <h4 className="text-lg font-semibold text-white">{job.title}</h4>
          <div className="text-sm text-gray-300">{job.company}</div>
          <div className="text-sm text-gray-400">{job.location}</div>
        </div>
        <a href={job.redirect_url} target="_blank" rel="noreferrer" className="ml-4 inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded">
          Apply <ExternalLink className="w-4 h-4" />
        </a>
      </div>
      {job.salary_min || job.salary_max ? (
        <div className="mt-3 text-sm text-green-300">{job.salary_min ? `$${job.salary_min}` : ''}{job.salary_min && job.salary_max ? ' - ' : ''}{job.salary_max ? `$${job.salary_max}` : ''}</div>
      ) : null}
      <p className="mt-3 text-sm text-gray-300 line-clamp-3" dangerouslySetInnerHTML={{ __html: job.description || '' }} />
    </div>
  )
}
