'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table'
import { toast } from 'sonner'

interface ExamResult {
  id: number
  title: string
  Subject: string
  examDate: string
  totalMarks: number
  student: {
    id: number
    name: string
    rollNumber: string
  }
  class: {
    id: number
    name: string
    section: string
  }
}

export default function TeacherReportsPage() {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [results, setResults] = useState<ExamResult[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedToken = sessionStorage.getItem('token')
    const storedUser = localStorage.getItem('user')

    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
    }
  }, [])

  useEffect(() => {
    const fetchReports = async () => {
      if (!token || !user) return

      try {
        // Get teacher’s assigned class
        const teacherRes = await axios.get(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/teachers?populate=class&filters[user][id][$eq]=${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const classId = teacherRes.data?.data?.[0]?.class?.id
        if (!classId) throw new Error('No class assigned to teacher')

        // Fetch exam results of that class
        const resultRes = await axios.get(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/exam-results?populate=student.class&filters[class][id][$eq]=${classId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        setResults(resultRes.data?.data || [])
      } catch (err) {
        console.error(err)
        toast.error('Failed to fetch exam results')
      } finally {
        setLoading(false)
      }
    }

    fetchReports()
  }, [token, user])

  return (
    <DashboardLayout>
      <div className="p-6 max-w-6xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Exam Reports</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading reports...</p>
            ) : results.length === 0 ? (
              <p>No exam results found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Roll #</TableHead>
                    <TableHead>Class</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Exam</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Total Marks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result) => (
                    <TableRow key={result.id}>
                      <TableCell>{result.student?.name}</TableCell>
                      <TableCell>{result.student?.rollNumber}</TableCell>
                      <TableCell>{result.class?.name}</TableCell>
                      <TableCell>{result.Subject}</TableCell>
                      <TableCell>{result.title}</TableCell>
                      <TableCell>{result.examDate}</TableCell>
                      <TableCell>{result.totalMarks}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
