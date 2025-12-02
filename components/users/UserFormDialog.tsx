import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
import { User } from "@/types";

interface UserFormData {
  name: string;
  username: string;
  password: string;
  role: "admin" | "staff" | "superadmin";
}

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editingUser: User | null;
  formData: UserFormData;
  onFormChange: (data: UserFormData) => void;
  onSubmit: (e: React.FormEvent) => void;
  loading?: boolean;
  isSuperAdmin?: boolean;
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
}: UserFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] md:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {editingUser ? "Edit User" : "Tambah User Baru"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">
              Nama Lengkap <span className="text-destructive">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                onFormChange({ ...formData, name: e.target.value })
              }
              required
              disabled={loading}
              placeholder="Contoh: Budi Santoso"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">
              Username <span className="text-destructive">*</span>
            </Label>
            <Input
              id="username"
              value={formData.username}
              onChange={(e) =>
                onFormChange({ ...formData, username: e.target.value })
              }
              required
              disabled={loading}
              placeholder="username_login"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">
              Password{" "}
              {editingUser && (
                <span className="text-xs text-muted-foreground">
                  (Kosongkan jika tidak diubah)
                </span>
              )}{" "}
              {!editingUser && <span className="text-destructive">*</span>}
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
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role">Role / Jabatan</Label>
            <Select
              value={formData.role}
              onValueChange={(value: "admin" | "staff" | "superadmin") =>
                onFormChange({ ...formData, role: value })
              }
              disabled={loading}
            >
              <SelectTrigger id="role">
                <SelectValue placeholder="Pilih Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="staff">Staff (Pegawai)</SelectItem>
                <SelectItem value="admin">Admin (Administrator)</SelectItem>
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

          <div className="flex flex-col gap-2 pt-4 md:flex-row">
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Spinner className="mr-2 h-4 w-4" />
                  Menyimpan...
                </>
              ) : (
                <>{editingUser ? "Update Data" : "Buat User"}</>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
              className="flex-1 md:flex-none"
            >
              Batal
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
