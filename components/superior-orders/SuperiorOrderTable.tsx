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
import { Trash2 } from "lucide-react";
import { superiorOrderAPI } from "@/lib/api";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface SuperiorOrderTableProps {
  orders: SuperiorOrder[];
  onRefresh: () => void;
}

export function SuperiorOrderTable({
  orders,
  onRefresh,
}: SuperiorOrderTableProps) {
  const router = useRouter();

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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Dokumen</TableHead>
            <TableHead>Penerima (Staff)</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                Belum ada data disposisi.
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
                  <div className="flex flex-col">
                    <span className="font-medium truncate max-w-[200px]">
                      {order.document?.subject || "Dokumen tidak ditemukan"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {order.document?.letter_type === "masuk"
                        ? "Surat Masuk"
                        : "Surat Keluar"}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                      {order.user?.name?.substring(0, 2).toUpperCase()}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {order.user?.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        @{order.user?.username}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className="bg-green-50 text-green-700 border-green-200"
                  >
                    Terkirim
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => handleDelete(order.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
