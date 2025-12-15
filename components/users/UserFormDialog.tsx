"use client";

import { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera } from "lucide-react";
import { User } from "@/types";

export type UserRole = "admin" | "staff" | "superadmin";

export interface UserFormData {
  name: string;
  username: string;
  password: string;
  role: UserRole;
}

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: User | null;
  formData: UserFormData;
  onFormChange: (data: UserFormData) => void;
  onSubmit: (e: React.FormEvent, file?: File | null) => void;
  loading?: boolean;
  isSuperAdmin?: boolean;
  disableRole?: boolean;
}

export function UserFormDialog({
  open,
  onOpenChange,
  editingUser,
  formData,
  onFormChange,
  onSubmit,
  loading = false,
  isSuperAdmin = false,
  disableRole = false,
}: UserFormDialogProps) {
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        setPreviewUrl(editingUser?.photo_url || null);
        setPhotoFile(null);
      }, 0);
    }
  }, [open, editingUser]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran file maksimal 5MB");
        return;
      }
      setPhotoFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e, photoFile);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-md rounded-2xl p-6 bg-card border-none shadow-xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold">
            {editingUser ? "Edit Profil" : "Tambah User Baru"}
          </DialogTitle>
          <DialogDescription>
            {editingUser
              ? "Perbarui informasi pengguna."
              : "Isi data untuk akun baru."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
          {/* FOTO PROFIL (Hanya saat Edit) */}
          {editingUser && (
            <div className="flex flex-col items-center gap-2 sm:gap-3 mb-2">
              <div
                className="relative group cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
              >
                <Avatar className="h-20 w-20 sm:h-24 sm:w-24 border-4 border-background shadow-lg">
                  <AvatarImage
                    src={previewUrl || ""}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-primary/10 text-primary text-xl sm:text-2xl font-bold">
                    {getInitials(formData.name || "U")}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Camera className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="absolute bottom-0 right-0 bg-primary text-primary-foreground p-1.5 rounded-full shadow-md border-2 border-background">
                  <Camera className="h-3.5 w-3.5" />
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Klik untuk ganti foto
              </p>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          )}

          <div className="space-y-1.5">
            <Label htmlFor="name">Nama Lengkap</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                onFormChange({ ...formData, name: e.target.value })
              }
              required
              disabled={loading}
              placeholder="Contoh: Budi Santoso"
              className="rounded-xl"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) =>
                onFormChange({ ...formData, username: e.target.value })
              }
              required
              disabled={loading}
              placeholder="username_login"
              className="rounded-xl font-mono text-sm"
              autoComplete="off"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">
              Password{" "}
              {editingUser && (
                <span className="text-muted-foreground font-normal text-xs ml-1">
                  (Opsional)
                </span>
              )}
            </Label>
            <Input
              id="password"
              type="password"
              value={formData.password}
              onChange={(e) =>
                onFormChange({ ...formData, password: e.target.value })
              }
              required={!editingUser}
              disabled={loading}
              placeholder={editingUser ? "••••••••" : "Buat password"}
              className="rounded-xl"
              autoComplete="new-password"
            />
          </div>

          {/* ✅ LOGIC ROLE: 
              Hanya tampil jika:
              1. Mode CREATE User (!editingUser)
              2. DAN disableRole tidak diaktifkan
              
              Saat Edit, backend tidak support ganti role, jadi kita sembunyikan total.
          */}
          {!editingUser && !disableRole && (
            <div className="space-y-1.5">
              <Label htmlFor="role">Role / Jabatan</Label>
              <Select
                value={formData.role}
                onValueChange={(value: string) =>
                  onFormChange({ ...formData, role: value as UserRole })
                }
                disabled={loading}
              >
                <SelectTrigger id="role" className="rounded-xl">
                  <SelectValue placeholder="Pilih Role" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="staff">Staff (Pegawai)</SelectItem>
                  <SelectItem value="admin">Admin (Administrator)</SelectItem>
                  {/* Superadmin hanya bisa dipilih jika yang login adalah Superadmin */}
                  {isSuperAdmin && (
                    <SelectItem
                      value="superadmin"
                      className="text-red-600 font-medium"
                    >
                      Superadmin (Akses Penuh)
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1 rounded-full"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 rounded-full shadow-lg shadow-primary/20"
            >
              {loading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" /> Menyimpan...
                </>
              ) : (
                <>{editingUser ? "Simpan Perubahan" : "Buat User"}</>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
