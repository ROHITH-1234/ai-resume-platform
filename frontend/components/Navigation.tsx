'use client'

import { UserButton, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  Briefcase, Upload, Target, Calendar, MessageCircle, 
  BarChart3, Brain, Home, Menu, X 
} from 'lucide-react'
import { useState } from 'react'

export default function Navigation() {
  const { user, isLoaded } = useUser()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  // Safely extract role, ensuring it's a string
  let userRole: string | null = null
  if (user?.publicMetadata && typeof user.publicMetadata === 'object') {
    const metadata = user.publicMetadata as Record<string, any>
    if (typeof metadata.role === 'string') {
      userRole = metadata.role
    }
  }

  // Don't show navigation on auth pages
  if (pathname?.startsWith('/sign-in') || pathname?.startsWith('/sign-up')) {
    return null
  }

  const candidateLinks = [
    { href: '/dashboard/candidate', label: 'Dashboard', icon: Home },
    { href: '/resume/upload', label: 'Upload Resume', icon: Upload },
    { href: '/jobs', label: 'Browse Jobs', icon: Briefcase },
    { href: '/matches', label: 'My Matches', icon: Target },
    { href: '/interviews', label: 'Interviews', icon: Calendar },
    { href: '/mock-interview', label: 'Mock Interview', icon: Brain },
  ]

  const recruiterLinks = [
    { href: '/dashboard/recruiter', label: 'Dashboard', icon: Home },
    { href: '/jobs/create', label: 'Post Job', icon: Briefcase },
    { href: '/jobs', label: 'My Jobs', icon: Briefcase },
    { href: '/matches', label: 'Candidates', icon: Target },
    { href: '/interviews', label: 'Interviews', icon: Calendar },
    { href: '/analytics', label: 'Analytics', icon: BarChart3 },
  ]

  const navigation = userRole === 'recruiter' ? recruiterLinks : candidateLinks

  const isActive = (href: string) => {
    if (href === '/dashboard/candidate' || href === '/dashboard/recruiter') {
      return pathname === href || pathname === '/dashboard'
    }
    return pathname?.startsWith(href)
  }

  if (!isLoaded || !user) {
    return null
  }

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">AI Resume Matcher</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navigation.map((link) => {
              const Icon = link.icon
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition ${
                    isActive(link.href)
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Profile Section */}
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col items-end">
              <p className="text-sm font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-600 capitalize">
                {typeof userRole === 'string' ? userRole : 'User'}
              </p>
            </div>
            <UserButton 
              afterSignOutUrl="/"
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10"
                }
              }}
            />
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:bg-gray-100 rounded-lg"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col gap-2">
              {navigation.map((link) => {
                const Icon = link.icon
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${
                      isActive(link.href)
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Link>
                )
              })}
            </div>
            
            {/* Mobile Profile Info */}
            <div className="mt-4 pt-4 border-t border-gray-200 px-4">
              <p className="text-sm font-semibold text-gray-900">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-gray-600">
                {user.primaryEmailAddress?.emailAddress}
              </p>
              <p className="text-xs text-blue-600 capitalize mt-1 font-medium">
                Role: {typeof userRole === 'string' ? userRole : 'User'}
              </p>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
