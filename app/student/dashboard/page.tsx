'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  BookOpen,
  TrendingUp,
  Award,
  AlertCircle,
} from 'lucide-react';
import { toast } from 'sonner';

// Types
type GradeRecord = {
  id: number;
  subject: string;
  grade: string;
  percentage: number;
  examDate?: string;
};

const studentStats = [
  {
    title: 'Attendance Rate',
    value: '94%',
    description: 'This month',
    icon: Calendar,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: 'Average Grade',
    value: 'A-',
    description: 'Overall performance',
    icon: Award,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Subjects',
    value: '8',
    description: 'This semester',
    icon: BookOpen,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    title: 'Rank',
    value: '#12',
    description: 'In your class',
    icon: TrendingUp,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
];

const upcomingEvents = [
  { id: 1, title: 'Math Quiz', date: 'Tomorrow', time: '10:00 AM', type: 'exam' },
  { id: 2, title: 'Science Fair', date: 'Next Monday', time: '2:00 PM', type: 'event' },
  { id: 3, title: 'History Assignment Due', date: 'Friday', time: '11:59 PM', type: 'assignment' },
];

export default function StudentDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [recentGrades, setRecentGrades] = useState<GradeRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = localStorage.getItem('user');
    const token = sessionStorage.getItem('token');

    if (!currentUser || !token) {
      router.push('/');
      return;
    }

    const userData = JSON.parse(currentUser);
    if (userData.role?.name?.toLowerCase() !== 'student') {
      router.push('/');
      return;
    }

    setUser(userData);

    const fetchGrades = async () => {
      try {
        // 1. get student record by userId
        const studentRes = await axios.get(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/students?filters[user][id][$eq]=${userData.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const student = studentRes.data.data?.[0];
        if (!student) {
          toast.error('Student record not found');
          return;
        }

        const studentId = student.documentId;

        // 2. get recent exam results for this student
        const gradesRes = await axios.get(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/exam-results?filters[student][documentId][$eq]=${studentId}&sort=examDate:desc&pagination[limit]=5`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const results = gradesRes.data.data.map((item: any) => ({
          id: item.id,
          subject: item.Subject || 'Unknown',
          grade: item.grade || '-',
          percentage: item.totalMarks || 0,
          examDate: item.examDate,
        }));

        setRecentGrades(results || []);
      } catch (error) {
        console.error('Recent grades fetch error:', error);
        toast.error('Failed to fetch recent grades');
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, [router]);

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600';
    if (grade.startsWith('B')) return 'text-blue-600';
    if (grade.startsWith('C')) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Student Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {user.username}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {studentStats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-full ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Events</CardTitle>
              <CardDescription>Important dates and deadlines</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {upcomingEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center gap-4 p-3 border rounded-md"
                >
                  <div>
                    {event.type === 'exam' && <AlertCircle className="h-5 w-5 text-red-500" />}
                    {event.type === 'event' && <Calendar className="h-5 w-5 text-blue-500" />}
                    {event.type === 'assignment' && <BookOpen className="h-5 w-5 text-orange-500" />}
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {event.date} at {event.time}
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Grades */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Grades</CardTitle>
              <CardDescription>Your latest academic performance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <p className="text-muted-foreground">Loading...</p>
              ) : recentGrades.length === 0 ? (
                <p className="text-muted-foreground">No recent grades found.</p>
              ) : (
                recentGrades.map((grade) => (
                  <div key={grade.id} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{grade.subject}</span>
                      <span className={`font-bold ${getGradeColor(grade.grade)}`}>
                        {grade.grade}
                      </span>
                    </div>
                    <Progress value={grade.percentage} className="h-2" />
                    <div className="text-right text-sm text-muted-foreground">
                      {grade.percentage}%
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Access your key sections quickly</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant="outline"
                className="flex flex-col items-start gap-2 h-auto p-6"
                onClick={() => router.push('/student/attendance')}
              >
                <Calendar className="h-6 w-6 text-blue-600" />
                <div>
                  <p className="font-medium">View Attendance</p>
                  <p className="text-sm text-muted-foreground">Check attendance record</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-start gap-2 h-auto p-6"
                onClick={() => router.push('/student/results')}
              >
                <BookOpen className="h-6 w-6 text-green-600" />
                <div>
                  <p className="font-medium">Exam Results</p>
                  <p className="text-sm text-muted-foreground">View your results</p>
                </div>
              </Button>
              <Button
                variant="outline"
                className="flex flex-col items-start gap-2 h-auto p-6"
                onClick={() => router.push('/student/profile')}
              >
                <Clock className="h-6 w-6 text-purple-600" />
                <div>
                  <p className="font-medium">Update Profile</p>
                  <p className="text-sm text-muted-foreground">Manage your info</p>
                </div>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
