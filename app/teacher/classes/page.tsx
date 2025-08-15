'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Skeleton } from '@/components/ui/skeleton'
import { AlertCircle, BookOpenText, LayoutGrid } from 'lucide-react'

interface ClassData {
  id: number
  name: string
  section: string
}

export default function TeacherClassPage() {
  const [classData, setClassData] = useState<ClassData | null>(null)
  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = sessionStorage.getItem('token')

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    } else {
      setError('You are not authenticated.')
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const fetchTeacherClass = async () => {
      if (!user || !token) return

      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/teachers?populate=*&filters[user][id][$eq]=${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const teacher = res.data?.data?.[0]
        const classInfo = teacher.class

        if (classInfo) {
          setClassData(classInfo)
        } else {
          setError('No class assigned to you.')
        }
      } catch (err: any) {
        console.error(err)
        setError('Failed to load class data.')
      } finally {
        setLoading(false)
      }
    }

    fetchTeacherClass()
  }, [user, token])

  return (
    <DashboardLayout>
      <div className="p-6 flex justify-center items-center min-h-[70vh]">
        <Card className="w-full max-w-xl shadow-lg border border-gray-200">
          <CardHeader className="bg-muted rounded-t-md">
            <CardTitle className="text-xl flex items-center gap-2">
              <LayoutGrid className="w-5 h-5 text-primary" />
              My Assigned Class
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 py-6">
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-5 w-1/2" />
              </div>
            ) : error ? (
              <div className="text-red-500 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            ) : classData ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-lg">
                  <BookOpenText className="w-5 h-5 text-muted-foreground" />
                  <span>
                    <strong>Class:</strong> {classData.name}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-lg">
                  <LayoutGrid className="w-5 h-5 text-muted-foreground" />
                  <span>
                    <strong>Section:</strong> {classData.section}
                  </span>
                </div>
              </div>
            ) : (
              <p>No class data available.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
