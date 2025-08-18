"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ExamResult {
  id: number;
  title: string;
  Subject: string;
  examDate: string;
  totalMarks: number;
  obtainedMarks: number;
}

export default function StudentExamResultsPage() {
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("all");

  useEffect(() => {
    const fetchResults = async () => {
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

        // 2️⃣ Get exam results for this student
        const examRes = await axios.get(
          `${process.env.NEXT_PUBLIC_STRAPI_URL}/api/exam-results?filters[student][id][$eq]=${studentId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        setResults(examRes.data.data || []);
      } catch (error: any) {
        console.error("Failed to fetch exam results:", error.response?.data || error);

        if (error.response?.status === 401) {
          setErrorMsg("Unauthorized: Invalid or expired token.");
        } else {
          setErrorMsg("Failed to fetch exam results.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  // 3️⃣ Filter by subject
  const filteredResults =
    selectedSubject === "all"
      ? results
      : results.filter((res) => res.Subject === selectedSubject);

  // 4️⃣ Get unique subjects for dropdown
  const uniqueSubjects = Array.from(new Set(results.map((r) => r.Subject)));

  return (
    <DashboardLayout>
      <div className="p-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>My Exam Results</CardTitle>
            {/* Subject Filter */}
            <Select onValueChange={(val) => setSelectedSubject(val)} defaultValue="all">
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by subject" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Subjects</SelectItem>
                {uniqueSubjects.map((subject) => (
                  <SelectItem key={subject} value={subject}>
                    {subject}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            ) : filteredResults.length === 0 ? (
              <p>No exam results found.</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Exam Date</TableHead>
                    <TableHead>Marks</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredResults.map((res) => (
                    <TableRow key={res.id}>
                      <TableCell>{res.title}</TableCell>
                      <TableCell>{res.Subject}</TableCell>
                      <TableCell>{res.examDate}</TableCell>
                      <TableCell>
                        {res.obtainedMarks} / {res.totalMarks}
                      </TableCell>
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
