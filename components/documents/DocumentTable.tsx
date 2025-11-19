"use client";

import Link from "next/link";
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
import { Eye, Trash2, Download, Pencil } from "lucide-react";

export interface SharedDocument {
  id: string;
  sender: string;
  subject: string;
  file_name: string;
  letter_type: string;
  created_at: string;
  user_name?: string;
  user?: { name: string };
}

interface DocumentTableProps {
  documents: SharedDocument[];
  isAdmin?: boolean;
  formatDate: (date: string) => string;
  onDownload: (doc: SharedDocument) => void;
  onDeleteClick: (doc: SharedDocument) => void;
}

export function DocumentTable({
  documents,
  isAdmin = false,
  formatDate,
  onDownload,
  onDeleteClick,
}: DocumentTableProps) {
  const getDetailLink = (id: string) =>
    isAdmin ? `/dashboard/documents/${id}` : `/dashboard/my-document/${id}`;

  const getEditLink = (id: string) =>
    isAdmin ? "#" : `/dashboard/my-document/${id}/edit`;

  return (
    <div className="hidden md:block overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Pengirim</TableHead>
            <TableHead>Subjek</TableHead>
            <TableHead>Nama File</TableHead>
            <TableHead>Tipe</TableHead>
            {isAdmin && <TableHead>Diupload Oleh</TableHead>}
            <TableHead>Tanggal</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => (
            <TableRow key={doc.id}>
              <TableCell className="font-medium">{doc.sender || "-"}</TableCell>
              <TableCell className="max-w-[200px] truncate" title={doc.subject}>
                {doc.subject || "-"}
              </TableCell>
              <TableCell className="font-mono text-sm max-w-[150px] truncate">
                {doc.file_name?.split("/").pop() || "-"}
              </TableCell>
              <TableCell>
                <Badge
                  variant={
                    doc.letter_type === "masuk" ? "default" : "secondary"
                  }
                  className="capitalize"
                >
                  {doc.letter_type === "masuk" ? "Surat Masuk" : "Surat Keluar"}
                </Badge>
              </TableCell>

              {isAdmin && (
                <TableCell className="text-sm text-muted-foreground">
                  {doc.user_name || doc.user?.name || "-"}
                </TableCell>
              )}

              <TableCell className="text-sm text-muted-foreground">
                {formatDate(doc.created_at || "")}
              </TableCell>

              <TableCell>
                <div className="flex items-center justify-end gap-2">
                  <Link href={getDetailLink(doc.id)}>
                    <Button variant="ghost" size="icon" title="Lihat Detail">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>

                  {!isAdmin && (
                    <Link href={getEditLink(doc.id)}>
                      <Button variant="ghost" size="icon" title="Edit">
                        <Pencil className="h-4 w-4 text-blue-600" />
                      </Button>
                    </Link>
                  )}

                  <Button
                    variant="ghost"
                    size="icon"
                    title="Download"
                    onClick={() => onDownload(doc)}
                  >
                    <Download className="h-4 w-4 text-green-600" />
                  </Button>

                  <Button
                    variant="ghost"
                    size="icon"
                    title="Hapus"
                    onClick={() => onDeleteClick(doc)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
