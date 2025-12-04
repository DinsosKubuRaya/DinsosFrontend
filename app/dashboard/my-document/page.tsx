"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { DocumentFilter } from "@/components/documents/DocumentFilter";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { DocumentListMobile } from "@/components/documents/DocumentListMobile";
import { FileText, Upload } from "lucide-react";
import { documentStaffAPI } from "@/lib/api";
import { Document, DocumentStaff } from "@/types";
import { Button } from "@/components/ui/button";
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
import { getUserId } from "@/lib/userHelpers";

export default function MyDocumentPage() {
  const { user, isAdmin } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState("");
  const [search, setSearch] = useState("");
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (user || isAdmin) fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, user, isAdmin, year, month]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params: { search?: string } = {};
      if (search) params.search = search;

      const currentUserId = user ? getUserId(user) : "";
      const response = await documentStaffAPI.getAll(params);

      let myDocs: Document[] = (response.documents || [])
        .filter(
          (doc: DocumentStaff) => String(doc.user_id) === String(currentUserId)
        )
        .map((doc: DocumentStaff) => ({
          ...doc,
          source: "document_staff",
        })) as unknown as Document[];

      if (year !== "all" || month !== "all") {
        myDocs = myDocs.filter((doc) => {
          const docDate = new Date(doc.created_at);
          const matchYear =
            year === "all" || docDate.getFullYear().toString() === year;
          const matchMonth =
            month === "all" || (docDate.getMonth() + 1).toString() === month;
          return matchYear && matchMonth;
        });
      }
      setDocuments(myDocs);
    } catch (error) {
      toast.error("Gagal memuat dokumen");
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
      await documentStaffAPI.download(doc.id);
      toast.success("Membuka file...");
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
            Dokumen Saya
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Kelola dokumen pribadi yang Anda upload.
          </p>
        </div>
        <Link href="/dashboard/my-document/upload">
          <Button className="rounded-full shadow-lg shadow-primary/20 px-6 h-11">
            <Upload className="mr-2 h-4 w-4" /> Upload Dokumen
          </Button>
        </Link>
      </div>

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
          <p className="text-muted-foreground">Memuat data...</p>
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-border/60 rounded-2xl bg-muted/5">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="font-medium text-foreground">Belum ada dokumen</p>
          <p className="text-sm text-muted-foreground mt-1">
            Silakan upload dokumen pertama Anda.
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
            isMyDocumentPage={true}
            showSourceColumn={false}
          />
          <DocumentListMobile
            documents={documents}
            isAdmin={isAdmin}
            formatDate={formatDate}
            onDownload={handleDownload}
            onDeleteClick={setDocToDelete}
            isMyDocumentPage={true}
            showSourceBadge={false}
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
