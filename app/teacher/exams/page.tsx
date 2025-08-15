'use client'

import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'

interface Student {
  id: number
  name: string
  rollNumber: string
}

interface ClassData {
  id: number
  name: string
  section: string
  students: Student[]
}

export default function UploadExamResult() {
  const [title, setTitle] = useState('')
  const [subject, setSubject] = useState('')
  const [examDate, setExamDate] = useState('')
  const [totalMarks, setTotalMarks] = useState('')
  const [students, setStudents] = useState<Student[]>([])
  const [selectedStudent, setSelectedStudent] = useState('')
  const [assignedClass, setAssignedClass] = useState<ClassData | null>(null)

  const [user, setUser] = useState<any>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const storedUser = localStorage.getItem('user')
    const storedToken = sessionStorage.getItem('token')

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser))
      setToken(storedToken)
    } else {
      setError('Not authenticated')
    }
  }, [])

  useEffect(() => {
    const fetchTeacherClass = async () => {
      if (!user || !token) return

      try {
        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/teachers?populate=class.students&filters[user][id][$eq]=${user.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        )

        const teacher = res.data.data?.[0]
        const classInfo = teacher?.class

        if (classInfo) {
          setAssignedClass(classInfo)
          setStudents(classInfo.students || [])
        }
      } catch (err) {
        console.error('Error fetching class:', err)
        setError('Failed to load class or students')
      }
    }

    fetchTeacherClass()
  }, [user, token])

  const handleSubmit = async () => {
    if (!title || !subject || !examDate || !totalMarks || !selectedStudent || !assignedClass) {
      setError('All fields are required.')
      return
    }

    try {
      setLoading(true)
      setError(null)

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/exam-results`,
        {
          data: {
            title,
            Subject: subject,
            examDate,
            totalMarks: parseInt(totalMarks),
            student: selectedStudent,
            class: assignedClass.id
          }
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      if (res.data) {
        setSuccess(true)
        setTitle('')
        setSubject('')
        setExamDate('')
        setTotalMarks('')
        setSelectedStudent('')
      }
    } catch (err) {
      console.error(err)
      setError('Failed to upload result.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="p-4 max-w-xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>Upload Exam Result</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <p className="text-red-500 text-sm">{error}</p>}
            {success && <p className="text-green-600 text-sm">Result uploaded successfully!</p>}

            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>

            <div>
              <Label>Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>

            <div>
              <Label>Exam Date</Label>
              <Input type="date" value={examDate} onChange={(e) => setExamDate(e.target.value)} />
            </div>

            <div>
              <Label>Total Marks</Label>
              <Input
                type="number"
                value={totalMarks}
                onChange={(e) => setTotalMarks(e.target.value)}
              />
            </div>

            <div>
              <Label>Student</Label>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="w-full border px-3 py-2 rounded-md"
              >
                <option value="">Select a student</option>
                {students.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.name} ({student.rollNumber})
                  </option>
                ))}
              </select>
            </div>

            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Uploading...' : 'Upload Result'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
