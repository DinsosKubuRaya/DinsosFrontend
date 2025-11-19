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

interface ActivityLogTableProps {
  logs: ActivityLog[];
}

export function ActivityLogTable({ logs }: ActivityLogTableProps) {
  const formatWaktu = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMMM yyyy, HH:mm:ss", {
        locale: id,
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Waktu</TableHead>
            <TableHead>Pengguna</TableHead>
            <TableHead>Aksi</TableHead>
            <TableHead>Deskripsi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center">
                Belum ada aktivitas.
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="whitespace-nowrap">
                  {formatWaktu(log.created_at)}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{log.user_name}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{log.action}</Badge>
                </TableCell>
                <TableCell>{log.message}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
