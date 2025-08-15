'use client';

import { ChevronDown, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Header({ user }: { user: any }) {
  const handleLogout = () => {
    localStorage.removeItem('user');
    sessionStorage.removeItem('token');
    window.location.href = '/';
  };

  return (
    <header className="w-full flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 border-b bg-white shadow-sm">
      <h1 className="text-lg sm:text-xl font-semibold text-gray-800 hidden md:flex">
        School Management System
      </h1>
      <h1 className="text-lg sm:text-xl font-semibold text-gray-800 flex md:hidden">
        SMS
      </h1>

      {/* Desktop view */}
      <div className="hidden md:flex items-center space-x-4">
        <p className="text-sm text-gray-600">
          Logged in as{" "}
          <span className="font-medium">
            {user?.username} ({user?.role?.name})
          </span>
        </p>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="w-4 h-4 mr-1" /> Logout
        </Button>
      </div>

      {/* Mobile view */}
      <div className="flex md:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              {user?.username} ({user?.role?.name})
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-1" /> Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
