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
import {
  Eye,
  Trash2,
  Pencil,
  ShieldCheck,
  User as UserIcon,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getUserId, SharedDocument } from "@/types";

interface DocumentTableProps {
  documents: SharedDocument[];
  isAdmin?: boolean;
  formatDate: (date: string) => string;
  onDownload?: (doc: SharedDocument) => void;
  onDeleteClick?: (doc: SharedDocument) => void;
  isMyDocumentPage?: boolean;
  showSourceColumn?: boolean;
}

export function DocumentTable({
  documents,
  isAdmin = false,
  formatDate,
  onDeleteClick,
  isMyDocumentPage = false,
  showSourceColumn = true,
}: DocumentTableProps) {
  const { user } = useAuth();
  const currentUserId = user ? getUserId(user) : null;

  const getDetailLink = (id: string) =>
    isMyDocumentPage
      ? `/dashboard/my-document/${id}`
      : `/dashboard/documents/${id}`;

  return (
    <div className="hidden md:block overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            {showSourceColumn && (
              <TableHead className="w-[100px]">Sumber</TableHead>
            )}

            <TableHead>Subjek</TableHead>
            <TableHead>Nama File</TableHead>
            <TableHead>Tipe</TableHead>
            <TableHead>Diupload Oleh</TableHead>
            <TableHead>Tanggal</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc) => {
            const docUserId = doc.user_id ? String(doc.user_id) : "";
            const isOwner =
              currentUserId && docUserId === String(currentUserId);
            const isAdminDoc = doc.source === "document";
            const showEdit = isAdmin
              ? true
              : isMyDocumentPage && isOwner && !isAdminDoc;

            const showDelete = isAdmin
              ? true
              : isMyDocumentPage && isOwner && !isAdminDoc;

            const displayFileName = doc.file_name
              ? doc.file_name.split("/").pop()
              : "-";

            return (
              <TableRow
                key={doc.id}
                className={
                  isAdminDoc && showSourceColumn
                    ? "bg-blue-50/40 hover:bg-blue-50/60"
                    : ""
                }
              >
                {/* Kolom Sumber */}
                {showSourceColumn && (
                  <TableCell>
                    {isAdminDoc ? (
                      <Badge className="bg-blue-600 hover:bg-blue-700 flex w-fit items-center gap-1">
                        <ShieldCheck className="h-3 w-3" /> Admin
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-gray-600 flex w-fit items-center gap-1 border-gray-400"
                      >
                        <UserIcon className="h-3 w-3" /> Staff
                      </Badge>
                    )}
                  </TableCell>
                )}

                <TableCell className="font-medium max-w-[250px]">
                  <div
                    className="truncate text-sm font-semibold"
                    title={doc.subject}
                  >
                    {doc.subject}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1 truncate">
                    Pengirim: {doc.sender}
                  </div>
                </TableCell>
                <TableCell
                  className="font-mono text-xs max-w-[150px] truncate text-muted-foreground"
                  title={displayFileName}
                >
                  {displayFileName}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      doc.letter_type === "masuk" ? "default" : "secondary"
                    }
                    className="capitalize"
                  >
                    {doc.letter_type}
                  </Badge>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {doc.user_name || doc.user?.name || "-"}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatDate(doc.created_at)}
                </TableCell>
                <TableCell>
                  <div className="flex items-center justify-end gap-2">
                    <Link href={getDetailLink(doc.id)}>
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Lihat / Download"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>

                    {showEdit && (
                      <Link href={`/dashboard/my-document/${doc.id}/edit`}>
                        <Button variant="ghost" size="icon" title="Edit">
                          <Pencil className="h-4 w-4 text-blue-600" />
                        </Button>
                      </Link>
                    )}

                    {showDelete && onDeleteClick && (
                      <Button
                        variant="ghost"
                        size="icon"
                        title="Hapus"
                        onClick={() => onDeleteClick(doc)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
