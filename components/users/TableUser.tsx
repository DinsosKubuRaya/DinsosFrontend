import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Edit,
  Trash2,
  ShieldCheck,
  User as UserIcon,
  ShieldAlert,
} from "lucide-react";
import { User } from "@/types";
import { formatUserDate, getUserId } from "@/lib/userHelpers";

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  loading?: boolean;
  readOnly?: boolean;
}

export function UserTable({
  users,
  onEdit,
  onDelete,
  loading = false,
  readOnly = false,
}: UserTableProps) {
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "superadmin":
        return (
          <Badge className="bg-red-600 hover:bg-red-700">
            <ShieldAlert className="mr-1 h-3 w-3" /> {role}
          </Badge>
        );
      case "admin":
        return (
          <Badge className="bg-blue-600 hover:bg-blue-700">
            <ShieldCheck className="mr-1 h-3 w-3" /> {role}
          </Badge>
        );
      default:
        return (
          <Badge variant="secondary">
            <UserIcon className="mr-1 h-3 w-3" /> {role}
          </Badge>
        );
    }
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
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[50px]">No</TableHead>
            <TableHead className="w-[60px]">Foto</TableHead>
            <TableHead>Nama Lengkap</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Tanggal Dibuat</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Tidak ada data user.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user, index) => {
              const userId = getUserId(user);
              if (!userId) return null;

              return (
                <TableRow key={userId}>
                  <TableCell className="text-muted-foreground">
                    {index + 1}
                  </TableCell>
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      {/* Tampilkan foto jika ada */}
                      <AvatarImage src={user.photo_url || ""} alt={user.name} />
                      <AvatarFallback className="bg-primary/10 text-primary text-xs">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell className="font-mono text-xs">
                    {user.username}
                  </TableCell>
                  <TableCell>{getRoleBadge(user.role)}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatUserDate(user)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onEdit(user)}
                        disabled={loading || readOnly}
                        className={
                          readOnly ? "opacity-50 cursor-not-allowed" : ""
                        }
                        title={readOnly ? "Hanya Superadmin" : "Edit User"}
                      >
                        <Edit className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onDelete(user)}
                        disabled={loading || readOnly}
                        className={
                          readOnly ? "opacity-50 cursor-not-allowed" : ""
                        }
                        title={readOnly ? "Hanya Superadmin" : "Hapus User"}
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}
