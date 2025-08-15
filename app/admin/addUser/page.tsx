'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@/components/ui/select'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent
} from '@/components/ui/card'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { toast } from 'sonner'

export default function AddUserPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [roles, setRoles] = useState<{ id: number; name: string }[]>([])
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    roleId: '',
    phone: '',
    address: ''
  })

  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL

  useEffect(() => {
    const token = sessionStorage.getItem('token')
    const currentUser = localStorage.getItem('user')

    if (!token || !currentUser) {
      router.push('/')
      return
    }

    const parsed = JSON.parse(currentUser)
    if (parsed.role?.name?.toLowerCase() !== 'admin') {
      router.push('/')
      return
    }

    setUser(parsed)

    const fetchRoles = async () => {
      try {
        const res = await fetch(`${STRAPI_URL}/api/users-permissions/roles`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const json = await res.json()
        const roleList = Object.values(json.roles).map((r: any) => ({
          id: r.id,
          name: r.name
        }))
        setRoles(roleList)
      } catch (err) {
        console.error('❌ Failed to fetch roles:', err)
      }
    }

    fetchRoles()
  }, [router])

  const handleSubmit = async () => {
    const token = sessionStorage.getItem('token')
    const { username, email, password, roleId, phone, address } = formData

    if (!username || !email || !password || !roleId) {
      toast.error('Please fill in all required fields.')
      return
    }

    try {
      // 1. Create user
      const res = await fetch(`${STRAPI_URL}/api/users`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          email,
          password,
          role: roleId,
          phone,
          address
        })
      })

      if (!res.ok) throw new Error('Failed to create user.')

      const createdUser = await res.json()

      // 2. Identify role (teacher/student)
      const selectedRole = roles.find((r) => r.id.toString() === roleId)?.name.toLowerCase()

      // 3. Create corresponding relation
      if (selectedRole === 'teacher') {
        await fetch(`${STRAPI_URL}/api/teachers`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            data: {
              name: username,
              email,
              user: createdUser.id
            }
          })
        })
      } else if (selectedRole === 'student') {
        await fetch(`${STRAPI_URL}/api/students`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            data: {
              name: username,
              email,
              user: createdUser.id
            }
          })
        })
      }

      toast.success('✅ User and relation created successfully!')
      router.push('/admin/user')
    } catch (err) {
      console.error('❌ Failed to add user:', err)
      toast.error('Something went wrong!')
    }
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Add New User</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {['username', 'email', 'password', 'phone', 'address'].map((field) => (
              <div key={field} className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right capitalize">{field}</Label>
                <Input
                  type={field === 'password' ? 'password' : 'text'}
                  className="col-span-3"
                  value={formData[field as keyof typeof formData]}
                  onChange={(e) =>
                    setFormData({ ...formData, [field]: e.target.value })
                  }
                />
              </div>
            ))}

            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Role</Label>
              <Select
                value={formData.roleId}
                onValueChange={(value) => setFormData({ ...formData, roleId: value })}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map((role) => (
                    <SelectItem key={role.id} value={role.id.toString()}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end">
              <Button onClick={handleSubmit}>Add User</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
