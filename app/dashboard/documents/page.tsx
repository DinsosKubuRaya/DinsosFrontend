"use client";

import { useEffect, useState } from "react";
import { documentAPI, documentStaffAPI } from "@/lib/api";
import { Document, DocumentStaff } from "@/types";
import Link from "next/link";
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
import { Upload, Archive, Users, FileText } from "lucide-react";
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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (isAdmin) setActiveTab("official");
  }, [user, isAdmin]);

  useEffect(() => {
    if (user || isAdmin) fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, user, isAdmin, activeTab, year, month]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params: { search?: string } = {};
      if (debouncedSearch) params.search = debouncedSearch;

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
              ({ ...doc, source: "staff" } as unknown as Document)
          );
        }
      } else {
        const response = await documentStaffAPI.getAll(params);
        allDocs = (response.documents || []).map(
          (doc) => ({ ...doc, source: "staff" } as unknown as Document)
        );
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
      toast.error("Gagal memuat dokumen");
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
      toast.success("Mengunduh...");
    } catch (error) {
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
    <div className="space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {isAdmin
              ? activeTab === "official"
                ? "Arsip Dinas"
                : "Monitoring Staff"
              : "Arsip Dokumen"}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            {isAdmin
              ? "Kelola dan pantau semua dokumen dalam sistem."
              : "Daftar dokumen dinas."}
          </p>
        </div>

        {isAdmin && activeTab === "official" && (
          <Link href="/dashboard/documents/upload">
            <Button className="rounded-full shadow-lg shadow-primary/20 px-6 h-11">
              <Upload className="mr-2 h-4 w-4" /> Upload Surat
            </Button>
          </Link>
        )}
      </div>

      {isAdmin && (
        <div className="bg-muted/30 p-1.5 rounded-xl w-full sm:w-fit border border-border/50 flex gap-1">
          <button
            onClick={() => setActiveTab("official")}
            className={`flex-1 sm:flex-none px-5 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === "official"
                ? "bg-background text-foreground shadow-sm ring-1 ring-border/50 font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Archive className="h-4 w-4" /> Arsip Dinas
          </button>
          <button
            onClick={() => setActiveTab("staff")}
            className={`flex-1 sm:flex-none px-5 py-2 text-sm font-medium rounded-lg transition-all flex items-center justify-center gap-2 ${
              activeTab === "staff"
                ? "bg-background text-primary shadow-sm ring-1 ring-border/50 font-semibold"
                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
            }`}
          >
            <Users className="h-4 w-4" /> Monitoring Staff
          </button>
        </div>
      )}

      <DocumentFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        year={year}
        setYear={setYear}
        month={month}
        setMonth={setMonth}
      />

      {loading ? (
        <div className="py-20 text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Memuat dokumen...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border/60 rounded-2xl bg-muted/5">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="font-medium text-foreground">Tidak ada dokumen</p>
          <p className="text-sm text-muted-foreground mt-1">
            Belum ada data yang sesuai filter Anda.
          </p>
        </div>
      ) : (
        <>
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
        </>
      )}

      <AlertDialog
        open={!!docToDelete}
        onOpenChange={(open) => {
          if (!open) setDocToDelete(null);
        }}
      >
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Dokumen?</AlertDialogTitle>
            <AlertDialogDescription>
              Dokumen{" "}
              <span className="font-bold text-foreground">
                {docToDelete?.subject}
              </span>{" "}
              akan dihapus permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg">Batal</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive hover:bg-destructive/90 rounded-lg"
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
