'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/layout/Sidebar'
import { useAuthContext } from '@/context/AuthContext'
import { FullPageLoader } from '@/components/ui/LoadingSpinner'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthContext()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push('/login')
  }, [isAuthenticated, isLoading, router])

  if (isLoading) return <FullPageLoader />
  if (!isAuthenticated) return null

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <main className="ml-[220px] flex-1 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
