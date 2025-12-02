"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Mail, Send, Activity, User } from "lucide-react";
import { documentAPI, documentStaffAPI } from "@/lib/api"; // Import documentAPI (Admin)
import { Document, DocumentStaff } from "@/types";
import { useAuth } from "@/context/AuthContext";
import { getUserId } from "@/lib/userHelpers";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DocumentTable } from "@/components/documents/DocumentTable";
import { DocumentListMobile } from "@/components/documents/DocumentListMobile";

export default function DashboardPage() {
  const { user, isAdmin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    myDocs: 0,
    adminDocs: 0,
    masuk: 0,
    keluar: 0,
  });

  // State menampung union type Document atau DocumentStaff
  const [recentDocuments, setRecentDocuments] = useState<
    (Document | DocumentStaff)[]
  >([]);

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
        // === ADMIN/SUPERADMIN: Ambil Arsip Utama ===
        const response = await documentAPI.getAll();
        const docs = response.documents || [];

        setStats({
          total: docs.length,
          myDocs: 0,
          adminDocs: 0,
          masuk: docs.filter((d) => d.letter_type === "masuk").length,
          keluar: docs.filter((d) => d.letter_type === "keluar").length,
        });

        const sortedDocs = docs.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        // HAPUS ANY: Mapping type-safe
        const mappedDocs: Document[] = sortedDocs.slice(0, 5).map((d) => ({
          ...d,
          source: "document",
        }));
        setRecentDocuments(mappedDocs);
      } else {
        // === STAFF: Ambil Dokumen Pribadi ===
        const response = await documentStaffAPI.getAll();
        let docs = response.documents || [];
        const currentUserId = user ? String(getUserId(user)) : "";

        // Filter hanya milik sendiri
        docs = docs.filter((doc) => {
          const docUserId = doc.user_id ? String(doc.user_id) : "";
          return docUserId === currentUserId;
        });

        setStats({
          total: docs.length,
          myDocs: docs.length,
          adminDocs: 0,
          masuk: 0,
          keluar: 0,
        });

        const sortedDocs = docs.sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        // HAPUS ANY: Mapping type-safe ke DocumentStaff
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

  // Gunakan type union untuk parameter doc
  const handleDownload = async (doc: Document | DocumentStaff) => {
    try {
      if (doc.source === "document") {
        await documentAPI.download(doc.id);
      } else {
        await documentStaffAPI.download(doc.id);
      }
    } catch (e) {
      console.error(e);
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
        {isAdmin ? (
          // WIDGET ADMIN (Mengambil data Arsip Resmi)
          <>
            <Card>
              <CardHeader className="flex flex-row justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Arsip
                </CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
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
          // WIDGET STAFF
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
              {/* HAPUS ANY: Casting aman ke Document[] karena struktur DocumentStaff kompatibel */}
              <DocumentTable
                documents={recentDocuments as Document[]}
                isAdmin={isAdmin}
                formatDate={formatDate}
                onDownload={handleDownload}
                isMyDocumentPage={!isAdmin}
                showSourceColumn={isAdmin}
              />
              <DocumentListMobile
                documents={recentDocuments as Document[]}
                isAdmin={isAdmin}
                formatDate={formatDate}
                onDownload={handleDownload}
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
    </div>
  );
}
