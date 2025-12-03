"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { DocumentFilter } from "@/components/documents/DocumentFilter";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { DocumentListMobile } from "@/components/documents/DocumentListMobile";
import { FileText, Upload, User, ShieldCheck } from "lucide-react";
import { documentStaffAPI, superiorOrderAPI } from "@/lib/api";
import { Document, DocumentStaff } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/context/AuthContext";
import { Badge } from "@/components/ui/badge";
import { getUserId } from "@/lib/userHelpers";

export default function MyDocumentPage() {
  const { user, isAdmin } = useAuth();
  const [allDocuments, setAllDocuments] = useState<Document[]>([]);
  const [activeTab, setActiveTab] = useState<"personal" | "admin">("personal");

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearch(searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    if (user || isAdmin) {
      fetchDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, user, isAdmin]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params: { search?: string } = {};
      if (search) params.search = search;
      const currentUserId = user ? getUserId(user) : "";
      const response = await documentStaffAPI.getAll(params);
      const myDocs: Document[] = (response.documents || [])
        .filter((doc: DocumentStaff) => {
          return String(doc.user_id) === String(currentUserId);
        })
        .map((doc: DocumentStaff) => ({
          ...doc,
          source: "document_staff",
        })) as unknown as Document[];

      let adminDocs: Document[] = [];

      if (!isAdmin && currentUserId) {
        try {
          const orders = await superiorOrderAPI.getAll();

          // Hanya perintah yang ditujukan ke user
          const myOrders = orders.filter(
            (o) => String(o.user_id) === String(currentUserId)
          );

          adminDocs = myOrders
            .map((order): Document | null => {
              if (!order.document) return null;

              return {
                ...order.document,
                source: "document",
                user: {
                  name: "Admin / Atasan",
                  username: "admin",
                  role: "admin",
                },
                created_at: order.created_at,
              } as Document;
            })
            .filter((doc): doc is Document => doc !== null);
        } catch (err) {
          console.error("Gagal memuat surat masuk:", err);
        }
      }

      setAllDocuments([...myDocs, ...adminDocs]);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Gagal memuat dokumen");
      setAllDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const personalDocuments = allDocuments.filter(
    (doc) => doc.source === "document_staff"
  );

  const adminDocuments = allDocuments.filter(
    (doc) => doc.source === "document"
  );

  const displayedDocuments =
    activeTab === "personal" ? personalDocuments : adminDocuments;

  const executeDelete = async () => {
    if (!docToDelete) return;

    // ✅ Cek apakah dokumen ini milik staff (hanya dokumen staff yang bisa dihapus)
    if (docToDelete.source !== "document_staff") {
      toast.error("Anda tidak dapat menghapus dokumen dari admin");
      setDocToDelete(null);
      return;
    }

    try {
      await documentStaffAPI.delete(docToDelete.id);
      toast.success("Dokumen berhasil dihapus");
      fetchDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Gagal menghapus dokumen");
    } finally {
      setDocToDelete(null);
    }
  };

  const handleDownload = async (doc: Document) => {
    try {
      if (doc.source === "document") {
        window.open(doc.file_url, "_blank");
      } else {
        // Dokumen staff gunakan endpoint download staff
        await documentStaffAPI.download(doc.id);
      }
      toast.success("Membuka file...");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Gagal membuka file");
    }
  };

  // ✅ Handler delete yang cek apakah dokumen bisa dihapus
  const handleDeleteClick = (doc: Document) => {
    // Jika di tab "admin" (dokumen dari admin), tidak bisa dihapus oleh staff
    if (!isAdmin && doc.source === "document") {
      toast.error("Anda tidak dapat menghapus dokumen dari admin");
      return;
    }
    setDocToDelete(doc);
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isAdmin ? "Monitoring Arsip Staff" : "Arsip Dokumen"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isAdmin
              ? "Kelola dokumen yang diupload oleh staff"
              : "Kelola dokumen pribadi dan dokumen masuk dari admin"}
          </p>
        </div>

        {/* Tombol Upload hanya muncul di tab personal atau jika Admin */}
        {(activeTab === "personal" || isAdmin) && (
          <Link href="/dashboard/my-document/upload">
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Dokumen
            </Button>
          </Link>
        )}
      </div>

      {/* --- TAB NAVIGASI (Hanya Staff) --- */}
      {!isAdmin && (
        <div className="flex p-1 bg-muted/50 rounded-lg w-full sm:w-fit border">
          <button
            onClick={() => setActiveTab("personal")}
            className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
              activeTab === "personal"
                ? "bg-background text-foreground shadow-sm ring-1 ring-black/5"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            <User className="h-4 w-4" />
            Dokumen Saya
            <Badge
              variant="secondary"
              className="ml-1 h-5 px-1.5 text-[10px] min-w-5 justify-center"
            >
              {personalDocuments.length}
            </Badge>
          </button>
          <button
            onClick={() => setActiveTab("admin")}
            className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
              activeTab === "admin"
                ? "bg-background text-blue-600 shadow-sm ring-1 ring-black/5"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            Masuk (Admin)
            <Badge
              variant="secondary"
              className="ml-1 h-5 px-1.5 text-[10px] min-w-5 justify-center bg-blue-100 text-blue-700 hover:bg-blue-200"
            >
              {adminDocuments.length}
            </Badge>
          </button>
        </div>
      )}

      <DocumentFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : displayedDocuments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p className="font-medium">Tidak ada dokumen</p>
              <p className="text-sm mt-1">
                {activeTab === "personal"
                  ? "Anda belum mengupload dokumen apapun."
                  : "Belum ada dokumen yang didisposisikan kepada Anda."}
              </p>
            </div>
          ) : (
            <div>
              <DocumentTable
                documents={displayedDocuments}
                isAdmin={isAdmin}
                formatDate={formatDate}
                onDownload={handleDownload}
                onDeleteClick={handleDeleteClick}
                isMyDocumentPage={true}
                showSourceColumn={isAdmin}
              />

              <DocumentListMobile
                documents={displayedDocuments}
                isAdmin={isAdmin}
                formatDate={formatDate}
                onDownload={handleDownload}
                onDeleteClick={handleDeleteClick}
                isMyDocumentPage={true}
                showSourceBadge={isAdmin}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={!!docToDelete}
        onOpenChange={(open) => {
          if (!open) setDocToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Anda yakin ingin menghapus?</AlertDialogTitle>
            <AlertDialogDescription>
              Dokumen{" "}
              <span className="font-bold text-foreground">
                {docToDelete?.subject}
              </span>{" "}
              akan dihapus secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90"
              onClick={executeDelete}
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
