"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Mail, Send, Activity, User, Users } from "lucide-react";
import { documentAPI, documentStaffAPI, userAPI } from "@/lib/api";
import { Document, DocumentStaff } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { getUserId } from "@/lib/userHelpers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { DocumentListMobile } from "@/components/documents/DocumentListMobile";
import { toast } from "sonner";
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

export default function DashboardPage() {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalDocs: 0,
    myDocs: 0,
    masuk: 0,
    keluar: 0,
  });

  const [recentDocuments, setRecentDocuments] = useState<
    (Document | DocumentStaff)[]
  >([]);

  // ✅ State untuk delete confirmation
  const [docToDelete, setDocToDelete] = useState<
    Document | DocumentStaff | null
  >(null);

  useEffect(() => {
    if (user || isAdmin) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      if (isAdmin) {
        // === ADMIN/SUPERADMIN ===
        const docResponse = await documentAPI.getAll();
        const docs = docResponse.documents || [];

        let userCount = 0;
        if (isSuperAdmin) {
          try {
            const users = await userAPI.getAll();
            userCount = Array.isArray(users) ? users.length : 0;
          } catch (err) {
            console.error("Gagal ambil data user", err);
          }
        }

        setStats({
          totalUsers: userCount,
          totalDocs: docs.length,
          myDocs: 0,
          masuk: docs.filter((d) => d.letter_type === "masuk").length,
          keluar: docs.filter((d) => d.letter_type === "keluar").length,
        });

        const sortedDocs = docs.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        const mappedDocs: Document[] = sortedDocs.slice(0, 5).map((d) => ({
          ...d,
          source: "document",
        }));
        setRecentDocuments(mappedDocs);
      } else {
        // === STAFF ===
        const response = await documentStaffAPI.getAll();
        let docs = response.documents || [];
        const currentUserId = user ? String(getUserId(user)) : "";

        docs = docs.filter((doc) => {
          const docUserId = doc.user_id ? String(doc.user_id) : "";
          return docUserId === currentUserId;
        });

        setStats({
          totalUsers: 0,
          totalDocs: 0,
          myDocs: docs.length,
          masuk: 0,
          keluar: 0,
        });

        const sortedDocs = docs.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        const mappedDocs: DocumentStaff[] = sortedDocs.slice(0, 5).map((d) => ({
          ...d,
          source: "document_staff",
        }));
        setRecentDocuments(mappedDocs);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const handleDownload = async (doc: Document | DocumentStaff) => {
    try {
      if (doc.file_url) {
        window.open(doc.file_url, "_blank");
        toast.success("Membuka file...");
      } else {
        toast.error("URL file tidak tersedia");
      }
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Gagal membuka file", {
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan",
      });
    }
  };

  const handleDeleteClick = (doc: Document | DocumentStaff) => {
    setDocToDelete(doc);
  };

  const executeDelete = async () => {
    if (!docToDelete) return;

    try {
      if (docToDelete.source === "document") {
        await documentAPI.delete(docToDelete.id);
      } else {
        await documentStaffAPI.delete(docToDelete.id);
      }

      toast.success("Dokumen berhasil dihapus");

      fetchDashboardData();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Gagal menghapus dokumen");
    } finally {
      setDocToDelete(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-100px)]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang,{" "}
          <span className="font-semibold text-primary uppercase">
            {user?.name}
          </span>
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {/* WIDGET SUPER ADMIN: Total User */}
        {isSuperAdmin && (
          <Card>
            <CardHeader className="flex flex-row justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total User</CardTitle>
              <Users className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                Pengguna terdaftar
              </p>
            </CardContent>
          </Card>
        )}

        {isAdmin ? (
          <>
            <Card>
              <CardHeader className="flex flex-row justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Arsip Dinas
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalDocs}</div>
                <p className="text-xs text-muted-foreground">
                  Dokumen dinas tersimpan
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Surat Masuk
                </CardTitle>
                <Mail className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.masuk}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Surat Keluar
                </CardTitle>
                <Send className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.keluar}</div>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            <Card>
              <CardHeader className="flex flex-row justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Dokumen Saya
                </CardTitle>
                <User className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.myDocs}</div>
                <p className="text-xs text-muted-foreground">
                  Diunggah oleh Anda
                </p>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" /> Dokumen Terbaru
          </CardTitle>
          <Link
            href={isAdmin ? "/dashboard/documents" : "/dashboard/my-document"}
          >
            <Button variant="outline" size="sm">
              Lihat Semua
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {recentDocuments.length > 0 ? (
            <>
              <DocumentTable
                documents={recentDocuments as Document[]}
                isAdmin={isAdmin}
                formatDate={formatDate}
                onDownload={handleDownload}
                onDeleteClick={handleDeleteClick}
                isMyDocumentPage={!isAdmin}
                showSourceColumn={isAdmin}
              />
              <DocumentListMobile
                documents={recentDocuments as Document[]}
                isAdmin={isAdmin}
                formatDate={formatDate}
                onDownload={handleDownload}
                onDeleteClick={handleDeleteClick}
                isMyDocumentPage={!isAdmin}
                showSourceBadge={isAdmin}
              />
            </>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              Belum ada aktivitas dokumen.
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
