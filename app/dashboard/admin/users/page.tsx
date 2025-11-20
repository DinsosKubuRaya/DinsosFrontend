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
import { AxiosError } from "axios";
import { getUserId } from "@/lib/userHelpers";

import { UserTable } from "@/components/users/TableUser";
import { UserMobileCard } from "@/components/users/UserMobileCard";
import { UserFormDialog } from "@/components/users/UserFormDialog";
import { DeleteUserDialog } from "@/components/users/DeleteUserDialog";

interface UserUpdateData {
  name: string;
  username: string;
  role: "admin" | "staff";
  password?: string;
}

export default function AdminUsersPage() {
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
    role: "staff" as "admin" | "staff",
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await userAPI.getAll();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
        toast.error("Format data user tidak valid");
      }
    } catch (error: unknown) {
      console.error("Error fetching users:", error);
      if (error instanceof AxiosError && error.response?.status !== 401) {
        const errorMsg = getErrorMessage(error);
        toast.error("Gagal memuat data user", {
          description: errorMsg,
        });
      }
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.username.trim()) {
      toast.error("Nama dan username harus diisi");
      return;
    }

    if (!editingUser && !formData.password.trim()) {
      toast.error("Password harus diisi untuk user baru");
      return;
    }

    setLoading(true);

    try {
      if (editingUser) {
        const userId = getUserId(editingUser);
        if (!userId) {
          throw new Error("User ID tidak valid");
        }

        const updateData: UserUpdateData = {
          name: formData.name.trim(),
          username: formData.username.trim(),
          role: formData.role,
        };

        if (formData.password.trim()) {
          updateData.password = formData.password;
        }

        await userAPI.update(userId.toString(), updateData);
        toast.success("User berhasil diupdate");
      } else {
        await userAPI.create({
          name: formData.name.trim(),
          username: formData.username.trim(),
          password: formData.password,
          role: formData.role,
        });
        toast.success("User berhasil ditambahkan");
      }

      setDialogOpen(false);
      resetForm();
      await fetchUsers();
    } catch (error: unknown) {
      console.error("Error saving user:", error);
      const errorMessage = getErrorMessage(error);
      toast.error(editingUser ? "Gagal update user" : "Gagal menambah user", {
        description: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    const userId = getUserId(user);
    if (!userId) {
      toast.error("ID user tidak valid");
      return;
    }

    setEditingUser(user);
    setFormData({
      name: user.name || "",
      username: user.username || "",
      password: "",
      role: (user.role as "admin" | "staff") || "staff",
    });
    setDialogOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    const userId = getUserId(userToDelete);
    if (!userId) {
      toast.error("ID user tidak valid");
      return;
    }

    setLoading(true);
    try {
      await userAPI.delete(userId.toString());
      toast.success("User berhasil dihapus");
      await fetchUsers();
      setDeleteDialogOpen(false);
      setUserToDelete(null);
    } catch (error: unknown) {
      console.error("Error deleting user:", error);
      const errorMessage = getErrorMessage(error);
      toast.error("Gagal menghapus user", {
        description: errorMessage,
      });
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
            ) : users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground px-4">
                Belum ada user
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
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              resetForm();
            }
          }}
          editingUser={editingUser}
          formData={formData}
          onFormChange={setFormData}
          onSubmit={handleSubmit}
          loading={loading}
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
