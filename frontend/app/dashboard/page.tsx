'use client'

import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && user) {
      // Safely extract role
      const metadata = user.publicMetadata as Record<string, any> | undefined
      const role = typeof metadata?.role === 'string' ? metadata.role : null
      
      if (role === 'recruiter') {
        router.push('/dashboard/recruiter')
      } else if (role === 'candidate') {
        router.push('/dashboard/candidate')
      } else {
        // No role set, redirect to onboarding
        router.push('/onboarding')
      }
    }
  }, [user, isLoaded, router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
}
