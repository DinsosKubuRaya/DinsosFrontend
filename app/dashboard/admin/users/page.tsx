"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { userAPI } from "@/lib/api";
import { User } from "@/types";
import { UserTable } from "@/components/users/TableUser";
import { UserFormDialog } from "@/components/users/UserFormDialog";
import { DeleteUserDialog } from "@/components/users/DeleteUserDialog";
import { Button } from "@/components/ui/button";
import { Plus, Users, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AdminGuard } from "@/components/ui/admin/admin-guard";

export default function AdminUsersPage() {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // Form Data State
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    role: "staff" as "admin" | "staff" | "superadmin",
  });

  const isSuperAdmin = currentUser?.role === "superadmin";

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userAPI.getAll();
      setUsers(data);
    } catch (error) {
      toast.error("Gagal memuat data user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreate = () => {
    setEditingUser(null);
    setFormData({ name: "", username: "", password: "", role: "staff" });
    setIsFormOpen(true);
  };

  const handleEdit = (user: User) => {
    if (!isSuperAdmin && user.id !== currentUser?.id) {
      toast.error("Hanya Superadmin yang dapat mengubah data user lain.");
      return;
    }
    setEditingUser(user);
    setFormData({
      name: user.name,
      username: user.username,
      password: "",
      role: user.role as "admin" | "staff" | "superadmin",
    });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (user: User) => {
    if (!isSuperAdmin) {
      toast.error("Akses Ditolak: Hanya Superadmin yang dapat menghapus user.");
      return;
    }
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      // Validasi dasar
      if (!formData.name || !formData.username) {
        throw new Error("Nama dan Username wajib diisi");
      }
      if (!editingUser && !formData.password) {
        throw new Error("Password wajib diisi untuk user baru");
      }

      if (editingUser && editingUser.id) {
        // Mode Edit
        await userAPI.update(editingUser.id, formData);
        toast.success("User berhasil diperbarui");
      } else {
        // Mode Create
        await userAPI.create({
          name: formData.name,
          username: formData.username,
          password: formData.password,
          role: formData.role,
        });
        toast.success("User berhasil dibuat");
      }
      setIsFormOpen(false);
      fetchUsers();
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Terjadi kesalahan";
      toast.error(msg);
    } finally {
      setFormLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete || !userToDelete.id) return;
    setFormLoading(true);
    try {
      await userAPI.delete(userToDelete.id);
      toast.success("User berhasil dihapus");
      setIsDeleteDialogOpen(false);
      fetchUsers();
    } catch (error: unknown) {
      toast.error("Gagal menghapus user");
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <AdminGuard>
      <div className="space-y-6 p-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Kelola Pengguna
            </h1>
            <p className="text-muted-foreground">
              Daftar semua pengguna yang memiliki akses ke sistem.
            </p>
          </div>

          {isSuperAdmin && (
            <Button onClick={handleCreate} className="gap-2 w-full md:w-auto">
              <Plus className="h-4 w-4" />
              Tambah User
            </Button>
          )}
        </div>

        {!isSuperAdmin && (
          <Alert className="bg-yellow-50 border-yellow-200">
            <ShieldAlert className="h-4 w-4 text-yellow-600" />
            <AlertTitle className="text-yellow-800 font-semibold">
              Akses Terbatas
            </AlertTitle>
            <AlertDescription className="text-yellow-700 text-sm">
              Anda login sebagai <b>Admin</b>. Anda dapat melihat daftar user,
              namun hanya <b>Superadmin</b> yang dapat menambah atau menghapus
              user.
            </AlertDescription>
          </Alert>
        )}

        <div className="bg-card rounded-lg border shadow-sm">
          {loading ? (
            <div className="flex h-64 items-center justify-center">
              <Spinner className="h-8 w-8 text-primary" />
            </div>
          ) : (
            <UserTable
              users={users}
              onEdit={handleEdit}
              onDelete={handleDeleteClick}
              // Prop ini opsional di UserTable, tapi jika ada logic readOnly bisa dipakai
              // readOnly={!isSuperAdmin}
            />
          )}
        </div>

        <UserFormDialog
          open={isFormOpen}
          onOpenChange={setIsFormOpen}
          editingUser={editingUser}
          formData={formData}
          onFormChange={setFormData}
          onSubmit={handleSubmit}
          loading={formLoading}
          isSuperAdmin={isSuperAdmin}
        />

        <DeleteUserDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          loading={formLoading}
          // PERBAIKAN: Pass object 'user' bukan 'username'
          user={userToDelete}
        />
      </div>
    </AdminGuard>
  );
}
