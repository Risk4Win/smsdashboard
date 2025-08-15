'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Student {
  id: number
  documentId: string
  name: string
  email: string
  rollNumber: string
  address: string
  phone: string
  studentStatus: 'active' | 'inactive'
  class: {
    id: number
    name: string
    section: string
  }
}

interface StrapiResponse<T> {
  data: T[]
}

export default function StudentsPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [students, setStudents] = useState<Student[]>([])
  const [classes, setClasses] = useState<Student['class'][]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedClass, setSelectedClass] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newStudent, setNewStudent] = useState<Record<string, string>>({})
  const [updateStudent, setUpdateStudent] = useState<Record<string, any>>({})

  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL

  useEffect(() => {
    const currentUser = localStorage.getItem('user')
    const token = sessionStorage.getItem('token')

    if (!currentUser || !token) {
      router.push('/')
      return
    }

    const userData = JSON.parse(currentUser)
    if (userData.role?.name?.toLowerCase() !== 'admin') {
      router.push('/')
      return
    }

    setUser(userData)

    const fetchStudents = async () => {
      try {
        const res = await fetch(`${STRAPI_URL}/api/students?populate=*`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const json = await res.json()
        setStudents(json.data)
      } catch (err) {
        console.error('❌ Failed to fetch students:', err)
      }
    }

    const fetchClasses = async () => {
      try {
        const res = await fetch(`http://localhost:1337/api/classes?populate=*`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const json = await res.json() 

        if (!json.data) {
          console.error('❌ No classes found in API response:', json)
          return
        }

        const classList = json.data.map((item: any) => ({
          id: item.id,
          name: item.name,
          section: item.section
        }))

        setClasses(classList)
      } catch (err) {
        console.error('❌ Failed to fetch classes:', err)
      }
    }

    fetchStudents()
    fetchClasses()
  }, [router])

  const filteredStudents = students.filter((s) => {
    const className = s.class?.name ?? ''
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesClass = selectedClass === 'all' || className === selectedClass
    return matchesSearch && matchesClass
  })

  const handleAddStudent = async () => {
    const token = sessionStorage.getItem('token')
    if (!newStudent.name || !newStudent.email || !newStudent.rollNumber || !newStudent.classId) return

    try {
      const res = await fetch(`${STRAPI_URL}/api/students`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            name: newStudent.name,
            email: newStudent.email,
            rollNumber: newStudent.rollNumber,
            address: newStudent.address || '',
            phone: newStudent.phone || '',
            studentStatus: 'active',
            class: parseInt(newStudent.classId)
          }
        })
      })

      const json = await res.json()
      setStudents((prev) => [...prev, json.data])
      setNewStudent({})
      setIsAddDialogOpen(false)
    } catch (err) {
      console.error('❌ Failed to add student:', err)
    }
  }

  const handleDeleteStudent = async (documentId: string) => {
    const token = sessionStorage.getItem('token')
    try {
      await fetch(`${STRAPI_URL}/api/students/${documentId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setStudents((prev) => prev.filter((s) => s.documentId !== documentId))
    } catch (err) {
      console.error('❌ Failed to delete student:', err)
    }
  }

  const handleEditStudent = (student: Student) => {
    setUpdateStudent({
      ...student,
      classId: student.class?.id?.toString() || ''
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdateStudent = async () => {
    const token = sessionStorage.getItem('token')
    if (!updateStudent.name || !updateStudent.email || !updateStudent.rollNumber || !updateStudent.classId) return

    try {
      const res = await fetch(`${STRAPI_URL}/api/students/${updateStudent.documentId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          data: {
            name: updateStudent.name,
            email: updateStudent.email,
            rollNumber: updateStudent.rollNumber,
            address: updateStudent.address || '',
            phone: updateStudent.phone || '',
            studentStatus: updateStudent.studentStatus || 'active',
            class: parseInt(updateStudent.classId)
          }
        })
      })

      const json = await res.json()
      const updated = json.data

      setStudents((prev) =>
        prev.map((s) =>
          s.documentId === updateStudent.documentId ? updated : s
        )
      )

      setIsEditDialogOpen(false)
      setUpdateStudent({})
    } catch (err) {
      console.error('❌ Failed to update student:', err)
    }
  }

  if (!user) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Student Management</h1>
            <p className="text-gray-600">Manage all students in your school</p>
          </div>

          {/* Add Student Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Add Student</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Student</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {['name', 'email', 'rollNumber', 'address', 'phone'].map((field) => (
                  <div key={field} className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right capitalize">{field}</Label>
                    <Input
                      className="col-span-3"
                      value={newStudent[field] || ''}
                      onChange={(e) => setNewStudent({ ...newStudent, [field]: e.target.value })}
                    />
                  </div>
                ))}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Class</Label>
                  <Select onValueChange={(value) => setNewStudent({ ...newStudent, classId: value })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes?.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id.toString()}>
                          {cls.name} - {cls.section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddStudent}>Add Student</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Student Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Update Student</DialogTitle>
                <DialogDescription>Edit student details</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {['name', 'email', 'rollNumber', 'address', 'phone'].map((field) => (
                  <div key={field} className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right capitalize">{field}</Label>
                    <Input
                      className="col-span-3"
                      value={updateStudent?.[field] || ''}
                      onChange={(e) => setUpdateStudent({ ...updateStudent, [field]: e.target.value })}
                    />
                  </div>
                ))}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Class</Label>
                  <Select
                    value={updateStudent.classId}
                    onValueChange={(value) => setUpdateStudent({ ...updateStudent, classId: value })}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((cls) => (
                        <SelectItem key={cls.id} value={cls.id.toString()}>
                          {cls.name} - {cls.section}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleUpdateStudent}>Update Student</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader><CardTitle>Search & Filter</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder="Search by name or roll number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedClass} onValueChange={setSelectedClass}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.name}>
                      {cls.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Student Table */}
        <Card>
          <CardHeader>
            <CardTitle>Students ({filteredStudents.length})</CardTitle>
            <CardDescription>All registered students</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Info</th>
                    <th className="text-left p-4">Class</th>
                    <th className="text-left p-4">Contact</th>
                    <th className="text-left p-4">Status</th>
                    <th className="text-left p-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => (
                    <tr key={s.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium">{s.name}</div>
                        <div className="text-gray-500 text-xs">{s.rollNumber}</div>
                      </td>
                      <td className="p-4">
                        {s.class ? `Class ${s.class.name} - ${s.class.section}` : '—'}
                      </td>
                      <td className="p-4">
                        <div>{s.email}</div>
                        <div className="text-gray-500 text-xs">{s.phone || 'N/A'}</div>
                      </td>
                      <td className="p-4">
                        <Badge variant={s.studentStatus === 'active' ? 'default' : 'secondary'}>
                          {s.studentStatus}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm"><Eye className="h-4 w-4" /></Button>
                          <Button variant="outline" size="sm" onClick={() => handleEditStudent(s)}><Edit className="h-4 w-4" /></Button>
                          <Button variant="outline" size="sm" onClick={() => handleDeleteStudent(s.documentId)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
