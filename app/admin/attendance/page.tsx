'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Calendar } from '@/components/ui/calendar'
import { toast } from 'sonner'

interface Student {
  id: number
  documentId: string
  name: string
  rollNumber: string
  class: {
    id: number
    name: string
    section: string
  }
}

interface AttendanceRecord {
  studentId: string
  attendanceStatus: 'present' | 'absent'
}

export default function AttendancePage() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({})
  const [date, setDate] = useState<Date | null>(new Date())
  const [loading, setLoading] = useState(false)

  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL

  useEffect(() => {
    const token = sessionStorage.getItem('token')
    const userData = localStorage.getItem('user')

    if (!token || !userData) return router.push('/')
    const parsed = JSON.parse(userData)
    if (parsed.role?.name?.toLowerCase() !== 'admin') return router.push('/')

    const fetchStudents = async () => {
      try {
        const res = await fetch(`${STRAPI_URL}/api/students?populate=class`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const json = await res.json()

        const mapped = json.data.map((s: any) => ({
          id: s.id,
          documentId: s.documentId,
          name: s.name,
          rollNumber: s.rollNumber,
          class: {
            id: s.class?.id ?? 0,
            name: s.class?.name ?? '',
            section: s.class?.section ?? ''
          }
        }))

        setStudents(mapped)
      } catch (err) {
        console.error('❌ Failed to fetch students:', err)
        toast.error('Failed to fetch students')
      }
    }

    fetchStudents()
  }, [router])

  const handleAttendanceChange = (studentId: string, status: 'present' | 'absent') => {
    setAttendance((prev) => ({
      ...prev,
      [studentId]: { studentId, attendanceStatus: status }
    }))
  }

  const handleSubmit = async () => {
    const token = sessionStorage.getItem('token')
    if (!token || !date) return

    setLoading(true)
    try {
      const payload = Object.values(attendance).map((record) => ({
        student: record.studentId,
        attendanceStatus: record.attendanceStatus,
        date: format(date, 'yyyy-MM-dd')
      }))

      for (const record of payload) {
        await fetch(`${STRAPI_URL}/api/attendances`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ data: record })
        })
      }

      toast.success('✅ Attendance submitted successfully')
      setAttendance({})
    } catch (err) {
      console.error('❌ Failed to submit attendance:', err)
      toast.error('❌ Failed to submit attendance')
    } finally {
      setLoading(false)
    }
  }

  const groupedByClass = students.reduce((groups: Record<string, Student[]>, student) => {
    const key = `${student.class.name} - ${student.class.section}`
    if (!groups[key]) groups[key] = []
    groups[key].push(student)
    return groups
  }, {})

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance for {date ? format(date, 'PPP') : 'Select a date'}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <Calendar mode="single" selected={date!} onSelect={setDate} required />

            {Object.entries(groupedByClass).map(([className, classStudents]) => (
              <div key={className}>
                <h2 className="text-xl font-semibold mb-2">{className}</h2>
                <div className="overflow-x-auto mb-6">
                  <table className="w-full text-sm border">
                    <thead>
                      <tr className="border-b bg-gray-100">
                        <th className="text-left p-2">Name</th>
                        <th className="text-left p-2">Roll #</th>
                        <th className="text-left p-2">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {classStudents.map((student) => (
                        <tr key={student.documentId} className="border-b">
                          <td className="p-2">{student.name}</td>
                          <td className="p-2">{student.rollNumber}</td>
                          <td className="p-2">
                            <Select
                              value={attendance[student.documentId]?.attendanceStatus || ''}
                              onValueChange={(value: 'present' | 'absent') =>
                                handleAttendanceChange(student.documentId, value)
                              }
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue>
                                  {attendance[student.documentId]?.attendanceStatus || 'Mark'}
                                </SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="present">Present</SelectItem>
                                <SelectItem value="absent">Absent</SelectItem>
                              </SelectContent>
                            </Select>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}

            <Button
              onClick={handleSubmit}
              disabled={loading || Object.keys(attendance).length === 0}
            >
              {loading ? 'Submitting...' : 'Submit Attendance'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
