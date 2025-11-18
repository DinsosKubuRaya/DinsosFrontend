"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { documentAPI, getErrorMessage } from "@/lib/api";
import { Document } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Edit,
  Download,
  Trash2,
  Save,
  X,
  FileText,
  Calendar,
  User,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext"; // ← TAMBAHKAN INI

export default function DocumentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAdmin } = useAuth(); // ← TAMBAHKAN INI
  const [documentData, setDocumentData] = useState<Document | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    sender: "",
    subject: "",
    letter_type: "masuk" as "masuk" | "keluar",
  });

  useEffect(() => {
    fetchDocument();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const fetchDocument = async () => {
    try {
      const doc = await documentAPI.getById(params.id as string);
      setDocumentData(doc);
      setFormData({
        sender: doc.sender || "",
        subject: doc.subject || "",
        letter_type: doc.letter_type,
      });
    } catch (error) {
      console.error("Error fetching document:", error);
      toast.error("Gagal memuat dokumen");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await documentAPI.update(params.id as string, {
        sender: formData.sender,
        subject: formData.subject,
        letter_type: formData.letter_type,
      });
      setIsEditing(false);
      await fetchDocument();
      toast.success("Dokumen berhasil diperbarui!");
    } catch (error: unknown) {
      console.error("Error updating document:", error);
      const errorMessage = getErrorMessage(error);
      toast.error("Gagal update dokumen", { description: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!documentData?.file_name) {
      toast.error("URL file tidak ditemukan");
      return;
    }

    window.open(documentData.file_name, "_blank");
    toast.success("Membuka file di tab baru");
  };

  const handleDelete = async () => {
    if (!confirm("Yakin ingin menghapus dokumen ini?")) return;
    setLoading(true);
    try {
      await documentAPI.delete(params.id as string);
      toast.success("Dokumen berhasil dihapus.");
      router.push("/dashboard/documents");
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
        <Link href="/dashboard/documents">
          <Button className="mt-4">Kembali ke Daftar Dokumen</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between flex-wrap gap-4">
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
            <h1 className="text-3xl font-bold tracking-tight">
              Detail Dokumen
            </h1>
            <p className="text-muted-foreground mt-2">
              Lihat dan kelola informasi dokumen
            </p>
          </div>
        </div>

        {/* ✅ TOMBOL ACTIONS - KONDISIONAL BERDASARKAN ROLE */}
        {!isEditing && (
          <div className="flex items-center gap-2">
            {/* ❌ Edit - Hanya Admin */}
            {isAdmin && (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                disabled={loading}
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            )}

            {/* ✅ Download - Semua User */}
            <Button
              variant="outline"
              onClick={handleDownload}
              disabled={loading}
            >
              <Download className="mr-2 h-4 w-4" />
              Buka File
            </Button>

            {/* ❌ Hapus - Hanya Admin */}
            {isAdmin && (
              <Button
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
              >
                {loading ? (
                  <Spinner className="mr-2 h-4 w-4" />
                ) : (
                  <Trash2 className="mr-2 h-4 w-4" />
                )}
                Hapus
              </Button>
            )}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl">
                {documentData.subject || "Tanpa Subjek"}
              </CardTitle>
              <p className="text-muted-foreground mt-2">
                ID: {documentData.id}
              </p>
            </div>
            <Badge
              variant={
                documentData.letter_type === "masuk" ? "default" : "secondary"
              }
            >
              {documentData.letter_type === "masuk"
                ? "Surat Masuk"
                : "Surat Keluar"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="sender">Pengirim</Label>
                <Input
                  id="sender"
                  required
                  value={formData.sender}
                  onChange={(e) =>
                    setFormData({ ...formData, sender: e.target.value })
                  }
                  placeholder="Nama pengirim dokumen"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subjek / Perihal</Label>
                <Textarea
                  id="subject"
                  required
                  rows={3}
                  value={formData.subject}
                  onChange={(e) =>
                    setFormData({ ...formData, subject: e.target.value })
                  }
                  placeholder="Subjek atau perihal dokumen"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="letter_type">Tipe Surat</Label>
                <Select
                  value={formData.letter_type}
                  onValueChange={(value: "masuk" | "keluar") =>
                    setFormData({ ...formData, letter_type: value })
                  }
                >
                  <SelectTrigger id="letter_type">
                    <SelectValue placeholder="Pilih tipe surat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masuk">Surat Masuk</SelectItem>
                    <SelectItem value="keluar">Surat Keluar</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      sender: documentData.sender || "",
                      subject: documentData.subject || "",
                      letter_type: documentData.letter_type,
                    });
                  }}
                  disabled={loading}
                >
                  <X className="mr-2 h-4 w-4" />
                  Batal
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading ? (
                    <Spinner className="mr-2 h-4 w-4" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Simpan Perubahan
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Pengirim
                      </p>
                      <p className="text-base wrap-break-words">
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
                        {documentData.file_name || "-"}
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
                          Buka di Cloudinary/Google Drive
                        </a>
                      ) : (
                        <p className="text-sm text-muted-foreground">-</p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <User className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Diupload Oleh
                      </p>
                      <p className="text-base">
                        {documentData.user_name ||
                          documentData.user?.name ||
                          "-"}
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
                      Subjek / Perihal
                    </p>
                    <p className="text-base whitespace-pre-wrap">
                      {documentData.subject}
                    </p>
                  </div>
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
