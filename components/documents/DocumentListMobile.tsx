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
  Pencil,
  MoreVertical,
  Clock,
  User,
  ShieldCheck,
  FileText,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Document, DocumentStaff } from "@/types";
import { Card, CardContent } from "@/components/ui/card";

interface UserWithId {
  id?: string;
  ID?: string;
}
function getUserId(user: UserWithId): string {
  return user?.ID || user?.id || "";
}

interface DocumentListMobileProps {
  documents: (Document | DocumentStaff)[];
  isAdmin?: boolean;
  formatDate: (date: string) => string;
  onDownload?: (doc: Document | DocumentStaff) => void;
  onDeleteClick?: (doc: Document | DocumentStaff) => void;
  isMyDocumentPage?: boolean;
  showSourceBadge?: boolean;
}

export function DocumentListMobile({
  documents,
  isAdmin = false,
  formatDate,
  onDeleteClick,
  isMyDocumentPage = false,
  showSourceBadge = false,
}: DocumentListMobileProps) {
  const { user } = useAuth();
  const currentUserId = user ? getUserId(user as UserWithId) : null;

  return (
    <div className="md:hidden space-y-3 pb-20">
      {" "}
      {documents.map((doc) => {
        const docUserId = doc.user_id ? String(doc.user_id) : "";
        const isOwner = currentUserId && docUserId === String(currentUserId);
        const isAdminDoc = doc.source === "document";
        const showEdit = isAdmin
          ? true
          : isMyDocumentPage && isOwner && !isAdminDoc;
        const showDelete = isAdmin
          ? true
          : isMyDocumentPage && isOwner && !isAdminDoc;

        const sourceParam = isAdminDoc ? "?source=document" : "?source=staff";
        const basePath = isMyDocumentPage
          ? "/dashboard/my-document"
          : "/dashboard/documents";
        const detailLink = `${basePath}/${doc.id}${sourceParam}`;
        const editLink = `${basePath}/${doc.id}/edit${sourceParam}`;

        return (
          <Card
            key={doc.id}
            className="border border-border/60 shadow-sm rounded-xl overflow-hidden active:scale-[0.99] transition-transform"
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm line-clamp-2 leading-tight">
                      {doc.subject}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
                      {doc.file_name}
                    </p>
                  </div>
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 -mr-2 text-muted-foreground"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl">
                    <Link href={detailLink}>
                      <DropdownMenuItem className="gap-2 p-3">
                        <Eye className="h-4 w-4" /> Lihat Detail
                      </DropdownMenuItem>
                    </Link>
                    {showEdit && (
                      <Link href={editLink}>
                        <DropdownMenuItem className="gap-2 p-3">
                          <Pencil className="h-4 w-4" /> Edit
                        </DropdownMenuItem>
                      </Link>
                    )}
                    {showDelete && onDeleteClick && (
                      <DropdownMenuItem
                        className="gap-2 p-3 text-destructive"
                        onClick={() => onDeleteClick(doc)}
                      >
                        <Trash2 className="h-4 w-4" /> Hapus
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border/40">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <User className="h-3 w-3" />
                  <span className="truncate max-w-[120px]">
                    {doc.user?.name || "User"}
                  </span>
                </div>

                {showSourceBadge && isAdminDoc && (
                  <Badge
                    variant="secondary"
                    className="h-5 px-1.5 text-[10px] bg-blue-50 text-blue-700 hover:bg-blue-100"
                  >
                    <ShieldCheck className="h-3 w-3 mr-1" /> Admin
                  </Badge>
                )}

                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatDate(doc.created_at)}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
