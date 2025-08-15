'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';

type AttendanceRecord = {
  id: number;
  date: string;
  attendanceStatus: 'present' | 'absent' | 'leave';
  remarks?: string | null;
};

export default function StudentAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found. User might not be logged in.');
        return;
      }

      try {
        const userRes = await axios.get('http://localhost:1337/api/users/me?populate=student', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const documentId = userRes.data.student.documentId;

        toast.success('Attendance records fetched successfully' + documentId);
        if (!documentId) {
          console.error('No documentId found in user data');
          return;
        }

        const attendanceRes = await axios.get(
          `http://localhost:1337/api/attendances?filters[documentId][$eq]=${documentId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setRecords(attendanceRes.data.data || []);
      } catch (error) {
        console.error('Error fetching attendance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);


  return (
    <DashboardLayout>
      <div className="p-6">
        <Card>
          <CardHeader>
            <CardTitle>Attendance</CardTitle>
            <CardDescription>Your daily attendance record</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Loading...</p>
            ) : records.length === 0 ? (
              <p className="text-muted-foreground">No attendance records found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Remarks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {records.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{new Date(record.date).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <span
                          className={`font-medium ${record.attendanceStatus === 'present'
                              ? 'text-green-600'
                              : record.attendanceStatus === 'absent'
                                ? 'text-red-600'
                                : 'text-yellow-600'
                            }`}
                        >
                          {record.attendanceStatus}
                        </span>
                      </TableCell>
                      <TableCell>{record.remarks || '-'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
