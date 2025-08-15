'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Card, CardContent, CardDescription, CardHeader, CardTitle
} from '@/components/ui/card'
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Search, Edit, Trash2, Eye } from 'lucide-react'
import { DashboardLayout } from '@/components/layout/dashboard-layout'

interface Teacher {
  id: number
  documentId: string
  name: string
  email: string
  subject: string
  phone: string
  joiningDate: string
  teacherStatus: 'Active' | 'Inactive'
  experience: string
  class: { id: number; name: string } | null
}

export default function TeachersPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [classes, setClasses] = useState<{ id: number; name: string }[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('all')
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [newTeacher, setNewTeacher] = useState<Partial<Teacher>>({})
  const [updateTeacher, setUpdateTeacher] = useState<Partial<Teacher>>({})

  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL

  useEffect(() => {
    const currentUser = localStorage.getItem('user')
    const token = sessionStorage.getItem('token')
    if (!currentUser || !token) return router.push('/')

    const userData = JSON.parse(currentUser)
    if (userData.role?.name?.toLowerCase() !== 'admin') return router.push('/')

    setUser(userData)

    const fetchTeachers = async () => {
      try {
        const res = await fetch(`${STRAPI_URL}/api/teachers?populate=class&pagination[limit]=100`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const json = await res.json()
        const data: Teacher[] = json.data.map((t: any) => ({
          id: t.id,
          documentId: t.documentId,
          name: t.name,
          email: t.email,
          subject: t.subject,
          phone: t.phone,
          joiningDate: t.joiningDate,
          experience: t.experience,
          teacherStatus: t.teacherStatus,
          class: t.class ? { id: t.class.id, name: t.class.name } : null
        }))
        setTeachers(data)
      } catch (err) {
        console.error('❌ Failed to fetch teachers:', err)
      }
    }

    const fetchClasses = async () => {
      try {
        const res = await fetch(`${STRAPI_URL}/api/classes?pagination[limit]=100`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const json = await res.json()
        const data = json.data.map((c: any) => ({
          id: c.id,
          name: c.name
        }))
        setClasses(data)
      } catch (err) {
        console.error('❌ Failed to fetch classes:', err)
      }
    }

    fetchTeachers()
    fetchClasses()
  }, [router])

  const filteredTeachers = teachers.filter((teacher) => {
    const matchesSearch =
      teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      teacher.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSubject =
      selectedSubject === 'all' ||
      teacher.subject.toLowerCase().includes(selectedSubject.toLowerCase())

    return matchesSearch && matchesSubject
  })

  const handleAddTeacher = async () => {
    const token = sessionStorage.getItem('token')
    if (!newTeacher.name || !newTeacher.email || !newTeacher.subject || !newTeacher.class) return

    const teacherToAdd = {
      name: newTeacher.name,
      email: newTeacher.email,
      subject: newTeacher.subject,
      phone: newTeacher.phone || '',
      joiningDate: new Date().toISOString().split('T')[0],
      teacherStatus: 'Active',
      experience: newTeacher.experience || '0 years',
      class: newTeacher.class.id
    }

    try {
      const res = await fetch(`${STRAPI_URL}/api/teachers`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: teacherToAdd })
      })

      const json = await res.json()
      const t = json.data
      setTeachers((prev) => [...prev, {
        id: t.id,
        documentId: t.documentId,
        name: t.name,
        email: t.email,
        subject: t.subject,
        phone: t.phone,
        joiningDate: t.joiningDate,
        experience: t.experience,
        teacherStatus: t.teacherStatus,
        class: classes.find(c => c.id === teacherToAdd.class) || null
      }])
      setNewTeacher({})
      setIsAddDialogOpen(false)
    } catch (err) {
      console.error('❌ Failed to add teacher:', err)
    }
  }

  const handleUpdateTeacher = async () => {
    const token = sessionStorage.getItem('token')
    if (!updateTeacher?.documentId || !updateTeacher.name || !updateTeacher.email || !updateTeacher.subject || !updateTeacher.class) return

    const teacherToUpdate = {
      name: updateTeacher.name,
      email: updateTeacher.email,
      subject: updateTeacher.subject,
      phone: updateTeacher.phone || '',
      joiningDate: updateTeacher.joiningDate || new Date().toISOString().split('T')[0],
      teacherStatus: updateTeacher.teacherStatus || 'Active',
      experience: updateTeacher.experience || '0 years',
      class: updateTeacher.class.id
    }

    try {
      const res = await fetch(`${STRAPI_URL}/api/teachers/${updateTeacher.documentId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: teacherToUpdate })
      })

      const json = await res.json()
      const updated = json.data

      setTeachers((prev) =>
        prev.map((t) =>
          t.documentId === updated.documentId ? {
            id: updated.id,
            documentId: updated.documentId,
            name: updated.name,
            email: updated.email,
            subject: updated.subject,
            phone: updated.phone,
            joiningDate: updated.joiningDate,
            experience: updated.experience,
            teacherStatus: updated.teacherStatus,
            class: classes.find(c => c.id === teacherToUpdate.class) || null
          } : t
        )
      )
      setUpdateTeacher({})
      setIsEditDialogOpen(false)
    } catch (err) {
      console.error('❌ Failed to update teacher:', err)
    }
  }

  const handleDeleteTeacher = async (documentId: string) => {
    const token = sessionStorage.getItem('token')
    try {
      const res = await fetch(`${STRAPI_URL}/api/teachers/${documentId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      })
      if (res.status === 204) {
        setTeachers((prev) => prev.filter((t) => t.documentId !== documentId))
      } else {
        console.error('❌ Failed to delete: unexpected response', await res.text())
      }
    } catch (err) {
      console.error('❌ Failed to delete teacher:', err)
    }
  }

  const openEditDialog = (teacher: Teacher) => {
    setUpdateTeacher(teacher)
    setIsEditDialogOpen(true)
  }

  if (!user) return null

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teacher Management</h1>
            <p className="text-gray-600">Manage all teachers in your school</p>
          </div>

          {/* Add Teacher Dialog */}
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" /> Add Teacher</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add New Teacher</DialogTitle>
                <DialogDescription>Enter teacher details</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {['name', 'email', 'phone', 'experience'].map((field) => (
                  <div key={field} className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right capitalize">{field}</Label>
                    <Input
                      className="col-span-3"
                      value={typeof newTeacher[field as keyof Teacher] === 'string' ? newTeacher[field as keyof Teacher] as string : ''}
                      onChange={(e) =>
                        setNewTeacher({
                          ...newTeacher,
                          [field]: e.target.value
                        })
                      }
                    />
                  </div>
                ))}

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Subject</Label>
                  <Select onValueChange={(value) => setNewTeacher({ ...newTeacher, subject: value })}>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Mathematics", "Physics", "Chemistry", "Biology", "English", "History"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Class</Label>
                  <Select onValueChange={(value) =>
                    setNewTeacher({ ...newTeacher, class: classes.find(c => c.id === Number(value)) || null })
                  }>
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleAddTeacher}>Add Teacher</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Update Teacher Dialog */}
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Update Teacher</DialogTitle>
                <DialogDescription>Edit teacher details</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                {['name', 'email', 'phone', 'experience'].map((field) => (
                  <div key={field} className="grid grid-cols-4 items-center gap-4">
                    <Label className="text-right capitalize">{field}</Label>
                    <Input
                      className="col-span-3"
                      value={(updateTeacher?.[field as keyof Teacher] as string) || ''}
                      onChange={(e) =>
                        setUpdateTeacher((prev) => ({ ...prev!, [field]: e.target.value }))
                      }
                    />
                  </div>
                ))}
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Subject</Label>
                  <Select
                    value={updateTeacher?.subject || ''}
                    onValueChange={(value) => setUpdateTeacher((prev) => ({ ...prev!, subject: value }))}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select subject" />
                    </SelectTrigger>
                    <SelectContent>
                      {["Mathematics", "Physics", "Chemistry", "Biology", "English", "History"].map((s) => (
                        <SelectItem key={s} value={s}>{s}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label className="text-right">Class</Label>
                  <Select
                    value={updateTeacher?.class?.id ? String(updateTeacher.class.id) : ''}
                    onValueChange={(value) =>
                      setUpdateTeacher((prev) => ({
                        ...prev!,
                        class: classes.find((c) => c.id === Number(value)) || null
                      }))
                    }
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map((c) => (
                        <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleUpdateTeacher}>Update Teacher</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filter/Search Section */}
        <Card>
          <CardHeader><CardTitle>Search & Filter</CardTitle></CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  className="pl-10"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by subject" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Subjects</SelectItem>
                  {["Mathematics", "Physics", "Chemistry", "Biology", "English", "History"].map((s) => (
                    <SelectItem key={s} value={s.toLowerCase()}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Teachers Table */}
        <Card>
          <CardHeader>
            <CardTitle>Teachers ({filteredTeachers.length})</CardTitle>
            <CardDescription>All registered teachers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="p-4 text-left">Info</th>
                    <th className="p-4 text-left">Subject</th>
                    <th className="p-4 text-left">Class</th>
                    <th className="p-4 text-left">Contact</th>
                    <th className="p-4 text-left">Experience</th>
                    <th className="p-4 text-left">Status</th>
                    <th className="p-4 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTeachers.map((t) => (
                    <tr key={t.id} className="border-b hover:bg-gray-50">
                      <td className="p-4">
                        <div className="font-medium">{t.name}</div>
                        <div className="text-xs text-gray-500">Joined {t.joiningDate}</div>
                      </td>
                      <td className="p-4">
                        <Badge variant="secondary" className="text-xs">{t.subject}</Badge>
                      </td>
                      <td className="p-4">
                        {t.class?.name || '—'}
                      </td>
                      <td className="p-4">
                        <div>{t.email}</div>
                        <div className="text-xs text-gray-500">{t.phone}</div>
                      </td>
                      <td className="p-4">{t.experience}</td>
                      <td className="p-4">
                        <Badge variant={t.teacherStatus === 'Active' ? 'default' : 'secondary'}>
                          {t.teacherStatus}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline"><Eye className="w-4 h-4" /></Button>
                          <Button size="sm" variant="outline" onClick={() => openEditDialog(t)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => handleDeleteTeacher(t.documentId)}>
                            <Trash2 className="w-4 h-4" />
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
