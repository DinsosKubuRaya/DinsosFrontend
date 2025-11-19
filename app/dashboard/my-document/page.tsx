"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { DocumentFilter } from "@/components/documents/DocumentFilter";
import {
  DocumentTable,
  SharedDocument,
} from "@/components/documents/DocumentTable";
import { DocumentListMobile } from "@/components/documents/DocumentListMobile";
import { FileText, Upload } from "lucide-react";
import { documentStaffAPI } from "@/lib/api";
import { DocumentStaff } from "@/types";
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

export default function MyDocumentPage() {
  const [documents, setDocuments] = useState<DocumentStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [docToDelete, setDocToDelete] = useState<DocumentStaff | null>(null);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setSearch(searchTerm);
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params: { search?: string } = {};
      if (search) params.search = search;

      const response = await documentStaffAPI.getAll(params);
      setDocuments(response.documents || []);
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

  const handleDownload = async (doc: SharedDocument) => {
    try {
      await documentStaffAPI.download(doc.id);
      toast.success("Membuka file...");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Gagal membuka file");
    }
  };

  const handleDeleteClick = (doc: SharedDocument) => {
    setDocToDelete(doc as unknown as DocumentStaff);
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

  const sharedDocs = documents as unknown as SharedDocument[];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Arsip Staff</h1>
          <p className="text-muted-foreground mt-2">
            Kelola dokumen surat staff
          </p>
        </div>
        <Link href="/dashboard/my-document/upload">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Dokumen
          </Button>
        </Link>
      </div>

      <DocumentFilter searchTerm={searchTerm} setSearchTerm={setSearchTerm} />

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Belum ada dokumen yang diupload</p>
            </div>
          ) : (
            <div>
              <DocumentTable
                documents={sharedDocs}
                formatDate={formatDate}
                onDownload={handleDownload}
                onDeleteClick={handleDeleteClick}
              />

              <DocumentListMobile
                documents={sharedDocs}
                formatDate={formatDate}
                onDownload={handleDownload}
                onDeleteClick={handleDeleteClick}
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
              Dokumen <span className="font-bold">{docToDelete?.subject}</span>{" "}
              akan dihapus secara permanen dari arsip Anda.
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
