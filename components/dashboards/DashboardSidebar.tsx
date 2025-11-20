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
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { User } from "@/types";

interface DashboardSidebarProps {
  user: User | null;
  isAdmin: boolean;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
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
}: DashboardSidebarProps) {
  const pathname = usePathname();

  // Navigation untuk semua user
  const commonNavigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Dokumen", href: "/dashboard/documents", icon: FileText },
  ];

  // Navigation khusus Staff
  const staffNavigation = [
    { name: "Dokumen Saya", href: "/dashboard/my-document", icon: FolderOpen },
  ];

  // Navigation khusus Admin
  const adminPanelNavigation = [
    { name: "Kelola User", href: "/dashboard/admin/users", icon: Users },
    { name: "Activity Log", href: "/dashboard/activity-log", icon: Activity },
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
        border-r bg-background transition-transform duration-200
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}
    >
      <nav className="h-full overflow-y-auto p-4 space-y-2">
        {/* Common Navigation (Semua Role) */}
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
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground"
                }
              `}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}

        {/* Staff Navigation */}
        {!isAdmin && (
          <>
            <div className="my-4 border-t pt-4" />
            <div className="flex items-center gap-2 px-3 mb-2">
              <FolderOpen className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Kelola Dokumen
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
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </>
        )}

        {/* Admin Panel Navigation */}
        {isAdmin && (
          <>
            <div className="my-4 border-t pt-4" />
            <div className="flex items-center gap-2 px-3 mb-2">
              <ShieldCheck className="h-4 w-4 text-primary" />
              <p className="text-xs font-semibold text-muted-foreground uppercase">
                Administrator
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
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent hover:text-accent-foreground"
                    }
                  `}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </>
        )}

        {/* User Info di Mobile */}
        <div className="lg:hidden mt-4 pt-4 border-t">
          <div className="px-3 py-2 rounded-lg bg-accent">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user?.name ? getInitials(user.name) : "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold">{user?.name}</span>
                <span className="text-xs text-muted-foreground">
                  @{user?.username}
                </span>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
}
