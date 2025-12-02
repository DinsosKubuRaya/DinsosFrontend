"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, LogOut, User as UserIcon, Settings } from "lucide-react";
import Link from "next/link";
import { User } from "@/types";
import Image from "next/image";
import { NotificationBell } from "./NotificationBell";

interface DashboardHeaderProps {
  user: User | null;
  logout: () => void;
  isAdmin: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export function DashboardHeader({
  user,
  logout,
  isAdmin,
  sidebarOpen,
  setSidebarOpen,
}: DashboardHeaderProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Format Role Display
  const getRoleLabel = (role?: string) => {
    if (role === "superadmin") return "Super Admin";
    if (role === "admin") return "Administrator";
    return "Staff Pegawai";
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center px-4 md:px-6">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="mr-4 lg:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">Toggle Menu</span>
        </Button>

        {/* Logo / Title */}
        <div className="flex items-center gap-2 font-bold text-lg md:text-xl cursor-pointer">
          <Image src="/logodinsos.png" alt="Logo" width={150} height={150} />
        </div>

        {/* Right Section */}
        <div className="ml-auto flex items-center gap-2 md:gap-4">
          <NotificationBell />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar className="h-9 w-9 border-2 border-primary/10">
                  <AvatarImage src={user?.photo_url || ""} alt={user?.name} />
                  <AvatarFallback className="bg-primary/5 font-bold text-primary">
                    {user?.name ? getInitials(user.name) : "U"}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.name}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span
                      className={`text-xs px-1.5 py-0.5 rounded font-semibold ${
                        user?.role === "superadmin"
                          ? "bg-red-100 text-red-700"
                          : user?.role === "admin"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {getRoleLabel(user?.role)}
                    </span>
                  </div>
                  <p className="text-xs leading-none text-muted-foreground mt-1">
                    @{user?.username}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {/* <DropdownMenuItem>
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profil Saya</span>
              </DropdownMenuItem> */}
              {/* <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Pengaturan</span>
              </DropdownMenuItem> */}
              {/* <DropdownMenuSeparator /> */}
              <DropdownMenuItem
                onClick={logout}
                className="text-red-600 focus:bg-red-50 focus:text-red-700 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                <span>Keluar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
