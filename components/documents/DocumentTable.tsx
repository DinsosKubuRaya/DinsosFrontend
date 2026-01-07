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
  User as UserIcon,
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
      toast.error("Gagal mengunduh file");
    } finally {
      setDownloading(null);
    }
  };

  const isOfficialDoc = (doc: Document | DocumentStaff): doc is Document => {
    return doc.source === "document";
  };

  return (
    <div className="hidden md:block rounded-2xl border border-border/50 bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/40">
          <TableRow className="hover:bg-transparent border-b border-border/50">
            <TableHead className="w-full md:w-[350px] lg:w-[400px] pl-6 font-semibold">
              Detail Dokumen
            </TableHead>
            <TableHead className="font-semibold">Kategori</TableHead>
            <TableHead className="font-semibold">Pemilik</TableHead>
            <TableHead className="font-semibold">Tanggal</TableHead>
            <TableHead className="text-right pr-6 font-semibold">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow
              key={doc.id}
              className="group hover:bg-muted/30 transition-colors border-b border-border/40 last:border-0 cursor-default"
            >
              {/* Kolom 1: Detail */}
              <TableCell className="pl-6 py-4 align-top">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg mt-0.5 ${
                      doc.resource_type === "image"
                        ? "bg-purple-50 text-purple-600"
                        : "bg-blue-50 text-blue-600"
                    }`}
                  >
                    {doc.resource_type === "image" ? (
                      <ImageIcon className="h-4 w-4" />
                    ) : (
                      <File className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-semibold text-foreground text-sm leading-snug group-hover:text-primary transition-colors">
                      {doc.subject}
                    </span>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <span className="bg-muted px-1.5 py-0.5 rounded truncate max-w-[120px] md:max-w-[150px] lg:max-w-[180px]">
                        {doc.file_name}
                      </span>
                    </div>
                    {isOfficialDoc(doc) && doc.sender && (
                      <span className="text-[11px] text-primary/80 font-medium mt-0.5">
                        Dari: {doc.sender}
                      </span>
                    )}
                  </div>
                </div>
              </TableCell>

              {/* Kolom 2: Kategori */}
              <TableCell className="align-top py-4">
                <div className="flex flex-col gap-1.5 items-start">
                  {isOfficialDoc(doc) && doc.letter_type && (
                    <Badge
                      variant={
                        doc.letter_type === "masuk" ? "secondary" : "outline"
                      }
                      className="capitalize font-medium shadow-none"
                    >
                      {doc.letter_type}
                    </Badge>
                  )}
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wide px-1">
                    {doc.resource_type}
                  </span>
                </div>
              </TableCell>

              {/* Kolom 3: Pemilik */}
              <TableCell className="align-top py-4">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground border border-border">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-foreground">
                      {doc.user?.name || "User"}
                    </span>
                    <span className="text-[10px] text-muted-foreground capitalize">
                      {doc.user?.role === "staff"
                        ? "User"
                        : doc.user?.role ||
                          (isOfficialDoc(doc) ? "Admin" : "User")}
                    </span>
                  </div>
                </div>
              </TableCell>

              {/* Kolom 4: Tanggal */}
              <TableCell className="align-top py-4 text-sm text-muted-foreground">
                {formatDate(doc.created_at)}
              </TableCell>

              {/* Kolom 5: Aksi */}
              <TableCell className="text-right pr-6 align-top py-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground"
                    >
                      <span className="sr-only">Menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 rounded-xl shadow-lg border-border/60"
                  >
                    <DropdownMenuLabel className="text-xs font-normal text-muted-foreground ml-1">
                      Aksi Dokumen
                    </DropdownMenuLabel>

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
                      className="gap-2 cursor-pointer rounded-lg focus:bg-primary/5 focus:text-primary"
                    >
                      <Eye className="h-4 w-4" /> Detail
                    </DropdownMenuItem>

                    <DropdownMenuItem
                      onClick={() => handleDownload(doc)}
                      disabled={downloading === doc.id}
                      className="gap-2 cursor-pointer rounded-lg focus:bg-primary/5 focus:text-primary"
                    >
                      <Download className="h-4 w-4" />
                      {downloading === doc.id ? "Mengunduh..." : "Unduh"}
                    </DropdownMenuItem>

                    {/* Menu Edit & Hapus (Hanya jika berhak) */}
                    {(!isOfficialDoc(doc) || isAdmin) && (
                      <>
                        <div className="h-px bg-border/50 my-1" />
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
                          className="gap-2 cursor-pointer rounded-lg focus:bg-primary/5 focus:text-primary"
                        >
                          <Edit className="h-4 w-4" /> Edit
                        </DropdownMenuItem>

                        <DropdownMenuItem
                          className="gap-2 cursor-pointer rounded-lg text-destructive focus:text-destructive focus:bg-destructive/10"
                          onClick={() => onDeleteClick && onDeleteClick(doc)}
                        >
                          <Trash className="h-4 w-4" /> Hapus
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
