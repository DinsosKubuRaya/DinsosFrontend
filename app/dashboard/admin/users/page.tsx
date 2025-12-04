"use client";

import { useState, useEffect } from "react";
import { AdminGuard } from "@/components/ui/admin/admin-guard";
import { userAPI, getErrorMessage } from "@/lib/api";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { UserPlus, Search } from "lucide-react";
import { getUserId } from "@/lib/userHelpers";
import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";

import { UserTable } from "@/components/users/TableUser";
import { UserMobileCard } from "@/components/users/UserMobileCard";
import { UserFormDialog } from "@/components/users/UserFormDialog";
import { DeleteUserDialog } from "@/components/users/DeleteUserDialog";

interface UserFormData {
  name: string;
  username: string;
  password: string;
  role: "admin" | "staff" | "superadmin";
}

export default function AdminUsersPage() {
  const { isSuperAdmin } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    username: "",
    password: "",
    role: "staff",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userAPI.getAll();
      setUsers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data user");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent, photoFile?: File | null) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      if (editingUser) {
        const userId = getUserId(editingUser);
        if (!userId) throw new Error("ID User tidak valid");
        const updateData = new FormData();
        updateData.append("name", formData.name);
        updateData.append("username", formData.username);
        updateData.append("role", formData.role);

        if (formData.password) {
          updateData.append("new_password", formData.password);
        }

        if (photoFile) {
          updateData.append("photo", photoFile);
        }

        await userAPI.update(userId, updateData);
        toast.success("User berhasil diperbarui");
      } else {
        await userAPI.create({
          name: formData.name,
          username: formData.username,
          password: formData.password,
          role: formData.role,
        });

        if (photoFile) {
          toast.info("User dibuat. Foto hanya bisa diupload lewat menu Edit.");
        } else {
          toast.success("User berhasil ditambahkan");
        }
      }

      setDialogOpen(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      toast.error(editingUser ? "Gagal update" : "Gagal tambah", {
        description: getErrorMessage(error),
      });
    } finally {
      setActionLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    if (!isSuperAdmin) {
      toast.error("Akses Ditolak", {
        description: "Hanya Superadmin yang dapat mengedit user lain.",
      });
      return;
    }

    setEditingUser(user);
    setFormData({
      name: user.name || "",
      username: user.username || "",
      password: "",
      role: (user.role as "admin" | "staff" | "superadmin") || "staff",
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    if (!isSuperAdmin) {
      toast.error("Akses Ditolak", {
        description: "Hanya Superadmin yang dapat menghapus user.",
      });
      return;
    }
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;
    const userId = getUserId(userToDelete);
    if (!userId) return;

    setActionLoading(true);
    try {
      await userAPI.delete(userId);
      toast.success("User berhasil dihapus");
      fetchUsers();
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      toast.error("Gagal hapus user", { description: getErrorMessage(error) });
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      username: "",
      password: "",
      role: "staff",
    });
    setEditingUser(null);
  };

  return (
    <AdminGuard>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Manajemen User
            </h1>
            <p className="text-muted-foreground mt-1 text-sm md:text-base">
              Kelola akun pegawai dan hak akses sistem.
            </p>
          </div>

          {isSuperAdmin && (
            <Button
              onClick={() => {
                setEditingUser(null);
                resetForm();
                setDialogOpen(true);
              }}
              className="rounded-full shadow-lg shadow-primary/20 px-6 h-11"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Tambah User
            </Button>
          )}
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau username..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 h-11 rounded-xl bg-card border-border/60 shadow-sm focus:border-primary/40"
          />
        </div>

        <Card className="rounded-2xl border-border/60 shadow-sm bg-card overflow-hidden">
          <CardHeader className="bg-muted/20 border-b border-border/40 py-4 px-6">
            <CardTitle className="text-lg font-semibold text-foreground/80">
              Daftar Pengguna Aktif
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <UserTable
                    users={filteredUsers}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    loading={actionLoading}
                  />
                </div>
                <div className="md:hidden p-4">
                  <UserMobileCard
                    users={filteredUsers}
                    onEdit={handleEdit}
                    onDelete={handleDeleteClick}
                    loading={actionLoading}
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Form Dialog (Create/Edit) */}
        <UserFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          editingUser={editingUser}
          formData={formData}
          onFormChange={setFormData}
          onSubmit={handleSubmit}
          loading={actionLoading}
          isSuperAdmin={isSuperAdmin}
        />

        {/* Delete Confirmation Dialog */}
        <DeleteUserDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          userToDelete={userToDelete}
          onConfirm={handleDeleteConfirm}
          loading={actionLoading}
        />
      </div>
    </AdminGuard>
  );
}
