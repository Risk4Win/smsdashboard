'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  Calendar,
  BookOpen,
  Settings,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { useEffect } from 'react';

export function Sidebar({
  role,
  collapsed,
  setCollapsed,
}: {
  role: string;
  collapsed: boolean;
  setCollapsed: (val: boolean) => void;
}) {
  const pathname = usePathname();

  // Force collapse on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setCollapsed(true);
      }
    };
    handleResize(); // Run on mount
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [setCollapsed]);

  const baseLinks = [
    { href: `/${role}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
    { href: `/${role}/profile`, label: 'Profile', icon: Settings },
  ];

  const studentLinks = [
    { href: `/${role}/classes`, label: 'Classes', icon: BookOpen },
    { href: `/${role}/exams`, label: 'Exams', icon: Calendar },
    { href: `/${role}/grades`, label: 'Grades', icon: BookOpen },
    { href: `/${role}/attendance`, label: 'Attendance', icon: Users },
  ];

  const teacherLinks = [
    { href: `/${role}/classes`, label: 'Classes', icon: BookOpen },
    { href: `/${role}/students`, label: 'Students', icon: Users },
    { href: `/${role}/exams`, label: 'Exams', icon: BookOpen },
    { href: `/${role}/attendance`, label: 'Attendance', icon: Users },
    { href: `/${role}/reports`, label: 'Reports', icon: BookOpen },
  ];

  const adminLinks = [
    { href: `/${role}/students`, label: 'Students', icon: BookOpen },
    { href: '/admin/teachers', label: 'Teachers', icon: GraduationCap },
    { href: '/admin/reports', label: 'Reports', icon: BookOpen },
    { href: '/admin/attendance', label: 'Attendance', icon: Users },
    { href: '/admin/users', label: 'Users', icon: Users },
  ];

  const links =
    role === 'admin'
      ? [...baseLinks, ...adminLinks]
      : role === 'teacher'
      ? [...baseLinks, ...teacherLinks]
      : role === 'student'
      ? [...baseLinks, ...studentLinks]
      : [];

  return (
    <aside
      className={cn(
        'bg-white border-r min-h-screen p-4 transition-all duration-300 flex flex-col justify-between',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      <div>
        {/* Toggle Button (hidden on mobile) */}
        <div className="flex justify-end mb-6 md:hidden">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-500 hover:text-black"
          >
            {collapsed ? <ChevronsRight /> : <ChevronsLeft />}
          </button>
        </div>

        {/* Nav Links */}
        <nav className="space-y-2">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center px-3 py-2 rounded-md text-sm font-medium hover:bg-gray-100',
                pathname === href ? 'bg-gray-200 text-black' : 'text-gray-700'
              )}
            >
              <Icon className="h-5 w-5" />
              {!collapsed && <span className="ml-3">{label}</span>}
            </Link>
          ))}
        </nav>
      </div>
    </aside>
  );
}
