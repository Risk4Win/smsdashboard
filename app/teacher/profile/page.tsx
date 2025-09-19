'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Image from 'next/image'
import { DashboardLayout } from '@/components/layout/dashboard-layout'
import { toast } from 'sonner'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<Record<string, any>>({})
  const [newImage, setNewImage] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)

  const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL

  useEffect(() => {
    const token = sessionStorage.getItem('token')
    if (!token) return router.push('/')

    const fetchUser = async () => {
      try {
        const res = await fetch(`${STRAPI_URL}/api/users/me?populate=*`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        })
        const data = await res.json()
        setUser(data)
        setProfile({
          name: data.username,
          email: data.email,
          phone: data.phone || '',
          address: data.address || '',
          id: data.id,
          role: data.role?.name,
          profilePic: data.profilePic?.url
        })
      } catch (err) {
        console.error('❌ Failed to fetch user:', err)
      }
    }

    fetchUser()
  }, [router])

  const handleUpdate = async () => {
    const token = sessionStorage.getItem('token')
    if (!token || !profile.id) return

    setLoading(true)

    let profilePicId = null
    if (newImage) {
      const formData = new FormData()
      formData.append('files', newImage)

      const uploadRes = await fetch(`${STRAPI_URL}/api/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      })
      const uploadData = await uploadRes.json()
      profilePicId = uploadData[0]?.id
    }

    try {
      await fetch(`${STRAPI_URL}/api/users/${profile.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: profile.name,
          email: profile.email,
          phone: profile.phone,
          address: profile.address,
          profilePic: profilePicId ?? undefined
        })
      })

      toast.success('Profile updated successfully')
      setNewImage(null)
    } catch (err) {
      console.error('❌ Failed to update profile:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!user) return null

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto mt-10">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              {profile.profilePic ? (
                <Image
                  src={`${STRAPI_URL}${profile.profilePic}`}
                  alt="Profile Picture"
                  width={64}
                  height={64}
                  className="rounded-full"
                />
              ) : (
                <div className="w-16 h-16 rounded-full bg-gray-300" />
              )}
              <div>
                <Label className="block mb-1">Change Picture</Label>
                <Input type="file" onChange={(e) => setNewImage(e.target.files?.[0] || null)} />
              </div>
            </div>

            <div>
              <Label>Name</Label>
              <Input value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
            </div>

            <div>
              <Label>Email</Label>
              <Input value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
            </div>

            <div>
              <Label>Phone</Label>
              <Input value={profile.phone} onChange={(e) => setProfile({ ...profile, phone: e.target.value })} />
            </div>

            <div>
              <Label>Address</Label>
              <Input value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
            </div>

            <div>
              <Label>Role</Label>
              <Input value={profile.role} disabled />
            </div>

            <Button onClick={handleUpdate} disabled={loading}>
              {loading ? 'Updating...' : 'Update Profile'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
