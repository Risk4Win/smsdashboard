'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardLayout } from '@/components/layout/dashboard-layout'


interface Class {
  id: number
  name: string
  section: string
}

interface Student {
  id: number
  name: string
  email: string
  rollNumber: string
  class: Class
}

export default function TeacherStudentsPage() {
  const [students, setStudents] = useState<Student[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}')
        const token = sessionStorage.getItem('token')
        if (!user?.id || !token) return

        // Fetch the teacher record based on logged-in user
        const teacherRes = await axios.get(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/teachers?populate=class&filters[user][id][$eq]=${user.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        const teacher = teacherRes.data.data?.[0]
        const classId = teacher?.class?.id || teacher?.class?.data?.id

        if (!classId) return

        // Fetch students in that class
        const studentsRes = await axios.get(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/students?populate=class&filters[class][id][$eq]=${classId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        )

        setStudents(studentsRes.data.data || [])
      } catch (error) {
        console.error('Failed to fetch students:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [])

  return (
    <DashboardLayout>
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>My Class Students</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : students.length === 0 ? (
              <p>No students found for your class.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Roll Number</TableHead>
                    <TableHead>Class</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.rollNumber}</TableCell>
                      <TableCell>{student.class?.name}</TableCell>
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
