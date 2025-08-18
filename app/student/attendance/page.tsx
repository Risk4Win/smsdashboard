"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

interface AttendanceRecord {
  id: number;
  date: string;
  attendanceStatus: string;
}

interface DateRange {
  from?: Date;
  to?: Date;
}

export default function StudentAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const user = JSON.parse(localStorage.getItem("user") || "{}");
        const token = sessionStorage.getItem("token");

        if (!user?.id || !token) {
          setErrorMsg("You are not logged in. Please log in again.");
          setLoading(false);
          return;
        }

        // 1️⃣ Get the student record for this user
        const studentRes = await axios.get(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/students?filters[user][id][$eq]=${user.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const student = studentRes.data.data?.[0];
        const studentId = student?.id;

        if (!studentId) {
          setErrorMsg("No student record found for this account.");
          setLoading(false);
          return;
        }

        // 2️⃣ Get attendance records for this student
        const attendanceRes = await axios.get(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/attendances?filters[student][id][$eq]=${studentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setRecords(attendanceRes.data.data || []);
      } catch (error: any) {
        console.error("Failed to fetch attendance:", error.response?.data || error);

        if (error.response?.status === 401) {
          setErrorMsg("Unauthorized: Invalid or expired token.");
        } else if (error.response?.status === 403) {
          setErrorMsg("Forbidden: Your role doesn’t have permission to access attendance.");
        } else {
          setErrorMsg("Failed to fetch attendance.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAttendance();
  }, []);

  // 3️⃣ Filter records by date range (if selected)
  const filteredRecords = dateRange?.from && dateRange?.to
    ? records.filter((record) => {
        const recordDate = new Date(record.date);
        return recordDate >= dateRange.from! && recordDate <= dateRange.to!;
      })
    : records;

  return (
    <DashboardLayout>
      <div className="p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Attendance</CardTitle>
            {/* Date Range Picker */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[260px] justify-start text-left font-normal">
                  {dateRange?.from && dateRange?.to ? (
                    `${format(dateRange.from, "PPP")} - ${format(dateRange.to, "PPP")}`
                  ) : (
                    "Pick date range"
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="range"
                  selected={dateRange}
                  onSelect={setDateRange}
                  numberOfMonths={2}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : errorMsg ? (
              <p className="text-red-500">{errorMsg}</p>
            ) : filteredRecords.length === 0 ? (
              <p>No attendance records found for this range.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{record.date}</TableCell>
                      <TableCell>{record.attendanceStatus}</TableCell>
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
