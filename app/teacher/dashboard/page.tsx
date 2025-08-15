'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Users,
  Calendar,
  ClipboardList,
  BookOpen,
} from 'lucide-react';
import { toast } from 'sonner';

export default function TeacherDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState({
    students: 0,
    classesToday: 0,
    pendingExams: 0,
    subjects: [] as string[],
  });
  const [schedule, setSchedule] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRaw = localStorage.getItem('user');

    if (!token || !userRaw) {
      console.warn('Token or user missing in localStorage');
      return;
    }

    try {
      const parsedUser = JSON.parse(userRaw);
      setUser(parsedUser);

      const teacherId = parsedUser?.teacher?.documentId;
      if (!teacherId) {
        toast.error('No teacher profile linked to this user.');
        setIsLoading(false);
        return;
      }

      fetchDashboard(teacherId, token);
    } catch (err) {
      console.error('Error parsing user from localStorage:', err);
      toast.error('Failed to load user data.');
      setIsLoading(false);
    }
  }, []);

  const fetchDashboard = async (teacherId: string, token: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/teachers?filters[documentId][$eq]=${teacherId}&populate=subjects,classes.students,exam-results`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      const teacher = data.data?.[0];

      if (!teacher) {
        toast.error('Teacher not found');
        return;
      }

      const subjects = teacher.subjects || [];
      const classes = teacher.classes || [];
      const examResults = teacher.exam_results || [];

      const allStudents = Array.isArray(classes)
        ? classes.flatMap((cls: any) => cls?.students || [])
        : [];

      const pendingExams = Array.isArray(examResults)
        ? examResults.filter((exam: any) => !exam?.marks)
        : [];

      setStats({
        students: allStudents.length,
        classesToday: classes.length,
        pendingExams: pendingExams.length,
        subjects: subjects.map((s: any) => s.name),
      });

      const schedule = classes.map((cls: any, i: number) => ({
        time: `${8 + i}:00 AM`,
        subject: cls.subject || subjects[0]?.name || 'Subject',
        class: `${cls.name}-${cls.section}`,
        room: `Room ${100 + i}`,
      }));

      setSchedule(schedule);
    } catch (err) {
      console.error('Error fetching dashboard:', err);
      toast.error('Failed to load dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      {!user?.teacher ? (
        <div className="text-center text-red-500 text-xl">
          No teacher profile assigned to this user.
        </div>
      ) : isLoading ? (
        <div className="text-center">Loading dashboard...</div>
      ) : (
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Teacher Dashboard</h1>
            <p className="text-gray-600">Welcome, {user.username}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard
              icon={Users}
              title="My Students"
              value={stats.students}
              description="Students across all classes"
              color="text-blue-600"
              bgColor="bg-blue-100"
            />
            <StatCard
              icon={Calendar}
              title="Classes Today"
              value={stats.classesToday}
              description="Scheduled for today"
              color="text-green-600"
              bgColor="bg-green-100"
            />
            <StatCard
              icon={ClipboardList}
              title="Pending Exams"
              value={stats.pendingExams}
              description="Results to be uploaded"
              color="text-orange-600"
              bgColor="bg-orange-100"
            />
            <StatCard
              icon={BookOpen}
              title="Subjects"
              value={stats.subjects.length}
              description={stats.subjects.join(', ') || 'None assigned'}
              color="text-purple-600"
              bgColor="bg-purple-100"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Today's Schedule</CardTitle>
                <CardDescription>Your classes for today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schedule.length > 0 ? (
                    schedule.map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                      >
                        <div>
                          <div className="font-medium">{item.subject}</div>
                          <div className="text-sm text-gray-500">
                            Class {item.class} • {item.room}
                          </div>
                        </div>
                        <div className="text-sm font-medium text-blue-600">
                          {item.time}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No schedule available</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
                <CardDescription>Common tasks for teachers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <QuickAction
                    label="Mark Attendance"
                    icon={Calendar}
                    color="text-blue-600"
                    onClick={() => router.push('/teacher/attendance')}
                  />
                  <QuickAction
                    label="View Students"
                    icon={Users}
                    color="text-green-600"
                    onClick={() => router.push('/teacher/students')}
                  />
                  <QuickAction
                    label="Upload Results"
                    icon={ClipboardList}
                    color="text-purple-600"
                    onClick={() => router.push('/teacher/exams')}
                  />
                  <QuickAction
                    label="Class Reports"
                    icon={BookOpen}
                    color="text-orange-600"
                    onClick={() => router.push('/teacher/reports')}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

const StatCard = ({ icon: Icon, title, value, description, color, bgColor }: any) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <div className={`p-2 rounded-full ${bgColor}`}>
        <Icon className={`h-4 w-4 ${color}`} />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const QuickAction = ({ label, icon: Icon, color, onClick }: any) => (
  <button
    className="p-4 text-left rounded-lg border hover:bg-gray-50 transition-colors"
    onClick={onClick}
  >
    <Icon className={`h-8 w-8 ${color} mb-2`} />
    <p className="font-medium">{label}</p>
    <p className="text-xs text-gray-500">Go to {label.toLowerCase()}</p>
  </button>
);
