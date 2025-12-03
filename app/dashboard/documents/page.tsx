"use client";

import { useEffect, useState } from "react";
import { documentAPI, documentStaffAPI } from "@/lib/api";
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

export default function DocumentsPage() {
  const { user, isAdmin } = useAuth();

  const [activeTab, setActiveTab] = useState<"official" | "staff">("official");

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");

  const [docToDelete, setDocToDelete] = useState<Document | null>(null);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (isAdmin) {
      setActiveTab("official");
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (user || isAdmin) {
      fetchDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, user, isAdmin, activeTab, year, month]); // Tambahkan year & month ke dependency

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params: { search?: string } = {};

      if (debouncedSearch) {
        params.search = debouncedSearch;
      }

      let allDocs: Document[] = [];

      if (isAdmin) {
        if (activeTab === "official") {
          const response = await documentAPI.getAll(params);
          allDocs = (response.documents || []).map((doc: Document) => ({
            ...doc,
            source: "document",
          }));
        } else {
          const staffResponse = await documentStaffAPI.getAll(params);
          allDocs = (staffResponse.documents || []).map(
            (doc: DocumentStaff) =>
              ({
                ...doc,
                source: "staff",
              } as unknown as Document)
          );
        }
      } else {
        if (!user) {
          setDocuments([]);
          return;
        }
        const response = await documentStaffAPI.getAll(params);
        let docs = response.documents || [];
        const currentUserId = user.ID || user.id;
        if (currentUserId) {
          docs = docs.filter(
            (doc) => String(doc.user_id) === String(currentUserId)
          );
        }
        allDocs = docs.map((doc: DocumentStaff) => ({
          ...doc,
          source: "staff",
        })) as unknown as Document[];
      }

      if (year !== "all" || month !== "all") {
        allDocs = allDocs.filter((doc) => {
          const docDate = new Date(doc.created_at);

          const matchYear =
            year === "all" || docDate.getFullYear().toString() === year;
          const matchMonth =
            month === "all" || (docDate.getMonth() + 1).toString() === month;

          return matchYear && matchMonth;
        });
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
      if (
        docToDelete.source === "staff" ||
        docToDelete.source === "document_staff"
      ) {
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
      if (doc.file_url) {
        window.open(doc.file_url, "_blank");
        toast.success("Membuka file...");
        return;
      }

      if (doc.source === "staff" || doc.source === "document_staff") {
        await documentStaffAPI.download(doc.id);
      } else {
        await documentAPI.download(doc.id);
      }
      toast.success("Mengunduh file...");
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

        {isAdmin && activeTab === "official" && (
          <Link href="/dashboard/documents/upload">
            <Button>
              <Upload className="mr-2 h-4 w-4" />
              Upload Surat Dinas
            </Button>
          </Link>
        )}
      </div>

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

      {/* Filter Component */}
      <DocumentFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        year={year}
        setYear={setYear}
        month={month}
        setMonth={setMonth}
      />

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
                Coba ubah filter pencarian atau tahun/bulan.
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
