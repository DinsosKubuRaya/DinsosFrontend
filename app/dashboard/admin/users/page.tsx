"use client";

import { useState, useEffect } from "react";
import { AdminGuard } from "@/components/ui/admin/admin-guard";
import { userAPI, getErrorMessage } from "@/lib/api";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { UserPlus } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { getUserId } from "@/lib/userHelpers";
import { useAuth } from "@/context/AuthContext";

import { UserTable } from "@/components/users/TableUser";
import { UserMobileCard } from "@/components/users/UserMobileCard";
import { UserFormDialog } from "@/components/users/UserFormDialog";
import { DeleteUserDialog } from "@/components/users/DeleteUserDialog";

export default function AdminUsersPage() {
  const { isSuperAdmin } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "staff" as "admin" | "staff" | "superadmin",
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
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (editingUser) {
        const userId = getUserId(editingUser);
        if (!userId) throw new Error("ID Invalid");

        await userAPI.update(userId, {
          name: formData.name,
          username: formData.username,
          password: formData.password || undefined,
          role: formData.role,
        });
        toast.success("User berhasil diupdate");
      } else {
        await userAPI.create(formData);
        toast.success("User berhasil ditambahkan");
      }

      setDialogOpen(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      toast.error(editingUser ? "Gagal update" : "Gagal tambah", {
        description: getErrorMessage(error),
      });
    } finally {
      setLoading(false);
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

    setLoading(true);
    try {
      await userAPI.delete(userId);
      toast.success("User berhasil dihapus");
      fetchUsers();
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error) {
      toast.error("Gagal hapus user", { description: getErrorMessage(error) });
    } finally {
      setLoading(false);
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
      <div className="space-y-6 p-4 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              User Management
            </h1>
            <p className="text-muted-foreground mt-2 text-sm md:text-base">
              Kelola user dan hak akses sistem
            </p>
          </div>

          {/* Tombol Tambah User Hanya Untuk Superadmin */}
          {isSuperAdmin && (
            <Button
              onClick={() => {
                setEditingUser(null);
                resetForm();
                setDialogOpen(true);
              }}
              className="w-full md:w-auto"
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Tambah User
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Daftar User</CardTitle>
          </CardHeader>
          <CardContent className="p-0 md:p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Spinner className="h-8 w-8" />
              </div>
            ) : (
              <>
                <UserTable
                  users={users}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  loading={loading}
                />
                <UserMobileCard
                  users={users}
                  onEdit={handleEdit}
                  onDelete={handleDeleteClick}
                  loading={loading}
                />
              </>
            )}
          </CardContent>
        </Card>

        <UserFormDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          editingUser={editingUser}
          formData={formData}
          onFormChange={setFormData}
          onSubmit={handleSubmit}
          loading={loading}
          isSuperAdmin={isSuperAdmin}
        />

        <DeleteUserDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          user={userToDelete}
          onConfirm={handleDeleteConfirm}
          loading={loading}
        />
      </div>
    </AdminGuard>
  );
}
