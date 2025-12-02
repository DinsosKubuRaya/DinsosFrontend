"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { documentStaffAPI, getErrorMessage } from "@/lib/api";
import { DocumentStaff } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Edit,
  Eye,
  Download,
  Trash2,
  FileText,
  Calendar,
  User,
  ExternalLink,
  ShieldCheck,
  Send as SendIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getUserId } from "@/lib/userHelpers";

export default function DocumentStaffDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const { user, isAdmin } = useAuth();

  const [documentData, setDocumentData] = useState<DocumentStaff | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchDocument();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDocument = async () => {
    try {
      const doc = await documentStaffAPI.getById(id);
      setDocumentData(doc);
    } catch (error) {
      console.error("Error fetching document:", error);
      toast.error("Gagal memuat dokumen");
    } finally {
      setLoading(false);
    }
  };

  const getFileUrl = () => {
    if (!documentData) return null;
    if (documentData.file_url && documentData.file_url.startsWith("http")) {
      return documentData.file_url;
    }
    if (documentData.file_name && documentData.file_name.startsWith("http")) {
      return documentData.file_name;
    }
    return null;
  };

  const handlePreview = () => {
    const url = getFileUrl();
    if (!url) {
      toast.error("Link file tidak valid atau rusak.");
      return;
    }
    window.open(url, "_blank");
  };

  const handleDirectDownload = async () => {
    try {
      await documentStaffAPI.download(id);
      toast.success("Sedang mengunduh...");
    } catch (e) {
      const url = getFileUrl();
      if (url) {
        window.open(url, "_blank");
      } else {
        toast.error("Gagal mengunduh file.");
      }
    }
  };

  const executeDelete = async () => {
    setLoading(true);
    try {
      await documentStaffAPI.delete(id);
      toast.success("Dokumen berhasil dihapus.");
      router.push("/dashboard/my-document");
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Gagal menghapus dokumen.");
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  if (loading && !documentData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner className="h-12 w-12" />
      </div>
    );
  }

  if (!documentData) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Dokumen tidak ditemukan</p>
        <Link href="/dashboard/my-document">
          <Button className="mt-4">Kembali ke Daftar</Button>
        </Link>
      </div>
    );
  }

  // --- LOGIKA IZIN AKSES ---
  const currentUserId = user ? getUserId(user) : null;
  const docUserId = documentData.user_id ? String(documentData.user_id) : "";
  const isOwner = currentUserId && docUserId === String(currentUserId);
  const isAdminDoc = documentData.source === "document";
  const canEdit = !isAdminDoc && (isAdmin || isOwner);
  const canDelete = !isAdminDoc && (isAdmin || isOwner);

  return (
    <div className="space-y-6 max-w-4xl p-4 md:p-6 mx-auto">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            disabled={loading}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
              Detail Dokumen
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Informasi lengkap arsip dokumen
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canEdit && (
            <Button
              variant="outline"
              onClick={() => router.push(`/dashboard/my-document/${id}/edit`)}
              disabled={loading}
            >
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
          )}

          {/* Tombol Preview yang Diperbaiki */}
          <Button
            variant="default"
            onClick={handlePreview}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>

          {/* Tombol Download yang Diperbaiki */}
          <Button
            variant="outline"
            onClick={handleDirectDownload}
            disabled={loading}
          >
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>

          {canDelete && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" disabled={loading}>
                  {loading ? (
                    <Spinner className="mr-2 h-4 w-4" />
                  ) : (
                    <Trash2 className="mr-2 h-4 w-4" />
                  )}
                  Hapus
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Hapus Dokumen?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Dokumen ini akan dihapus permanen dan tidak dapat
                    dikembalikan.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={executeDelete}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    Ya, Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* INFO CARD */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-2">
                {isAdminDoc ? (
                  <Badge className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Dari Admin
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-slate-100 text-slate-700 flex items-center gap-1"
                  >
                    <User className="h-3 w-3" /> Dokumen Pribadi
                  </Badge>
                )}

                {/* Tampilkan Tipe Surat HANYA jika ada (misal dokumen Admin) */}
                {documentData.letter_type && (
                  <Badge
                    variant={
                      documentData.letter_type === "masuk"
                        ? "default"
                        : "secondary"
                    }
                    className="capitalize"
                  >
                    {documentData.letter_type === "masuk"
                      ? "Surat Masuk"
                      : "Surat Keluar"}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-xl md:text-2xl leading-tight text-foreground">
                {documentData.subject || "Tanpa Subjek"}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* KOLOM KIRI */}
              <div className="space-y-4">
                {/* Pengirim: Hanya tampil jika data ada (Admin Doc) */}
                {documentData.sender && (
                  <div className="flex items-start gap-3">
                    <SendIcon className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Pengirim
                      </p>
                      <p className="text-base font-semibold">
                        {documentData.sender}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Nama File
                    </p>
                    <p className="text-base break-all">
                      {documentData.file_name?.split("/").pop() || "-"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <ExternalLink className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      URL File
                    </p>
                    {getFileUrl() ? (
                      <a
                        href={getFileUrl()!}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline break-all"
                      >
                        Buka di Tab Baru
                      </a>
                    ) : (
                      <p className="text-sm text-red-500 italic">
                        File tidak tersedia
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* KOLOM KANAN */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Pemilik Dokumen
                    </p>
                    <p className="text-base font-medium">
                      {isAdminDoc
                        ? "Admin Dinas"
                        : documentData.user?.name || "Saya Sendiri"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Tanggal Upload
                    </p>
                    <p className="text-base">
                      {formatDate(documentData.created_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Subject Full */}
            {documentData.subject && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Keterangan Lengkap
                  </p>
                  <div className="p-4 bg-muted/30 rounded-lg text-base whitespace-pre-wrap border border-muted">
                    {documentData.subject}
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
