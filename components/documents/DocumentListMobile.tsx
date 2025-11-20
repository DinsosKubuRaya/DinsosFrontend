"use client";

import Link from "next/link";
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
import { useAuth } from "@/context/AuthContext";
import { getUserId, SharedDocument } from "@/types";

interface DocumentListMobileProps {
  documents: SharedDocument[];
  isAdmin?: boolean;
  formatDate: (date: string) => string;
  onDownload: (doc: SharedDocument) => void;
  onDeleteClick?: (doc: SharedDocument) => void;
  isMyDocumentPage?: boolean;
}

export function DocumentListMobile({
  documents,
  isAdmin = false,
  formatDate,
  onDownload,
  onDeleteClick,
  isMyDocumentPage = false,
}: DocumentListMobileProps) {
  const { user } = useAuth();
  const currentUserId = user ? getUserId(user) : null;

  const getDetailLink = (id: string) =>
    isMyDocumentPage
      ? `/dashboard/my-document/${id}`
      : `/dashboard/documents/${id}`;

  return (
    <div className="block md:hidden border-t">
      {documents.map((doc) => {
        const docUserId = doc.user_id ? String(doc.user_id) : "";
        const isOwner = currentUserId && docUserId === String(currentUserId);

        const showEdit = isMyDocumentPage && (isOwner || isAdmin);
        const canDelete = isAdmin || (isMyDocumentPage && isOwner);
        const showDelete = onDeleteClick && canDelete;

        return (
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
                <p className="flex items-center gap-2">
                  <User className="h-3 w-3" />
                  {doc.user_name || doc.user?.name || "-"}
                </p>
                <p className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  {formatDate(doc.created_at)}
                </p>
              </div>
              <Badge
                variant={doc.letter_type === "masuk" ? "default" : "secondary"}
              >
                {doc.letter_type}
              </Badge>
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
                      <Eye className="mr-2 h-4 w-4" /> Lihat
                    </DropdownMenuItem>
                  </Link>

                  {showEdit && (
                    <Link href={`/dashboard/my-document/${doc.id}/edit`}>
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                    </Link>
                  )}

                  <DropdownMenuItem onClick={() => onDownload(doc)}>
                    <Download className="mr-2 h-4 w-4" /> Download
                  </DropdownMenuItem>

                  {showDelete && onDeleteClick && (
                    <DropdownMenuItem
                      className="text-destructive"
                      onClick={() => onDeleteClick(doc)}
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Hapus
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        );
      })}
    </div>
  );
}
