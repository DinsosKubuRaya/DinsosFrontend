"use client";

import { useEffect, useState } from "react";
import { documentStaffAPI } from "@/lib/api";
import { Document } from "@/types";
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
import { Upload, FileText, Filter } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { DocumentListMobile } from "@/components/documents/DocumentListMobile";
import { DocumentFilter } from "@/components/documents/DocumentFilter";
import { getUserId } from "@/lib/userHelpers";

export default function DocumentsPage() {
  const { user, isAdmin } = useAuth();
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
    if (user || isAdmin) {
      fetchDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, user, isAdmin]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params: { search?: string } = {};

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      let allDocs: Document[] = [];

      if (isAdmin) {
        try {
          const staffResponse = await documentStaffAPI.getAll(params);
          const staffDocs = (staffResponse.documents || []).map(
            (doc: Document) => ({
              ...doc,
              source: "staff",
            })
          );
          allDocs = [...staffDocs];
        } catch (error) {
          console.error("Error fetching admin documents:", error);
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

        allDocs = docs;
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
      await documentStaffAPI.download(doc.id);
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
            {isAdmin ? "Monitoring Arsip Staff" : "Arsip Dokumen"}
          </h1>
          <p className="text-muted-foreground mt-2">
            Kelola dokumen surat staff
          </p>
        </div>

        {isAdmin && (
          <Link href="/dashboard/documents/upload">
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Dokumen
            </Button>
          </Link>
        )}
      </div>

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
                {isAdmin
                  ? "Belum ada staff yang mengupload dokumen"
                  : "Klik tombol 'Upload Dokumen' untuk menambah"}
              </p>
            </div>
          ) : (
            <div>
              {/* ✅ FIX: Ubah isMyDocumentPage sesuai role */}
              <DocumentTable
                documents={documents}
                isAdmin={isAdmin}
                formatDate={formatDate}
                onDownload={handleDownload}
                onDeleteClick={setDocToDelete}
                isMyDocumentPage={!isAdmin}
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
              {docToDelete?.subject}&quot; akan dihapus secara permanen.
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
