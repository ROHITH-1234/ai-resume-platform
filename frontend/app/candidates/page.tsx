'use client'

import { useEffect, useState } from 'react'
import { useAuth, useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { apiClient } from '@/lib/api'
import { 
  Search, Filter, MapPin, Briefcase, Award, DollarSign, 
  Clock, ChevronRight, User, Star, TrendingUp
} from 'lucide-react'
import Link from 'next/link'

interface Candidate {
  _id: string
  userId: {
    name: string
    email: string
  }
  skills: string[]
  totalExperience: number
  expectedSalary: number
  location: string
  availability: string
  noticePeriod: string
  resumeUrl: string
}

export default function FindCandidatesPage() {
  const { getToken } = useAuth()
  const { user } = useUser()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [filteredCandidates, setFilteredCandidates] = useState<Candidate[]>([])
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [skillFilter, setSkillFilter] = useState('')
  const [experienceFilter, setExperienceFilter] = useState('')
  const [locationFilter, setLocationFilter] = useState('')
  const [availabilityFilter, setAvailabilityFilter] = useState('')

  // All available filter options
  const [allSkills, setAllSkills] = useState<string[]>([])
  const [allLocations, setAllLocations] = useState<string[]>([])

  useEffect(() => {
    const metadata = user?.publicMetadata as Record<string, any> | undefined
    const userRole = metadata?.role
    
    if (userRole !== 'recruiter') {
      router.push('/dashboard')
      return
    }
    
    loadCandidates()
  }, [user])

  useEffect(() => {
    applyFilters()
  }, [searchQuery, skillFilter, experienceFilter, locationFilter, availabilityFilter, candidates])

  const loadCandidates = async () => {
    try {
      const token = await getToken()
      if (token) apiClient.setToken(token)

      // Fetch all candidates
      const response = await apiClient.get('/candidates')
      const candidatesData = response.data.candidates || response.data || []
      
      setCandidates(candidatesData)
      setFilteredCandidates(candidatesData)

      // Extract unique skills and locations for filters
      const skills = new Set<string>()
      const locations = new Set<string>()
      
      candidatesData.forEach((candidate: Candidate) => {
        candidate.skills?.forEach((skill: string) => skills.add(skill))
        if (candidate.location) locations.add(candidate.location)
      })
      
      setAllSkills(Array.from(skills).sort())
      setAllLocations(Array.from(locations).sort())
      
    } catch (error) {
      console.error('Error loading candidates:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...candidates]

    // Search by name or email
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(c => 
        c.userId?.name?.toLowerCase().includes(query) ||
        c.userId?.email?.toLowerCase().includes(query)
      )
    }

    // Filter by skill
    if (skillFilter) {
      filtered = filtered.filter(c => 
        c.skills?.some(skill => skill.toLowerCase().includes(skillFilter.toLowerCase()))
      )
    }

    // Filter by experience
    if (experienceFilter) {
      const exp = parseInt(experienceFilter)
      filtered = filtered.filter(c => {
        const candidateExp = c.totalExperience || 0
        if (experienceFilter === '0') return candidateExp <= 1
        if (experienceFilter === '1') return candidateExp >= 1 && candidateExp <= 3
        if (experienceFilter === '3') return candidateExp >= 3 && candidateExp <= 5
        if (experienceFilter === '5') return candidateExp >= 5 && candidateExp <= 10
        if (experienceFilter === '10') return candidateExp >= 10
        return true
      })
    }

    // Filter by location
    if (locationFilter) {
      filtered = filtered.filter(c => 
        c.location?.toLowerCase().includes(locationFilter.toLowerCase())
      )
    }

    // Filter by availability
    if (availabilityFilter) {
      filtered = filtered.filter(c => 
        c.availability?.toLowerCase() === availabilityFilter.toLowerCase()
      )
    }

    setFilteredCandidates(filtered)
  }

  const resetFilters = () => {
    setSearchQuery('')
    setSkillFilter('')
    setExperienceFilter('')
    setLocationFilter('')
    setAvailabilityFilter('')
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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Find Candidates</h1>
          <p className="text-gray-600">
            Search and filter through {candidates.length} talented candidates
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          {/* Search Bar */}
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Filters Grid */}
          <div className="grid md:grid-cols-4 gap-4">
            {/* Skill Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Award className="w-4 h-4 inline mr-1" />
                Skills
              </label>
              <select
                value={skillFilter}
                onChange={(e) => setSkillFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Skills</option>
                {allSkills.map(skill => (
                  <option key={skill} value={skill}>{skill}</option>
                ))}
              </select>
            </div>

            {/* Experience Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4 inline mr-1" />
                Experience
              </label>
              <select
                value={experienceFilter}
                onChange={(e) => setExperienceFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Experience</option>
                <option value="0">0-1 years (Fresher)</option>
                <option value="1">1-3 years</option>
                <option value="3">3-5 years</option>
                <option value="5">5-10 years</option>
                <option value="10">10+ years</option>
              </select>
            </div>

            {/* Location Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Location
              </label>
              <select
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Locations</option>
                {allLocations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </select>
            </div>

            {/* Availability Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 inline mr-1" />
                Availability
              </label>
              <select
                value={availabilityFilter}
                onChange={(e) => setAvailabilityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All</option>
                <option value="immediate">Immediate</option>
                <option value="available">Available</option>
                <option value="notice period">Notice Period</option>
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="mt-4 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {filteredCandidates.length} of {candidates.length} candidates
            </p>
            <button
              onClick={resetFilters}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Candidates List */}
        {filteredCandidates.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Candidates Found</h3>
            <p className="text-gray-600 mb-4">Try adjusting your filters to see more results</p>
            <button
              onClick={resetFilters}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCandidates.map((candidate) => (
              <div key={candidate._id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                {/* Candidate Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {candidate.userId?.name || 'Anonymous'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {candidate.userId?.email}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Candidate Info */}
                <div className="space-y-2 mb-4">
                  {candidate.location && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {candidate.location}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    {candidate.totalExperience || 0} years experience
                  </p>
                  {candidate.expectedSalary && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <DollarSign className="w-4 h-4" />
                      ${candidate.expectedSalary.toLocaleString()} expected
                    </p>
                  )}
                  {candidate.availability && (
                    <p className="text-sm text-gray-600 flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      {candidate.availability}
                    </p>
                  )}
                </div>

                {/* Skills */}
                {candidate.skills && candidate.skills.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.slice(0, 4).map((skill, idx) => (
                        <span
                          key={idx}
                          className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 4 && (
                        <span className="text-xs text-gray-500">
                          +{candidate.skills.length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* View Profile Button */}
                <Link
                  href={`/candidates/${candidate._id}`}
                  className="flex items-center justify-center gap-2 w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  View Full Profile
                  <ChevronRight className="w-4 h-4" />
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
