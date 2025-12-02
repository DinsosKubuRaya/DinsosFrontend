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
import { Eye, Download, Trash2, ShieldCheck, User } from "lucide-react";
import { Document } from "@/types";
import Link from "next/link";

interface DocumentTableProps {
  documents: Document[];
  isAdmin: boolean;
  formatDate: (date: string) => string;
  onDownload: (doc: Document) => void;
  onDeleteClick?: (doc: Document) => void;
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
  const getLetterTypeBadge = (type: string) => {
    if (!type) return <span className="text-muted-foreground">-</span>;

    return type === "keluar" ? (
      <Badge
        variant="secondary"
        className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200"
      >
        Keluar
      </Badge>
    ) : (
      <Badge variant="default" className="bg-green-600 hover:bg-green-700">
        Masuk
      </Badge>
    );
  };

  return (
    <div className="rounded-md border bg-card overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="w-[50px] text-center">No</TableHead>
            <TableHead>Perihal / Subjek</TableHead>

            {/* TIPE SURAT & PENGIRIM: HANYA ADMIN (Karena tabel Staff tidak punya kolom ini) */}
            {isAdmin && <TableHead className="w-[120px]">Tipe Surat</TableHead>}
            {isAdmin && <TableHead>Pengirim</TableHead>}

            {showSourceColumn && (
              <TableHead className="w-[100px]">Sumber</TableHead>
            )}

            <TableHead className="w-[150px]">Tanggal</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {documents.map((doc, index) => (
            <TableRow key={doc.id} className="hover:bg-muted/5">
              <TableCell className="text-center text-muted-foreground">
                {index + 1}
              </TableCell>
              <TableCell className="font-medium">
                <div className="flex flex-col max-w-[300px]">
                  <span className="truncate font-semibold text-foreground">
                    {doc.subject}
                  </span>
                  <span className="text-xs text-muted-foreground truncate">
                    {doc.file_name?.split("/").pop()}
                  </span>
                </div>
              </TableCell>

              {/* LOGIKA KOLOM KHUSUS ADMIN */}
              {isAdmin && (
                <>
                  <TableCell>
                    {/* Jika dokumen staff tidak punya letter_type, tampilkan - */}
                    {doc.letter_type
                      ? getLetterTypeBadge(doc.letter_type)
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{doc.sender || "-"}</div>
                  </TableCell>
                </>
              )}

              {showSourceColumn && (
                <TableCell>
                  {doc.source === "document" ? (
                    <Badge
                      variant="outline"
                      className="text-[10px] gap-1 bg-blue-50 text-blue-700 border-blue-200"
                    >
                      <ShieldCheck className="h-3 w-3" /> Admin
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="text-[10px] gap-1 bg-slate-50 text-slate-700"
                    >
                      <User className="h-3 w-3" /> Staff
                    </Badge>
                  )}
                </TableCell>
              )}

              <TableCell className="text-sm text-muted-foreground">
                {formatDate(doc.created_at)}
              </TableCell>

              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Link
                    href={`/dashboard/${
                      isMyDocumentPage ? "my-document" : "documents"
                    }/${doc.id}`}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>

                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-slate-600 hover:text-slate-700"
                    onClick={() => onDownload(doc)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>

                  {(isAdmin || isMyDocumentPage) && onDeleteClick && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => onDeleteClick(doc)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
