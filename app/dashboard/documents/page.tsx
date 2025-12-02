"use client";

import { useEffect, useState } from "react";
import { documentAPI, documentStaffAPI } from "@/lib/api"; // Import documentAPI
import { Document, DocumentStaff } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { Upload, FileText, Filter, Archive, Users } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { DocumentListMobile } from "@/components/documents/DocumentListMobile";
import { DocumentFilter } from "@/components/documents/DocumentFilter";
import { getUserId } from "@/lib/userHelpers";
import { Badge } from "@/components/ui/badge";

export default function DocumentsPage() {
  const { user, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<"official" | "staff">("official");

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);

  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    setActiveTab("official");
  }, [user]);

  useEffect(() => {
    if (user || isAdmin) {
      fetchDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, user, isAdmin, activeTab]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params: { search?: string } = {};

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      let allDocs: Document[] = [];

      if (isAdmin) {
        // === LOGIKA ADMIN/SUPERADMIN ===
        if (activeTab === "official") {
          const response = await documentAPI.getAll(params);
          allDocs = (response.documents || []).map((doc) => ({
            ...doc,
            source: "document",
          }));
        } else {
          const staffResponse = await documentStaffAPI.getAll(params);
          allDocs = (staffResponse.documents || []).map((doc: unknown) => ({
            ...(doc as Document),
            source: "staff",
          }));
        }
      } else {
        if (!user) {
          setDocuments([]);
          return;
        }

        const response = await documentStaffAPI.getAll(params);
        let docs = response.documents || [];

        const currentUserId = String(getUserId(user));
        docs = docs.filter((doc) => {
          const docUserId = doc.user_id ? String(doc.user_id) : "";
          return docUserId === currentUserId;
        });

        allDocs = docs.map((doc: unknown) => ({
          ...(doc as Document),
          source: "staff",
        }));
      }

      setDocuments(allDocs);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Gagal memuat dokumen");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const executeDelete = async () => {
    if (!docToDelete) return;
    try {
      if (docToDelete.source === "staff") {
        await documentStaffAPI.delete(docToDelete.id);
      } else {
        await documentAPI.delete(docToDelete.id);
      }

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
      if (doc.source === "staff") {
        await documentStaffAPI.download(doc.id);
      } else {
        await documentAPI.download(doc.id);
      }
      toast.success("Membuka file...");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Gagal membuka file");
    }
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
            {isAdmin
              ? activeTab === "official"
                ? "Arsip Dinas"
                : "Monitoring Staff"
              : "Arsip Dokumen"}
          </h1>
          <p className="text-muted-foreground mt-2">
            {isAdmin
              ? activeTab === "official"
                ? "Kelola surat masuk dan keluar"
                : "Pantau dokumen yang diupload staff"
              : "Kelola dokumen surat staff"}
          </p>
        </div>

        {/* Tombol Upload hanya muncul untuk Admin di tab Official, atau untuk Staff */}
        {isAdmin && activeTab === "official" && (
          <Link href="/dashboard/documents/upload">
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Surat Dinas
            </Button>
          </Link>
        )}
      </div>

      {/* --- TAB NAVIGASI ADMIN/SUPERADMIN --- */}
      {isAdmin && (
        <div className="flex p-1 bg-muted/50 rounded-lg w-full sm:w-fit border mb-4">
          <button
            onClick={() => setActiveTab("official")}
            className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
              activeTab === "official"
                ? "bg-background text-foreground shadow-sm ring-1 ring-black/5"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            <Archive className="h-4 w-4" />
            Arsip Dinas
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className={`flex-1 sm:flex-none px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center justify-center gap-2 ${
              activeTab === "staff"
                ? "bg-background text-blue-600 shadow-sm ring-1 ring-black/5"
                : "text-muted-foreground hover:text-foreground hover:bg-background/50"
            }`}
          >
            <Users className="h-4 w-4" />
            Monitoring Staff
          </button>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentFilter
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Tidak ada dokumen ditemukan</p>
              <p className="text-sm mt-2">
                {isAdmin && activeTab === "official"
                  ? "Klik 'Upload Surat Dinas' untuk mulai pengarsipan"
                  : isAdmin && activeTab === "staff"
                  ? "Belum ada staff yang mengupload dokumen"
                  : "Data kosong"}
              </p>
            </div>
          ) : (
            <div>
              <DocumentTable
                documents={documents}
                isAdmin={isAdmin}
                formatDate={formatDate}
                onDownload={handleDownload}
                onDeleteClick={setDocToDelete}
                isMyDocumentPage={!isAdmin}
                showSourceColumn={activeTab === "staff"}
              />

              <DocumentListMobile
                documents={documents}
                isAdmin={isAdmin}
                formatDate={formatDate}
                onDownload={handleDownload}
                onDeleteClick={setDocToDelete}
                isMyDocumentPage={!isAdmin}
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
              Tindakan ini tidak dapat dibatalkan. Dokumen &quot;
              {docToDelete?.subject}&quot; akan dihapus secara permanen dari
              {docToDelete?.source === "staff"
                ? " arsip staff."
                : " arsip dinas."}
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
