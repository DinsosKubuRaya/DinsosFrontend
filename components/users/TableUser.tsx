"use client";

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
  MoreHorizontal,
} from "lucide-react";
import { User } from "@/types";
import { formatUserDate, getUserId } from "@/lib/userHelpers";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  // Style Badge ala Google Chips (Pastel background, dark text)
  const getRoleBadge = (role: string) => {
    switch (role) {
      case "superadmin":
        return (
          <Badge className="bg-red-50 text-red-700 hover:bg-red-100 border border-red-200 shadow-none font-medium px-2 py-0.5 rounded-full">
            <ShieldAlert className="mr-1.5 h-3 w-3" />
            Super Admin
          </Badge>
        );
      case "admin":
        return (
          <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 shadow-none font-medium px-2 py-0.5 rounded-full">
            <ShieldCheck className="mr-1.5 h-3 w-3" />
            Admin
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-slate-50 text-slate-600 border-slate-200 shadow-none font-medium px-2 py-0.5 rounded-full"
          >
            <UserIcon className="mr-1.5 h-3 w-3" />
            Staff
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
    <div className="hidden md:block rounded-2xl border border-border/40 bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent border-b border-border/40">
            <TableHead className="w-[40px] md:w-[50px] pl-6 font-semibold text-muted-foreground">
              #
            </TableHead>
            <TableHead className="font-semibold text-muted-foreground">
              User
            </TableHead>
            <TableHead className="font-semibold text-muted-foreground">
              Role
            </TableHead>
            <TableHead className="font-semibold text-muted-foreground">
              Tanggal Dibuat
            </TableHead>
            <TableHead className="text-right pr-6 font-semibold text-muted-foreground">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="h-32 text-center text-muted-foreground"
              >
                Tidak ada data user.
              </TableCell>
            </TableRow>
          ) : (
            users.map((user, index) => {
              const userId = getUserId(user);
              if (!userId) return null;

              return (
                <TableRow
                  key={userId}
                  className="group hover:bg-muted/40 transition-colors border-b border-border/40 last:border-0"
                >
                  <TableCell className="pl-6 text-muted-foreground font-medium text-xs">
                    {index + 1}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9 border border-border">
                        <AvatarImage
                          src={user.photo_url || ""}
                          alt={user.name}
                        />
                        <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                          {getInitials(user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-foreground">
                          {user.name}
                        </span>
                        <span className="text-xs text-muted-foreground font-normal">
                          @{user.username}
                        </span>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>{getRoleBadge(user.role)}</TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {formatUserDate(user)}
                  </TableCell>

                  <TableCell className="text-right pr-6">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          disabled={loading || readOnly}
                          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <span className="sr-only">Menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="w-40 rounded-xl shadow-lg border-border/60"
                      >
                        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
                          Tindakan
                        </DropdownMenuLabel>
                        <DropdownMenuItem
                          onClick={() => onEdit(user)}
                          className="gap-2 cursor-pointer rounded-lg focus:bg-primary/10 focus:text-primary"
                        >
                          <Edit className="h-3.5 w-3.5" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDelete(user)}
                          className="gap-2 cursor-pointer rounded-lg text-red-600 focus:text-red-600 focus:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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
