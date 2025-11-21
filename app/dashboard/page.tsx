"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Mail,
  Send,
  Activity,
  User,
  ShieldCheck,
} from "lucide-react";
import { documentStaffAPI } from "@/lib/api";
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

  const [recentDocuments, setRecentDocuments] = useState<DocumentStaff[]>([]);

  useEffect(() => {
    if (user || isAdmin) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await documentStaffAPI.getAll();
      let docs = response.documents || [];
      const currentUserId = user ? String(getUserId(user)) : "";

      if (!isAdmin) {
        docs = docs.filter((doc) => {
          const docUserId = doc.user_id ? String(doc.user_id) : "";
          const isOwnDocument = docUserId === currentUserId;
          const isAdminDocument = doc.source === "document";

          return isOwnDocument || isAdminDocument;
        });
        const myDocsCount = docs.filter(
          (d) => d.source === "document_staff"
        ).length;
        const adminDocsCount = docs.filter(
          (d) => d.source === "document"
        ).length;

        setStats({
          total: docs.length,
          myDocs: myDocsCount,
          adminDocs: adminDocsCount,
          masuk: 0,
          keluar: 0,
        });
      } else {
        setStats({
          total: docs.length,
          myDocs: 0,
          adminDocs: 0,
          masuk: docs.filter((d) => d.letter_type === "masuk").length,
          keluar: docs.filter((d) => d.letter_type === "keluar").length,
        });
      }

      const sortedDocs = docs.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      setRecentDocuments(sortedDocs.slice(0, 5));
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const handleDownload = async (doc: Document) => {
    try {
      await documentStaffAPI.download(doc.id);
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

  const displayDocs = recentDocuments as unknown as Document[];

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
        {/* TOTAL DOKUMEN */}
        <Card>
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Dokumen</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        {/* LOGIC UNTUK ADMIN VS STAFF */}
        {isAdmin ? (
          <>
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
            {/* DOKUMEN SAYA */}
            <Card>
              <CardHeader className="flex flex-row justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Dokumen Saya
                </CardTitle>
                <User className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.myDocs}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Diunggah oleh Anda
                </p>
              </CardContent>
            </Card>

            {/* DOKUMEN DARI ADMIN */}
            <Card>
              <CardHeader className="flex flex-row justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Masuk dari Admin
                </CardTitle>
                <ShieldCheck className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.adminDocs}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  Perlu ditinjau
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
          <Link href="/dashboard/my-document">
            <Button variant="outline" size="sm">
              Lihat Semua
            </Button>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {recentDocuments.length > 0 ? (
            <>
              <DocumentTable
                documents={displayDocs}
                isAdmin={isAdmin}
                formatDate={formatDate}
                onDownload={handleDownload}
                isMyDocumentPage={true}
                // Tampilkan kolom sumber di dashboard agar jelas asal dokumen
                showSourceColumn={true}
              />
              <DocumentListMobile
                documents={displayDocs}
                isAdmin={isAdmin}
                formatDate={formatDate}
                onDownload={handleDownload}
                isMyDocumentPage={true}
                showSourceBadge={true}
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
