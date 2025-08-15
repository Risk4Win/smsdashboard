'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import axios from 'axios'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()


  const handleLogin = async () => {
    setLoading(true)
    try {
      // 1. Login with email and password
      const res = await axios.post(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/auth/local`, {
        identifier: email,
        password,
      })

      const { jwt } = res.data
      sessionStorage.setItem('token', jwt)

      // 2. Fetch user with full relations (role + teacher/student/admin)
      const userRes = await axios.get(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/users/me?populate=*`,
        {
          headers: {
            Authorization: `Bearer ${jwt}`,
          },
        }
      )

      const user = userRes.data
      const role = user?.role?.name?.toLowerCase()

      // Save user and role in localStorage
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('role', role)

      // 3. Navigate to dashboard based on role
      if (user && jwt && role) {
        if (role === 'admin') {
          router.push('/admin/dashboard')
        } else if (role === 'teacher') {
          router.push('/teacher/dashboard')
        } else if (role === 'student') {
          router.push('/student/dashboard')
        } else {
          toast.error('Unknown role: ' + role)
        }
      }

    } catch (err: any) {
      console.error('❌ Login error:', err)
      toast.error(err?.response?.data?.error?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-muted px-4">
      <Card className="w-full max-w-md shadow-lg rounded-2xl">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Login to SMS</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <Label>Password<span className='text-red-600'>*</span></Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <Button className="w-full" onClick={handleLogin} disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
