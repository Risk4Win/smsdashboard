'use client'

import { useEffect, useState } from 'react'
import axios from 'axios'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

interface Student {
  id: number
  name: string
  rollNumber: string
}

export default function TeacherAttendancePage() {
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<Record<number, boolean>>({})
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = sessionStorage.getItem('token')

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    }
  }, [])

  useEffect(() => {
    const fetchStudents = async () => {
      if (!user || !token) return

      try {
        // Get teacher class
        const teacherRes = await axios.get(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/teachers?populate=class.students&filters[user][id][$eq]=${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const teacher = teacherRes.data?.data?.[0]
        const classStudents = teacher?.class?.students || []
        setStudents(classStudents)

        // Init attendance with all true (present)
        const initial: Record<number, boolean> = {}
        classStudents.forEach((s: Student) => (initial[s.id] = true))
        setAttendance(initial)
      } catch (err) {
        console.error(err)
        toast.error('Failed to load student list')
      } finally {
        setLoading(false)
      }
    }

    fetchStudents()
  }, [user, token])

  const handleToggle = (studentId: number) => {
    setAttendance((prev) => ({ ...prev, [studentId]: !prev[studentId] }))
  }

  const handleSubmit = async () => {
    const today = new Date().toISOString().split('T')[0]

    try {
      for (const studentId of Object.keys(attendance)) {
        const status = attendance[+studentId] ? 'present' : 'absent'
        await axios.post(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/attendances`,
          {
            data: {
              date: today,
              attendanceStatus: status,
              student: +studentId,
            },
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )
      }

      toast.success('Attendance uploaded successfully!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to upload attendance')
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Mark Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading students...</p>
            ) : students.length === 0 ? (
              <p>No students found.</p>
            ) : (
              <div className="space-y-4">
                {students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between border-b pb-2"
                  >
                    <div>
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Roll #: {student.rollNumber}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`check-${student.id}`}>Present</Label>
                      <Checkbox
                        id={`check-${student.id}`}
                        checked={attendance[student.id]}
                        onCheckedChange={() => handleToggle(student.id)}
                      />
                    </div>
                  </div>
                ))}

                <Button className="mt-4 w-full" onClick={handleSubmit}>
                  Submit Attendance
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
