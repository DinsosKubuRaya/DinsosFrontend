"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FileText, Menu, ShieldCheck, X } from "lucide-react";
import { UserNav } from "@/components/users/UserNav";
import { User } from "@/types";
import { NotificationBell } from "@/components/dashboards/NotificationBell";

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
  return (
    <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60">
      <div className="flex h-16 items-center px-4 lg:px-8">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden mr-2"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        >
          {sidebarOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </Button>

        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <FileText className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-xl font-bold hidden sm:block">Arsip Digital</h1>
        </Link>

        {isAdmin && (
          <Badge variant="default" className="ml-4 hidden md:flex">
            <ShieldCheck className="mr-1 h-3 w-3" />
            Admin
          </Badge>
        )}

        {/* KONTEN KANAN */}
        <div className="ml-auto flex items-center gap-2">
          <div className="hidden md:flex flex-col items-end mr-2">
            <span className="text-sm font-semibold">{user?.name}</span>
            <span className="text-xs text-muted-foreground capitalize">
              {user?.role}
            </span>
          </div>
          <NotificationBell />
          <UserNav user={user} logout={logout} isAdmin={isAdmin} />
        </div>
      </div>
    </header>
  );
}
