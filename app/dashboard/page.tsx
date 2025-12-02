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
  AlertCircle,
} from "lucide-react";
import { documentAPI, documentStaffAPI, superiorOrderAPI } from "@/lib/api";
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
    pendingOrders: 0,
  });

  const [recentDocuments, setRecentDocuments] = useState<
    Document[] | DocumentStaff[]
  >([]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isAdmin]);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      let docs: (Document | DocumentStaff)[] = [];
      let pendingCount = 0;

      if (isAdmin) {
        // === LOGIKA ADMIN ===
        // Admin memanggil API /documents (Admin) dan /document_staff
        const [docResponse, staffDocResponse] = await Promise.all([
          documentAPI.getAll(),
          documentStaffAPI.getAll(),
        ]);

        const adminDocs = docResponse.documents || [];
        const staffDocs = staffDocResponse.documents || [];

        // Gabungkan untuk ditampilkan di tabel terbaru
        // Kita beri tanda source agar bisa dibedakan di UI
        const combinedDocs = [
          ...adminDocs.map((d) => ({ ...d, source: "document" })),
          ...staffDocs.map((d) => ({ ...d, source: "document_staff" })),
        ];

        setStats({
          total: adminDocs.length + staffDocs.length,
          myDocs: 0,
          adminDocs: adminDocs.length,
          masuk: adminDocs.filter((d) => d.letter_type === "masuk").length,
          keluar: adminDocs.filter((d) => d.letter_type === "keluar").length,
          pendingOrders: 0,
        });

        docs = combinedDocs;
      } else {
        // === LOGIKA STAFF (FIX 403 ERROR) ===
        // Staff HANYA boleh panggil documentStaffAPI dan superiorOrderAPI
        // JANGAN panggil documentAPI (Route /documents itu protected Admin Only)
        const [staffResponse, ordersResponse] = await Promise.all([
          documentStaffAPI.getAll(),
          superiorOrderAPI.getAll(),
        ]);

        const allStaffDocs = staffResponse.documents || [];
        const currentUserId = user ? String(getUserId(user)) : "";

        // Filter dokumen: Milik sendiri ATAU dokumen publik dari admin
        docs = allStaffDocs.filter((doc) => {
          const docUserId = doc.user_id ? String(doc.user_id) : "";
          const isOwnDocument = docUserId === currentUserId;
          const isAdminDocument = doc.source === "document";
          return isOwnDocument || isAdminDocument;
        });

        const myDocsCount = docs.filter(
          (d) =>
            d.source === "document_staff" && String(d.user_id) === currentUserId
        ).length;
        const adminDocsCount = docs.filter(
          (d) => d.source === "document"
        ).length;

        // Hitung Perintah Masuk
        const myOrders = Array.isArray(ordersResponse)
          ? ordersResponse.filter((o) => o.user_id === currentUserId)
          : [];
        pendingCount = myOrders.length;

        setStats({
          total: docs.length,
          myDocs: myDocsCount,
          adminDocs: adminDocsCount,
          masuk: 0,
          keluar: 0,
          pendingOrders: pendingCount,
        });
      }

      // Sort dokumen terbaru
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
      // Gunakan API yang sesuai berdasarkan tipe dokumen/user
      if (isAdmin && doc.source === "document") {
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

  // Casting tipe agar kompatibel dengan komponen DocumentTable
  // Kita gunakan any casting aman karena struktur Document dan DocumentStaff mirip untuk keperluan tabel
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* TOTAL DOKUMEN (UMUM) */}
        <Card>
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Arsip</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Dokumen tersimpan</p>
          </CardContent>
        </Card>

        {/* WIDGET CONDITIONAL BERDASARKAN ROLE */}
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
                <p className="text-xs text-muted-foreground">
                  Total surat masuk
                </p>
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
                <p className="text-xs text-muted-foreground">
                  Total surat keluar
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <>
            {/* WIDGET KHUSUS STAFF: PERINTAH MASUK */}
            <Card
              className={
                stats.pendingOrders > 0 ? "bg-orange-50 border-orange-200" : ""
              }
            >
              <CardHeader className="flex flex-row justify-between pb-2">
                <CardTitle
                  className={`text-sm font-medium ${
                    stats.pendingOrders > 0 ? "text-orange-700" : ""
                  }`}
                >
                  Perintah Masuk
                </CardTitle>
                <AlertCircle
                  className={`h-4 w-4 ${
                    stats.pendingOrders > 0
                      ? "text-orange-600"
                      : "text-muted-foreground"
                  }`}
                />
              </CardHeader>
              <CardContent>
                <div
                  className={`text-2xl font-bold ${
                    stats.pendingOrders > 0 ? "text-orange-700" : ""
                  }`}
                >
                  {stats.pendingOrders}
                </div>
                <p
                  className={`text-xs ${
                    stats.pendingOrders > 0
                      ? "text-orange-600"
                      : "text-muted-foreground"
                  }`}
                >
                  Perlu tindak lanjut
                </p>
              </CardContent>
            </Card>

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
                <p className="text-xs text-muted-foreground">
                  Diupload oleh Anda
                </p>
              </CardContent>
            </Card>
          </>
        )}

        {/* STATUS SISTEM (UMUM) */}
        <Card>
          <CardHeader className="flex flex-row justify-between pb-2">
            <CardTitle className="text-sm font-medium">Status Sistem</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">
              Server berjalan normal
            </p>
          </CardContent>
        </Card>
      </div>

      {/* TABEL DOKUMEN TERBARU */}
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
                documents={displayDocs}
                isAdmin={isAdmin}
                formatDate={formatDate}
                onDownload={handleDownload}
                isMyDocumentPage={!isAdmin} // Staff tidak bisa edit/hapus dokumen admin
                showSourceColumn={true}
              />
              <DocumentListMobile
                documents={displayDocs}
                isAdmin={isAdmin}
                formatDate={formatDate}
                onDownload={handleDownload}
                isMyDocumentPage={!isAdmin}
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
