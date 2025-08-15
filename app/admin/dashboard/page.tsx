'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, GraduationCap, BookOpen, Calendar } from 'lucide-react';

export default function AdminDashboard() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [attendanceRate, setAttendanceRate] = useState('0%');

  useEffect(() => {
    const currentUser = localStorage.getItem('user');
    const token = sessionStorage.getItem('token');

    if (!currentUser || !token) {
      router.push('/');
      return;
    }

    const userData = JSON.parse(currentUser);
    if (userData.role?.name?.toLowerCase() !== 'admin') {
      router.push('/');
      return;
    }

    setUser(userData);

    const fetchStats = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [studentsRes, teachersRes, classesRes, attendanceRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/students`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/teachers`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/classes`, { headers }),
          fetch(`${process.env.NEXT_PUBLIC_STRAPI_URL}/api/attendances`, { headers }),
        ]);

        const students = await studentsRes.json();
        const teachers = await teachersRes.json();
        const classes = await classesRes.json();
        const attendance = await attendanceRes.json();

        setTotalStudents(students?.data?.length || 0);
        setTotalTeachers(teachers?.data?.length || 0);
        setTotalClasses(classes?.data?.length || 0);

        const presentCount = attendance?.data?.filter((item: any) => item.status === 'present').length || 0;
        const totalCount = attendance?.data?.length || 1;
        const rate = ((presentCount / totalCount) * 100).toFixed(1) + '%';

        setAttendanceRate(rate);

      } catch (error) {
        console.error('❌ Failed to fetch stats:', error);
      }
    };

    fetchStats();
  }, [router]);

  if (!user) return null;

  const recentActivities = [
    { id: 1, action: 'New student enrolled', user: 'John Doe', time: '2 hours ago' },
    { id: 2, action: 'Exam results published', user: 'Ms. Smith', time: '4 hours ago' },
    { id: 3, action: 'Attendance marked', user: 'Mr. Johnson', time: '6 hours ago' },
    { id: 4, action: 'New teacher added', user: 'Admin', time: '1 day ago' },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600">Welcome back, manage your school efficiently</p>
        </div>

        {/* Stats Grid - MANUAL */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Students</CardTitle>
              <div className="p-2 rounded-full bg-blue-100">
                <Users className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalStudents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Teachers</CardTitle>
              <div className="p-2 rounded-full bg-green-100">
                <GraduationCap className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalTeachers}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Classes</CardTitle>
              <div className="p-2 rounded-full bg-purple-100">
                <BookOpen className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{totalClasses}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
              <div className="p-2 rounded-full bg-orange-100">
                <Calendar className="h-4 w-4 text-orange-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900">{attendanceRate}</div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Activities</CardTitle>
              <CardDescription>Latest actions in your school</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-gray-500">by {activity.user}</p>
                    </div>
                    <div className="text-xs text-gray-400">{activity.time}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common administrative tasks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <button
                  className="p-4 text-left rounded-lg border hover:bg-gray-50 transition-colors"
                  onClick={() => router.push('/admin/students')}
                >
                  <Users className="h-8 w-8 text-blue-600 mb-2" />
                  <p className="font-medium">Manage Students</p>
                  <p className="text-xs text-gray-500">Add, edit, or remove students</p>
                </button>
                <button
                  className="p-4 text-left rounded-lg border hover:bg-gray-50 transition-colors"
                  onClick={() => router.push('/admin/teachers')}
                >
                  <GraduationCap className="h-8 w-8 text-green-600 mb-2" />
                  <p className="font-medium">Manage Teachers</p>
                  <p className="text-xs text-gray-500">Add, edit, or remove teachers</p>
                </button>
                <button
                  className="p-4 text-left rounded-lg border hover:bg-gray-50 transition-colors"
                  onClick={() => router.push('/admin/attendance')}
                >
                  <Calendar className="h-8 w-8 text-purple-600 mb-2" />
                  <p className="font-medium">View Attendance</p>
                  <p className="text-xs text-gray-500">Monitor student attendance</p>
                </button>
                <button
                  className="p-4 text-left rounded-lg border hover:bg-gray-50 transition-colors"
                  onClick={() => router.push('/admin/reports')}
                >
                  <BookOpen className="h-8 w-8 text-orange-600 mb-2" />
                  <p className="font-medium">Generate Reports</p>
                  <p className="text-xs text-gray-500">View detailed analytics</p>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
