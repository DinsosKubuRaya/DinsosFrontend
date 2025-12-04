"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ActivityLog } from "@/types";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";
import { Clock, User as UserIcon } from "lucide-react";

interface ActivityLogTableProps {
  logs: ActivityLog[];
}

export function ActivityLogTable({ logs }: ActivityLogTableProps) {
  const formatWaktu = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm", {
        locale: id,
      });
    } catch {
      return dateString;
    }
  };

  const getActionColor = (action: string) => {
    const act = action.toLowerCase();
    if (
      act.includes("create") ||
      act.includes("buat") ||
      act.includes("upload")
    )
      return "bg-green-50 text-green-700 border-green-200";
    if (act.includes("update") || act.includes("edit") || act.includes("ubah"))
      return "bg-blue-50 text-blue-700 border-blue-200";
    if (act.includes("delete") || act.includes("hapus"))
      return "bg-red-50 text-red-700 border-red-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <div className="rounded-2xl border border-border/40 bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent border-b border-border/40">
            <TableHead className="w-[180px] pl-6 font-semibold text-muted-foreground">
              Waktu
            </TableHead>
            <TableHead className="w-[200px] font-semibold text-muted-foreground">
              Pengguna
            </TableHead>
            <TableHead className="w-[120px] font-semibold text-muted-foreground">
              Aksi
            </TableHead>
            <TableHead className="font-semibold text-muted-foreground">
              Deskripsi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={4}
                className="h-32 text-center text-muted-foreground"
              >
                Belum ada aktivitas tercatat.
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow
                key={log.id}
                className="hover:bg-muted/40 transition-colors border-b border-border/40 last:border-0"
              >
                <TableCell className="pl-6 whitespace-nowrap text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 opacity-70" />
                    {formatWaktu(log.created_at)}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-muted flex items-center justify-center">
                      <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    </div>
                    <span className="text-sm font-medium text-foreground">
                      {log.user_name}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={`shadow-none font-normal border ${getActionColor(
                      log.action
                    )}`}
                  >
                    {log.action}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-foreground/80 leading-snug py-4">
                  {log.message}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
