// app/not-found.tsx
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function NotFound() {
  const router = useRouter()

  useEffect(() => {
    const userData = localStorage.getItem('user')

    if (userData) {
      const parsed = JSON.parse(userData)
      const role = parsed?.role?.name?.toLowerCase() || 'student'
      router.replace(`/${role}/dashboard`)
    } else {
      router.replace('/')
    }
  }, [router])

  return (
    <div className="flex justify-center items-center h-screen text-center">
      <div>
        <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
        <p className="text-gray-500">Redirecting to your dashboard...</p>
      </div>
    </div>
  )
}

