"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { documentStaffAPI } from "@/lib/api";
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

  const getFileExtension = (filename: string) => {
    return filename.split(".").pop()?.toLowerCase() || "";
  };

  const handlePreview = () => {
    if (!documentData?.file_name) {
      toast.error("Link file tidak ditemukan");
      return;
    }

    const ext = getFileExtension(documentData.file_name);
    const isOfficeDoc = [
      "pdf",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
    ].includes(ext);

    if (isOfficeDoc) {
      const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(
        documentData.file_name
      )}&embedded=true`;
      window.open(googleViewerUrl, "_blank");
    } else {
      window.open(documentData.file_name, "_blank");
    }
  };

  const handleDirectDownload = () => {
    if (documentData?.file_name) {
      window.open(documentData.file_name, "_blank");
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

  // --- LOGIKA IZIN AKSES  ---
  const currentUserId = user ? getUserId(user) : null;
  const docUserId = documentData.user_id ? String(documentData.user_id) : "";
  const isOwner = currentUserId && docUserId === String(currentUserId);
  const isAdminDoc = documentData.source === "document";
  const canEdit = isAdmin || (isOwner && !isAdminDoc);
  const canDelete = isAdmin || (isOwner && !isAdminDoc);

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
              Detail informasi dokumen surat
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

          <Button
            variant="default"
            onClick={handlePreview}
            disabled={loading || !documentData.file_name}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Eye className="mr-2 h-4 w-4" />
            Preview
          </Button>

          <Button
            variant="outline"
            onClick={handleDirectDownload}
            disabled={loading || !documentData.file_name}
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
                  <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Tindakan ini tidak dapat dibatalkan. Dokumen ini akan
                    dihapus secara permanen dari sistem.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Batal</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={executeDelete}
                    className="bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
                  >
                    Ya, Hapus
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
      </div>

      {/* CONTENT CARD */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1 pr-4">
              <div className="flex items-center gap-2 mb-2">
                {isAdminDoc && (
                  <Badge className="bg-blue-600 hover:bg-blue-700 flex items-center gap-1">
                    <ShieldCheck className="h-3 w-3" /> Dari Admin
                  </Badge>
                )}
                <Badge
                  variant={
                    documentData.letter_type === "masuk"
                      ? "default"
                      : "secondary"
                  }
                  className="capitalize"
                >
                  Surat {documentData.letter_type}
                </Badge>
              </div>
              <CardTitle className="text-xl md:text-2xl leading-tight">
                {documentData.subject || "Tanpa Subjek"}
              </CardTitle>
              <p className="text-muted-foreground text-sm mt-2 font-mono">
                ID: {documentData.id}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Kiri */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Pengirim
                    </p>
                    <p className="text-base font-medium">
                      {documentData.sender || "-"}
                    </p>
                  </div>
                </div>

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
                      Link File
                    </p>
                    {documentData.file_name ? (
                      <a
                        href={documentData.file_name}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:underline break-all"
                      >
                        Buka di Tab Baru
                      </a>
                    ) : (
                      <p className="text-sm text-muted-foreground">-</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Kanan */}
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Diupload Oleh
                    </p>
                    <p className="text-base">
                      {isAdminDoc
                        ? "Admin"
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

                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Terakhir Diupdate
                    </p>
                    <p className="text-base">
                      {formatDate(documentData.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {documentData.subject && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Subjek / Perihal Lengkap
                  </p>
                  <div className="p-4 bg-muted/50 rounded-lg text-base whitespace-pre-wrap border">
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
