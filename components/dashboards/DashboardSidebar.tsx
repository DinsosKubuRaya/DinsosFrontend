"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  Users,
  ShieldCheck,
  Activity,
  FolderOpen,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "@/types";
import { Button } from "@/components/ui/button";

interface DashboardSidebarProps {
  user: User | null;
  isAdmin: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  logout?: () => void;
}

const getInitials = (name: string) => {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

export function DashboardSidebar({
  user,
  isAdmin,
  sidebarOpen,
  setSidebarOpen,
  logout,
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const isSuperAdmin = user?.role === "superadmin";
  const commonNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  ];

  const staffNavigation = [
    { name: "Dokumen Saya", href: "/dashboard/my-document", icon: FolderOpen },
  ];

  const adminPanelNavigation = [
    { name: "Arsip Dokumen", href: "/dashboard/documents", icon: FileText },
    { name: "Kelola User", href: "/dashboard/admin/users", icon: Users },
    { name: "Log Aktivitas", href: "/dashboard/activity-log", icon: Activity },
  ];

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`
        fixed lg:sticky top-16 left-0 z-30 h-[calc(100vh-4rem)] w-64 
        border-r bg-background transition-transform duration-200 flex flex-col shadow-sm
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Menu Umum */}
        <div className="space-y-1">
          {commonNavigation.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                    }
                `}
              >
                <Icon className="h-5 w-5" />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* Menu Staff (Hanya muncul jika BUKAN admin) */}
        {!isAdmin && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 px-3 mb-2 mt-4">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Area Staff
              </p>
            </div>
            {staffNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}

        {/* Menu Admin & Super Admin */}
        {isAdmin && (
          <div className="space-y-1">
            <div className="flex items-center gap-2 px-3 mb-2 mt-4">
              {isSuperAdmin ? (
                <ShieldAlert className="h-3.5 w-3.5 text-red-600" />
              ) : (
                <ShieldCheck className="h-3.5 w-3.5 text-blue-600" />
              )}
              <p
                className={`text-xs font-bold uppercase tracking-wider ${
                  isSuperAdmin ? "text-red-700" : "text-blue-700"
                }`}
              >
                {isSuperAdmin ? "Area Super Admin" : "Administrator"}
              </p>
            </div>
            {adminPanelNavigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                    ${
                      isActive(item.href)
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer User Info */}
      <div className="p-4 border-t mt-auto bg-muted/20">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
            <AvatarImage src={user?.photo_url || ""} />
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-bold">
              {user?.name ? getInitials(user.name) : "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col overflow-hidden">
            <span className="text-sm font-semibold truncate text-foreground">
              {user?.name}
            </span>
            <span
              className={`text-[10px] font-bold uppercase tracking-wide truncate ${
                isSuperAdmin ? "text-red-600" : "text-muted-foreground"
              }`}
            >
              {isSuperAdmin ? "Super Admin" : user?.role}
            </span>
          </div>
        </div>
        {logout && (
          <Button
            variant="outline"
            size="sm"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
            onClick={logout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Keluar
          </Button>
        )}
      </div>
    </aside>
  );
}
