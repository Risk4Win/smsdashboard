'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Edit, Eye, Trash2 } from 'lucide-react'

interface User {
    id: number
    username: string
    email: string
    phone: string
    address: string
    role: {
        name: string
    }
}

export default function UsersPage() {
    const router = useRouter()
    const [users, setUsers] = useState<User[]>([])
    const [filteredUsers, setFilteredUsers] = useState<User[]>([])
    const [selectedRole, setSelectedRole] = useState('all')
    const [search, setSearch] = useState('')

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

        const fetchUsers = async () => {
            try {
                const res = await fetch(`${STRAPI_URL}/api/users?populate=role`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                const json = await res.json()
                setUsers(json)
                setFilteredUsers(json)
            } catch (err) {
                console.error('❌ Failed to fetch users:', err)
            }
        }

        fetchUsers()
    }, [router])

    useEffect(() => {
        let filtered = users

        if (selectedRole !== 'all') {
            filtered = filtered.filter((u) =>
                u.role?.name?.toLowerCase() === selectedRole.toLowerCase()
            )
        }

        if (search.trim()) {
            filtered = filtered.filter((u) =>
                u.username?.toLowerCase().includes(search.toLowerCase()) ||
                u.email?.toLowerCase().includes(search.toLowerCase())
            )
        }

        setFilteredUsers(filtered)
    }, [search, selectedRole, users])
    

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold">All Users</h1>
                    <Button onClick={() => router.push('/admin/addUser')}>
                        + Add User
                    </Button>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Filter & Search</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex gap-4">
                            <Input
                                placeholder="Search by name or email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                            <Select value={selectedRole} onValueChange={setSelectedRole}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Filter by role" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Roles</SelectItem>
                                    <SelectItem value="student">Student</SelectItem>
                                    <SelectItem value="teacher">Teacher</SelectItem>
                                    <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Users ({filteredUsers.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b text-left">
                                        <th className="p-3">Name</th>
                                        <th className="p-3">Email</th>
                                        <th className="p-3">Role</th>
                                        <th className="p-3">Phone</th>
                                        <th className="p-3">Address</th>
                                        <th className="p-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.map((user) => (
                                        <tr key={user.id} className="border-b hover:bg-muted/30">
                                            <td className="p-3">{user.username}</td>
                                            <td className="p-3">{user.email}</td>
                                            <td className="p-3">
                                                <Badge variant={
                                                    user.role.name.toLowerCase() === 'admin'
                                                        ? 'destructive'
                                                        : user.role.name.toLowerCase() === 'teacher'
                                                            ? 'secondary'
                                                            : 'default'
                                                }>
                                                    {user.role.name}
                                                </Badge>
                                            </td>
                                            <td className="p-3">{user.phone || 'N/A'}</td>
                                            <td className="p-3">{user.address || 'N/A'}</td>
                                            <td className="p-4">
                                                <div className="flex gap-2">
                                                    <Button size="sm" variant="outline"><Eye className="w-4 h-4" /></Button>
                                                    <Button size="sm" variant="outline" >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button size="sm" variant="outline">
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
