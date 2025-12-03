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
  User,
  Image as ImageIcon,
  File,
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

  const handleDownload = async (doc: Document | DocumentStaff) => {
    try {
      if (doc.file_url) {
        window.open(doc.file_url, "_blank");
        toast.success("Membuka file...");
        return;
      }

      setDownloading(doc.id);
      await onDownload(doc);
      toast.success("File berhasil diunduh!");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Gagal mengunduh file");
    } finally {
      setDownloading(null);
    }
  };

  // ✅ FIX: Ganti 'any' dengan tipe yang benar
  const isOfficialDoc = (doc: Document | DocumentStaff): doc is Document => {
    return doc.source === "document";
  };

  return (
    <div className="rounded-md border bg-background hidden md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[350px]">Detail Dokumen</TableHead>
            <TableHead>Kategori & Format</TableHead>
            <TableHead>Pemilik / User</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              {/* KOLOM 1: JUDUL, FILE */}
              <TableCell className="align-top py-4">
                <div className="flex flex-col gap-1">
                  <span className="font-semibold text-sm leading-tight text-foreground/90">
                    {doc.subject}
                  </span>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 w-fit px-1.5 py-0.5 rounded">
                    <FileText className="h-3 w-3" />
                    <span
                      className="truncate max-w-[200px]"
                      title={doc.file_name}
                    >
                      {doc.file_name}
                    </span>
                  </div>

                  {/* Cek Sender hanya jika Official Doc */}
                  {isOfficialDoc(doc) && doc.sender && (
                    <div className="text-xs text-blue-600 font-medium mt-1">
                      Dari: {doc.sender}
                    </div>
                  )}
                </div>
              </TableCell>

              {/* KOLOM 2: TIPE & FORMAT */}
              <TableCell className="align-top py-4">
                <div className="flex flex-col gap-2 items-start">
                  {/* Badge Letter Type - Hanya Official Doc */}
                  {isOfficialDoc(doc) && doc.letter_type && (
                    <Badge
                      variant={
                        doc.letter_type === "masuk" ? "default" : "secondary"
                      }
                      className="capitalize"
                    >
                      {doc.letter_type}
                    </Badge>
                  )}

                  <Badge
                    variant="outline"
                    className="text-[10px] gap-1 px-2 h-5"
                  >
                    {doc.resource_type === "image" ? (
                      <ImageIcon className="h-3 w-3" />
                    ) : (
                      <File className="h-3 w-3" />
                    )}
                    {doc.resource_type === "image" ? "Gambar" : "Dokumen"}
                  </Badge>
                </div>
              </TableCell>

              {/* KOLOM 3: USER */}
              <TableCell className="align-top py-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">
                      {doc.user?.name || "User"}
                    </span>
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {doc.user?.role ||
                        (isOfficialDoc(doc) ? "Admin" : "Staff")}
                    </span>
                  </div>
                </div>
              </TableCell>

              {/* KOLOM 4: TANGGAL */}
              <TableCell className="align-top py-4 text-sm">
                {formatDate(doc.created_at)}
              </TableCell>

              {/* KOLOM 5: AKSI */}
              <TableCell className="text-right align-top py-4">
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
                        const sourceParam = isOfficialDoc(doc)
                          ? "?source=document"
                          : "?source=staff";
                        const basePath = isMyDocumentPage
                          ? `/dashboard/my-document`
                          : `/dashboard/documents`;
                        router.push(`${basePath}/${doc.id}${sourceParam}`);
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

                    {(!isOfficialDoc(doc) || isAdmin) && (
                      <>
                        <DropdownMenuItem
                          onClick={() => {
                            if (isAdmin) {
                              const sourceParam = isOfficialDoc(doc)
                                ? "?source=document"
                                : "?source=staff";
                              router.push(
                                `/dashboard/documents/${doc.id}/edit${sourceParam}`
                              );
                            } else {
                              router.push(
                                `/dashboard/my-document/${doc.id}/edit`
                              );
                            }
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
                      </>
                    )}
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
