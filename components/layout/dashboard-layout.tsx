'use client';

import { ReactNode, useEffect, useState } from 'react';
import { Sidebar } from './sidebar';
import { Header } from './header';
import { Analytics } from "@vercel/analytics/next"


export function DashboardLayout({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [collapsed, setCollapsed] = useState(false); // new

  useEffect(() => {
    const currentUser = localStorage.getItem('user');
    if (currentUser) {
      setUser(JSON.parse(currentUser));
    }
  }, []);

  if (!user) return null;

  const role = user?.role?.name?.toLowerCase() || 'student';

  return (
    <div className="flex min-h-screen bg-muted">
      <Sidebar role={role} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col">
        <Header user={user} />
        <main className="flex-1 p-6">{children}
          <Analytics />
        </main>
      </div>
    </div>
  );
}
