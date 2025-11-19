"use client";
import { useEffect, useState, useRef } from "react";
import { documentAPI } from "@/lib/api";
import { Document } from "@/types";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, Upload, TrendingUp, FolderOpen, Eye } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
  // 2. Ambil status isAdmin dan loading auth
  const { isAdmin, loading: authLoading } = useAuth();

  const [stats, setStats] = useState({
    totalDocuments: 0,
    recentDocuments: 0,
  });
  const [recentDocs, setRecentDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);

  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const docsResponse = await documentAPI.getAll({ per_page: 5 });
      const docs = docsResponse.documents || [];

      setRecentDocs(docs);
      setStats({
        totalDocuments: docsResponse.total || docs.length,
        recentDocuments: docs.length,
      });
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
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

  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Selamat datang di Sistem Arsip Digital
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Dokumen</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Dokumen tersimpan di sistem
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Dokumen Terbaru
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Dokumen diupload baru-baru ini
            </p>
          </CardContent>
        </Card>

        {/* 4. Quick Actions - Hanya Tampil Jika Admin */}
        {isAdmin && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Quick Actions
              </CardTitle>
              <FolderOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <Link href="/dashboard/documents/upload">
                <Button className="w-full" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Dokumen
                </Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent Documents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Dokumen Terbaru</CardTitle>
            <Link href="/dashboard/documents">
              <Button variant="ghost" size="sm">
                Lihat Semua
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {recentDocs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Belum ada dokumen</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recentDocs.map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-start gap-4 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium truncate">
                        {doc.subject || "Tanpa Subjek"}
                      </p>
                      <Badge
                        variant={
                          doc.letter_type === "masuk" ? "default" : "secondary"
                        }
                      >
                        {doc.letter_type === "masuk" ? "Masuk" : "Keluar"}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mb-1">
                      Pengirim: {doc.sender || "-"}
                    </p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{doc.file_name || "-"}</span>
                      <span>{formatDate(doc.created_at)}</span>
                    </div>
                  </div>
                  <Link href={`/dashboard/documents/${doc.id}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
