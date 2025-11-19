"use client";

import Link from "next/link";
// Import SharedDocument dari file Table agar konsisten
import { SharedDocument } from "./DocumentTable";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Eye,
  Trash2,
  Download,
  Pencil,
  MoreVertical,
  Clock,
  User,
} from "lucide-react";

interface DocumentListMobileProps {
  documents: SharedDocument[];
  isAdmin?: boolean;
  formatDate: (date: string) => string;
  onDownload: (doc: SharedDocument) => void;
  onDeleteClick: (doc: SharedDocument) => void;
}

export function DocumentListMobile({
  documents,
  isAdmin = false,
  formatDate,
  onDownload,
  onDeleteClick,
}: DocumentListMobileProps) {
  const getDetailLink = (id: string) =>
    isAdmin ? `/dashboard/documents/${id}` : `/dashboard/my-document/${id}`;

  return (
    <div className="block md:hidden border-t">
      {documents.map((doc) => (
        <div
          key={doc.id}
          className="border-b p-4 grid grid-cols-[1fr_auto] gap-4"
        >
          <div className="space-y-2">
            <span className="font-medium line-clamp-2">{doc.subject}</span>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>
                <span className="font-medium text-foreground">Pengirim:</span>{" "}
                {doc.sender}
              </p>

              {isAdmin && (
                <p className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  {doc.user_name || doc.user?.name || "-"}
                </p>
              )}

              <p className="flex items-center gap-2">
                <Clock className="h-3 w-3" />
                {formatDate(doc.created_at)}
              </p>
            </div>
            <div>
              <Badge
                variant={doc.letter_type === "masuk" ? "default" : "secondary"}
                className="capitalize"
              >
                {doc.letter_type === "masuk" ? "Surat Masuk" : "Surat Keluar"}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col justify-start">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <Link href={getDetailLink(doc.id)}>
                  <DropdownMenuItem>
                    <Eye className="mr-2 h-4 w-4" />
                    Lihat Detail
                  </DropdownMenuItem>
                </Link>

                {!isAdmin && (
                  <Link href={`/dashboard/my-document/${doc.id}/edit`}>
                    <DropdownMenuItem>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  </Link>
                )}

                <DropdownMenuItem onClick={() => onDownload(doc)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => onDeleteClick(doc)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      ))}
    </div>
  );
}
