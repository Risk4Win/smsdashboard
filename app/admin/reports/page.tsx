'use client'

import { useEffect, useState } from 'react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  Card, CardContent, CardHeader, CardTitle
} from '@/components/ui/card'
import {
  Tabs, TabsList, TabsTrigger, TabsContent
} from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Calendar } from '@/components/ui/calendar'
import { Download, BarChart2, CalendarDays, Users } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

type AttendanceRecord = {
  id: number
  date: string
  attendanceStatus: string
  student: {
    id: number
    name: string
    rollNumber: string
  } | null
}

export default function ReportsPage() {
  const [filter, setFilter] = useState('attendance')
  const [fromDate, setFromDate] = useState<Date | null>(null)
  const [toDate, setToDate] = useState<Date | null>(null)
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([])

  useEffect(() => {
    const fetchAttendanceData = async () => {
      if (!fromDate || !toDate) return
      const token = sessionStorage.getItem('token')
      if (!token) return

      const from = format(fromDate, 'yyyy-MM-dd')
      const to = format(toDate, 'yyyy-MM-dd')

      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/attendances?filters[date][$between][0]=${from}&filters[date][$between][1]=${to}&populate=*`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        )

        const json = await res.json()

        if (Array.isArray(json?.data)) {
          const cleanData = json.data.map((item: any) => ({
            id: item.id,
            date: item.date,
            attendanceStatus: item.attendanceStatus,
            student: item.student
              ? {
                id: item.student.id,
                name: item.student.name,
                rollNumber: item.student.rollNumber,
              }
              : null,
          }))
          setAttendanceData(cleanData)
          toast.success('✅ Attendance report loaded')
        } else {
          setAttendanceData([])
          toast.error('⚠️ Invalid response format for attendance')
        }
      } catch (err) {
        toast.error('❌ Failed to fetch attendance report')
        console.error(err)
      }
    }

    fetchAttendanceData()
  }, [fromDate, toDate])

  const handleExport = () => {
    if (!attendanceData.length) return toast.error('No data to export')

    const csvRows = [
      ['Student Name', 'Roll No', 'Date', 'Status'],
      ...attendanceData.map((record) => {
        const name = record.student?.name ?? '-'
        const roll = record.student?.rollNumber ?? '-'
        const date = record.date ?? '-'
        const status = record.attendanceStatus ?? '-'
        return [name, roll, date, status]
      }),
    ]

    const csvContent = csvRows.map((row) => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)

    const link = document.createElement('a')
    link.href = url
    link.download = 'attendance_report.csv'
    link.click()

    URL.revokeObjectURL(url)
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">📊 Reports</h1>
            <p className="text-muted-foreground">Analyze key metrics and performance</p>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            Export Report
          </Button>
        </div>

        <Tabs defaultValue="attendance" className="w-full">
          <TabsList>
            <TabsTrigger value="attendance" onClick={() => setFilter('attendance')}>
              <CalendarDays className="h-4 w-4 mr-1" /> Attendance
            </TabsTrigger>
            <TabsTrigger value="performance" onClick={() => setFilter('performance')}>
              <BarChart2 className="h-4 w-4 mr-1" /> Performance
            </TabsTrigger>
            <TabsTrigger value="students" onClick={() => setFilter('students')}>
              <Users className="h-4 w-4 mr-1" /> Students
            </TabsTrigger>
          </TabsList>

          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>📅 Attendance Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="mb-1 block">From Date</Label>
                    <Calendar
                      mode="single"
                      selected={fromDate!}
                      onSelect={setFromDate}
                      required
                    />
                  </div>
                  <div>
                    <Label className="mb-1 block">To Date</Label>
                    <Calendar
                      mode="single"
                      selected={toDate!}
                      onSelect={setToDate}
                      required
                    />
                  </div>
                </div>

                {attendanceData.length > 0 ? (
                  <div className="space-y-3">
                    <div className="text-sm text-muted-foreground">
                      Total Records: {attendanceData.length} <br />
                      Present:{' '}
                      {
                        attendanceData.filter(
                          (r) => r.attendanceStatus === 'present'
                        ).length
                      }{' '}
                      | Absent:{' '}
                      {
                        attendanceData.filter(
                          (r) => r.attendanceStatus === 'absent'
                        ).length
                      }
                    </div>
                    <div className="border rounded-md overflow-auto text-sm">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-muted text-muted-foreground">
                            <th className="px-3 py-2 border">Student</th>
                            <th className="px-3 py-2 border">Roll No</th>
                            <th className="px-3 py-2 border">Date</th>
                            <th className="px-3 py-2 border">Status</th>
                          </tr>
                        </thead>
                        <tbody>
                          {attendanceData.map((record) => (
                            <tr key={record.id} className="even:bg-gray-50">
                              <td className="px-3 py-2 border">{record.student?.name ?? '-'}</td>
                              <td className="px-3 py-2 border">{record.student?.rollNumber ?? '-'}</td>
                              <td className="px-3 py-2 border">{record.date ?? '-'}</td>
                              <td className="px-3 py-2 border capitalize">
                                {record.attendanceStatus ?? '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 text-muted-foreground">
                    No attendance data available for the selected range.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance">
            <Card>
              <CardHeader>
                <CardTitle>📈 Performance Report</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-muted-foreground">
                  You’ll be able to view average performance and progress here.
                </p>
                <div className="text-center text-gray-400 text-sm">Coming soon...</div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>👨‍🎓 Student Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-muted-foreground">
                  This section will display a summary of all student stats, grouped by class or status.
                </p>
                <div className="text-center text-gray-400 text-sm">Coming soon...</div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}
