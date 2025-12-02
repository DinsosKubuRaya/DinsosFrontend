"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SuperiorOrder } from "@/types";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Trash2, Eye } from "lucide-react";
import { superiorOrderAPI } from "@/lib/api";
import { toast } from "sonner";
import Link from "next/link";

interface SuperiorOrderTableProps {
  orders: SuperiorOrder[];
  onRefresh: () => void;
  isStaffView?: boolean;
}

export function SuperiorOrderTable({
  orders,
  onRefresh,
  isStaffView = false,
}: SuperiorOrderTableProps) {
  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin membatalkan perintah ini?")) {
      try {
        await superiorOrderAPI.delete(id);
        toast.success("Perintah berhasil dihapus");
        onRefresh();
      } catch (error) {
        toast.error(
          error instanceof Error ? error.message : "Gagal menghapus data"
        );
      }
    }
  };

  return (
    <div className="rounded-md border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Dokumen</TableHead>
            {/* Admin melihat penerima */}
            {!isStaffView && <TableHead>Penerima (Staff)</TableHead>}
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={isStaffView ? 4 : 5}
                className="h-24 text-center text-muted-foreground"
              >
                {isStaffView
                  ? "Tidak ada perintah masuk."
                  : "Belum ada disposisi yang dibuat."}
              </TableCell>
            </TableRow>
          ) : (
            orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell>
                  {order.created_at
                    ? format(new Date(order.created_at), "dd MMM yyyy, HH:mm", {
                        locale: idLocale,
                      })
                    : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col max-w-[250px]">
                    <span
                      className="font-medium truncate text-foreground"
                      title={order.document?.subject}
                    >
                      {order.document?.subject || "Dokumen tidak ditemukan"}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="outline"
                        className="text-[10px] h-5 px-1.5"
                      >
                        {order.document?.letter_type === "masuk"
                          ? "Masuk"
                          : "Keluar"}
                      </Badge>
                      <span className="text-xs text-muted-foreground truncate">
                        {order.document?.sender}
                      </span>
                    </div>
                  </div>
                </TableCell>

                {!isStaffView && (
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                        {order.user?.name?.substring(0, 2).toUpperCase() ||
                          "??"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">
                          {order.user?.name || "User dihapus"}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          @{order.user?.username || "-"}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                )}

                <TableCell>
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-700 hover:bg-green-200"
                  >
                    Terkirim
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {/* Tombol Lihat (Semua bisa lihat) */}
                    {order.document_id && (
                      <Link href={`/dashboard/documents/${order.document_id}`}>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Lihat Dokumen"
                        >
                          <Eye className="h-4 w-4 text-blue-600" />
                        </Button>
                      </Link>
                    )}

                    {/* Tombol Hapus (Hanya Admin) */}
                    {!isStaffView && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(order.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
