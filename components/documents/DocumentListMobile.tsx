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
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Document, DocumentStaff } from "@/types";
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

  const getDetailLink = (doc: Document | DocumentStaff) => {
    let sourceParam = "";
    if (doc.source === "staff" || doc.source === "document_staff") {
      sourceParam = "?source=staff";
    } else if (doc.source === "document") {
      sourceParam = "?source=document";
    }

    const basePath = isMyDocumentPage
      ? "/dashboard/my-document"
      : "/dashboard/documents";
    return `${basePath}/${doc.id}${sourceParam}`;
  };

  const getEditLink = (doc: Document | DocumentStaff) => {
    let sourceParam = "";
    if (doc.source === "staff" || doc.source === "document_staff") {
      sourceParam = "?source=staff";
    } else if (doc.source === "document") {
      sourceParam = "?source=document";
    }

    const basePath = isMyDocumentPage
      ? "/dashboard/my-document"
      : "/dashboard/documents";
    return `${basePath}/${doc.id}/edit${sourceParam}`;
  };

  return (
    <div className="block md:hidden border-t">
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

        return (
          <div
            key={doc.id}
            className={`border-b p-4 grid grid-cols-[1fr_auto] gap-4 ${
              isAdminDoc && showSourceBadge ? "bg-blue-50/30" : ""
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="font-medium line-clamp-2 text-sm">
                  {doc.subject}
                </span>

                {showSourceBadge &&
                  (isAdminDoc ? (
                    <Badge className="bg-blue-600 h-5 px-1.5 text-[10px] flex items-center gap-1 shrink-0 hover:bg-blue-700">
                      <ShieldCheck className="h-3 w-3" /> Admin
                    </Badge>
                  ) : (
                    <Badge
                      variant="outline"
                      className="h-5 px-1.5 text-[10px] flex items-center gap-1 shrink-0 border-gray-400 text-gray-600"
                    >
                      <User className="h-3 w-3" /> Staff
                    </Badge>
                  ))}
              </div>

              <div className="text-xs text-muted-foreground space-y-1">
                <p>
                  <span className="font-medium text-foreground">Pengirim:</span>{" "}
                  {doc.sender}
                </p>
                <div className="flex items-center justify-between">
                  <p className="flex items-center gap-2">
                    <User className="h-3 w-3" />
                    {doc.user?.name || "-"}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock className="h-3 w-3" />
                    {formatDate(doc.created_at)}
                  </p>
                </div>
              </div>
              <Badge
                variant={doc.letter_type === "masuk" ? "default" : "secondary"}
                className="text-[10px]"
              >
                {doc.letter_type}
              </Badge>
            </div>

            <div className="flex flex-col justify-start">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <Link href={getDetailLink(doc)}>
                    <DropdownMenuItem>
                      <Eye className="mr-2 h-4 w-4" /> Lihat / Download
                    </DropdownMenuItem>
                  </Link>

                  {showEdit && (
                    <Link href={getEditLink(doc)}>
                      <DropdownMenuItem>
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                    </Link>
                  )}

                  {showDelete && onDeleteClick && (
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
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
