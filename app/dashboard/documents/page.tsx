"use client";

import { useEffect, useState } from "react";
import { documentAPI, documentStaffAPI, userAPI } from "@/lib/api";
import { Document, DocumentStaff } from "@/types";
import Link from "next/link";
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
import { Upload, Archive, Users, FileText } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { DocumentListMobile } from "@/components/documents/DocumentListMobile";
import { DocumentFilter } from "@/components/documents/DocumentFilter";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function DocumentsPage() {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<"official" | "staff">("official");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);

  const [searchTerm, setSearchTerm] = useState("");
  const [year, setYear] = useState("all");
  const [month, setMonth] = useState("all");
  const [userFilter, setUserFilter] = useState("all");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [docToDelete, setDocToDelete] = useState<Document | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    if (isAdmin) setActiveTab("official");
  }, [user, isAdmin]);

  // Fetch users for filter dropdown
  useEffect(() => {
    if (isAdmin && activeTab === "staff") {
      fetchUsers();
    }
  }, [isAdmin, activeTab]);

  useEffect(() => {
    if (user || isAdmin) fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, user, isAdmin, activeTab, year, month, userFilter]);

  const fetchUsers = async () => {
    try {
      const userData = await userAPI.getUsersForFilter();
      setUsers(
        userData.map((u) => ({
          id: u.id || u.ID || "",
          name: u.name,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch users for filter:", error);
    }
  };

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

      if (year !== "all" || month !== "all" || userFilter !== "all") {
        allDocs = allDocs.filter((doc) => {
          const docDate = new Date(doc.created_at);
          const matchYear =
            year === "all" || docDate.getFullYear().toString() === year;
          const matchMonth =
            month === "all" || (docDate.getMonth() + 1).toString() === month;
          const matchUser = userFilter === "all" || doc.user_id === userFilter;
          return matchYear && matchMonth && matchUser;
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
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "official" | "staff")}
          className="w-full"
        >
          <TabsList className="bg-muted/30 p-1.5 rounded-xl w-full sm:w-fit border border-border/50 h-auto">
            <TabsTrigger
              value="official"
              className="px-5 py-2.5 rounded-lg data-[state=active]:shadow-sm"
            >
              <Archive className="h-4 w-4" />
              Arsip Dinas
            </TabsTrigger>
            <TabsTrigger
              value="staff"
              className="px-5 py-2.5 rounded-lg data-[state=active]:shadow-sm"
            >
              <Users className="h-4 w-4" />
              Monitoring Staff
            </TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      <DocumentFilter
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        year={year}
        setYear={setYear}
        month={month}
        setMonth={setMonth}
        userFilter={userFilter}
        setUserFilter={setUserFilter}
        users={users}
        showUserFilter={isAdmin && activeTab === "staff"}
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
