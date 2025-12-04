"use client";

import { useState } from "react";
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
import { Menu, LogOut, ChevronDown, User as UserIcon } from "lucide-react";
import Image from "next/image";
import { User } from "@/types";
import { NotificationBell } from "./NotificationBell";

import {
  UserFormDialog,
  UserFormData,
  UserRole,
} from "@/components/users/UserFormDialog";
import { userAPI, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { getUserId } from "@/lib/userHelpers";

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
  sidebarOpen,
  setSidebarOpen,
}: DashboardHeaderProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState<UserFormData>({
    name: user?.name || "",
    username: user?.username || "",
    password: "",
    role: (user?.role as UserRole) || "staff",
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleOpenProfile = () => {
    if (user) {
      setFormData({
        name: user.name,
        username: user.username,
        password: "",
        role: user.role as UserRole,
      });
      setIsProfileOpen(true);
    }
  };

  const handleSaveProfile = async (
    e: React.FormEvent,
    photoFile?: File | null
  ) => {
    e.preventDefault();
    if (!user) return;

    const userId = getUserId(user);
    if (!userId) return;

    setIsSaving(true);
    try {
      const updateData = new FormData();
      updateData.append("name", formData.name);
      updateData.append("username", formData.username);
      if (formData.password && formData.password.trim() !== "") {
        updateData.append("new_password", formData.password);
      }

      if (photoFile) {
        updateData.append("photo", photoFile);
      }

      await userAPI.update(userId, updateData);

      toast.success("Profil berhasil diperbarui", {
        description: "Halaman akan dimuat ulang...",
      });

      setIsProfileOpen(false);
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      toast.error("Gagal memperbarui profil", {
        description: getErrorMessage(error),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-16 border-b border-border/50 bg-background/80 backdrop-blur-xl transition-all">
        <div className="flex h-full items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-muted-foreground"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-6 w-6" />
            </Button>

            <div className="flex items-center gap-3">
              <Image
                src="/logodinsos.png"
                alt="Logo"
                width={150}
                height={40}
                className="h-10 w-auto object-contain"
                priority
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <NotificationBell />
            <div className="h-6 w-px bg-border/50 hidden md:block mx-1" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="pl-1 pr-2 gap-2 h-10 rounded-full hover:bg-muted/50 border border-transparent hover:border-border/50 transition-all"
                >
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage src={user?.photo_url || ""} alt={user?.name} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                      {user?.name ? getInitials(user.name) : "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start text-left mr-1">
                    <span className="text-xs font-semibold leading-none">
                      {user?.name?.split(" ")[0]}
                    </span>
                    <span className="text-[10px] text-muted-foreground capitalize leading-none mt-0.5">
                      {user?.role}
                    </span>
                  </div>
                  <ChevronDown className="h-3 w-3 text-muted-foreground opacity-50 hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 mt-2 rounded-2xl shadow-xl border-border/60 p-1"
                align="end"
              >
                <DropdownMenuLabel className="font-normal p-3 bg-muted/30 rounded-xl mb-1">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none text-foreground">
                      {user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground break-all">
                      @{user?.username}
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuItem
                  onClick={handleOpenProfile}
                  className="cursor-pointer rounded-xl py-2.5 px-3 font-medium transition-colors hover:bg-muted"
                >
                  <UserIcon className="mr-2 h-4 w-4 text-muted-foreground" />{" "}
                  Edit Profil Saya
                </DropdownMenuItem>

                <DropdownMenuSeparator className="my-1 bg-border/50" />

                <DropdownMenuItem
                  onClick={logout}
                  className="text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer rounded-xl py-2.5 px-3 font-medium transition-colors"
                >
                  <LogOut className="mr-2 h-4 w-4" /> Keluar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Dialog Edit Profil */}
      <UserFormDialog
        open={isProfileOpen}
        onOpenChange={setIsProfileOpen}
        editingUser={user}
        formData={formData}
        onFormChange={setFormData}
        onSubmit={handleSaveProfile}
        loading={isSaving}
        isSuperAdmin={false}
        disableRole={true}
      />
    </>
  );
}
