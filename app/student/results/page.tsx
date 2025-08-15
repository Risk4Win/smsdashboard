'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, TrendingUp, Award, BookOpen } from 'lucide-react';

const examResults = [
  {
    id: 1,
    examName: 'Mid-Term Examination',
    date: '2024-01-10',
    subjects: [
      { name: 'Mathematics', marks: 92, totalMarks: 100, grade: 'A+' },
      { name: 'Physics', marks: 88, totalMarks: 100, grade: 'A' },
      { name: 'Chemistry', marks: 85, totalMarks: 100, grade: 'B+' },
      { name: 'English', marks: 94, totalMarks: 100, grade: 'A+' },
      { name: 'Biology', marks: 90, totalMarks: 100, grade: 'A' },
    ],
    totalMarks: 449,
    totalPossible: 500,
    percentage: 89.8,
    grade: 'A',
    rank: 12
  },
  {
    id: 2,
    examName: 'Unit Test 3',
    date: '2023-12-15',
    subjects: [
      { name: 'Mathematics', marks: 87, totalMarks: 100, grade: 'A' },
      { name: 'Physics', marks: 92, totalMarks: 100, grade: 'A+' },
      { name: 'Chemistry', marks: 78, totalMarks: 100, grade: 'B' },
    ],
    totalMarks: 257,
    totalPossible: 300,
    percentage: 85.7,
    grade: 'A',
    rank: 8
  }
];

const overallStats = {
  cgpa: 8.9,
  totalExams: 12,
  averagePercentage: 87.5,
  classRank: 12,
  totalStudents: 120
};

export default function StudentResults() {
  const router = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = localStorage.getItem('currentUser');
    if (!currentUser) {
      router.push('/');
      return;
    }
    
    const userData = JSON.parse(currentUser);
    if (userData.role !== 'student') {
      router.push('/');
      return;
    }
    
    setUser(userData);
  }, [router]);

  const getGradeColor = (grade: string) => {
    if (grade.includes('A')) return 'text-green-600 bg-green-100';
    if (grade.includes('B')) return 'text-blue-600 bg-blue-100';
    if (grade.includes('C')) return 'text-yellow-600 bg-yellow-100';
    return 'text-red-600 bg-red-100';
  };

  if (!user) return null;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Exam Results</h1>
          <p className="text-gray-600">View your academic performance</p>
        </div>

        {/* Overall Performance Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">CGPA</CardTitle>
              <Trophy className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{overallStats.cgpa}</div>
              <p className="text-xs text-muted-foreground">Out of 10.0</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{overallStats.averagePercentage}%</div>
              <p className="text-xs text-muted-foreground">Overall percentage</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Class Rank</CardTitle>
              <Award className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">#{overallStats.classRank}</div>
              <p className="text-xs text-muted-foreground">Out of {overallStats.totalStudents}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Exams</CardTitle>
              <BookOpen className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{overallStats.totalExams}</div>
              <p className="text-xs text-muted-foreground">Completed</p>
            </CardContent>
          </Card>
        </div>

        {/* Exam Results */}
        {examResults.map((exam) => (
          <Card key={exam.id}>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">{exam.examName}</CardTitle>
                  <CardDescription>
                    Conducted on {new Date(exam.date).toLocaleDateString()}
                  </CardDescription>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">{exam.percentage}%</div>
                  <Badge className={getGradeColor(exam.grade)}>
                    Grade {exam.grade}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <div className="font-semibold">Total Marks</div>
                  <div className="text-lg">{exam.totalMarks}/{exam.totalPossible}</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">Percentage</div>
                  <div className="text-lg">{exam.percentage}%</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold">Class Rank</div>
                  <div className="text-lg">#{exam.rank}</div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <h4 className="font-semibold">Subject-wise Performance</h4>
                {exam.subjects.map((subject, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{subject.name}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">{subject.marks}/{subject.totalMarks}</span>
                        <Badge className={getGradeColor(subject.grade)} variant="secondary">
                          {subject.grade}
                        </Badge>
                      </div>
                    </div>
                    <Progress value={(subject.marks / subject.totalMarks) * 100} className="h-2" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );
}