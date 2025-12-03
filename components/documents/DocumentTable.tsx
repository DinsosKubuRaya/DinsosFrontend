"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  MoreHorizontal,
  FileText,
  Download,
  Trash,
  Eye,
  Edit,
} from "lucide-react";
import { Document, DocumentStaff } from "@/types";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useState } from "react";

interface DocumentTableProps {
  documents: (Document | DocumentStaff)[];
  isAdmin: boolean;
  formatDate: (date: string) => string;
  onDownload: (doc: Document | DocumentStaff) => Promise<void>;
  onDeleteClick?: (doc: Document | DocumentStaff) => void;
  isMyDocumentPage?: boolean;
  showSourceColumn?: boolean;
}

export function DocumentTable({
  documents,
  isAdmin,
  formatDate,
  onDownload,
  onDeleteClick,
  isMyDocumentPage = false,
  showSourceColumn = false,
}: DocumentTableProps) {
  const router = useRouter();
  const [downloading, setDownloading] = useState<string | number | null>(null);

  const getBasePath = () => {
    return isAdmin ? `/dashboard/documents` : `/dashboard/my-document`;
  };

  const handleDownload = async (doc: Document | DocumentStaff) => {
    try {
      setDownloading(doc.id);
      await onDownload(doc);
      toast.success("File berhasil diunduh!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Gagal mengunduh file", {
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan",
      });
    } finally {
      setDownloading(null);
    }
  };

  return (
    <div className="rounded-md border bg-background hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pengirim / Judul</TableHead>
            <TableHead>Tipe</TableHead>
            <TableHead>Tanggal</TableHead>
            {showSourceColumn && <TableHead>Sumber</TableHead>}
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell className="font-medium">
                <div className="flex flex-col">
                  <span className="font-semibold">{doc.sender}</span>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <FileText className="h-3 w-3" />
                    <span
                      className="truncate max-w-[200px]"
                      title={doc.subject}
                    >
                      {doc.subject}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    doc.letter_type === "masuk" ? "default" : "secondary"
                  }
                >
                  {doc.letter_type === "masuk" ? "Masuk" : "Keluar"}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(doc.created_at)}</TableCell>

              {showSourceColumn && (
                <TableCell>
                  {doc.source === "staff" || doc.source === "document_staff" ? (
                    <Badge
                      variant="outline"
                      className="text-blue-600 border-blue-200 bg-blue-50"
                    >
                      Staff
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-amber-600 border-amber-200 bg-amber-50"
                    >
                      Dinas
                    </Badge>
                  )}
                </TableCell>
              )}

              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>

                    <DropdownMenuItem
                      onClick={() => {
                        let sourceParam = "";
                        if (
                          doc.source === "staff" ||
                          doc.source === "document_staff"
                        ) {
                          sourceParam = "?source=staff";
                        } else if (doc.source === "document") {
                          sourceParam = "?source=document";
                        }
                        router.push(`${getBasePath()}/${doc.id}${sourceParam}`);
                      }}
                    >
                      <Eye className="mr-2 h-4 w-4" /> Detail
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => handleDownload(doc)}
                      disabled={downloading === doc.id}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      {downloading === doc.id ? "Mengunduh..." : "Unduh"}
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => {
                        let sourceParam = "";
                        if (
                          doc.source === "staff" ||
                          doc.source === "document_staff"
                        ) {
                          sourceParam = "?source=staff";
                        } else if (doc.source === "document") {
                          sourceParam = "?source=document";
                        }

                        router.push(
                          `${getBasePath()}/${doc.id}/edit${sourceParam}`
                        );
                      }}
                    >
                      <Edit className="mr-2 h-4 w-4" /> Edit
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600"
                      onClick={() => onDeleteClick && onDeleteClick(doc)}
                    >
                      <Trash className="mr-2 h-4 w-4" /> Hapus
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
