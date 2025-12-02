"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { documentStaffAPI, getErrorMessage } from "@/lib/api";
import { DocumentStaff } from "@/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Loader2, Eye } from "lucide-react";
import { toast } from "sonner";

export default function EditDocumentStaffPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [document, setDocument] = useState<DocumentStaff | null>(null);

  const [formData, setFormData] = useState({
    subject: "",
  });

  useEffect(() => {
    if (id) {
      fetchDocument();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const doc = await documentStaffAPI.getById(id);
      setDocument(doc);
      setFormData({
        subject: doc.subject || "",
      });
    } catch (error) {
      console.error("Error fetching document:", error);
      toast.error(getErrorMessage(error));
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.subject.trim()) {
      toast.error("Subjek wajib diisi");
      return;
    }

    try {
      setSaving(true);
      await documentStaffAPI.update(id, {
        subject: formData.subject.trim(),
        sender: "",
        letter_type: "masuk",
        file: null,
      });
      toast.success("Dokumen berhasil diperbarui");
      router.push(`/dashboard/my-document/${id}`);
    } catch (error) {
      console.error("Update error:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // --- LOGIKA PREVIEW YANG LEBIH STABIL ---
  const handlePreview = () => {
    // 1. Cek URL yang valid.
    // - Prioritas 1: file_url (Format baru, URL Cloudinary ada di sini)
    // - Prioritas 2: file_name (Format lama, dulu URL disimpan di sini)
    const fileUrl = document?.file_url || document?.file_name;

    if (!fileUrl) {
      toast.error("URL file tidak ditemukan");
      return;
    }

    // 2. Buka langsung di tab baru
    // Browser modern sudah pintar menangani PDF/Gambar/Video
    window.open(fileUrl, "_blank");
  };

  // Helper untuk menampilkan nama file yang bersih di UI
  const getDisplayFileName = () => {
    if (!document?.file_name) return "File Terlampir";
    // Jika file_name berisi URL panjang (data lama), ambil bagian akhirnya saja
    if (document.file_name.startsWith("http")) {
      return document.file_name.split("/").pop() || "File Lama";
    }
    return document.file_name;
  };

  if (loading) {
    return (
      <div className="container flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!document) {
    return (
      <div className="container py-10 text-center">
        <p className="text-muted-foreground">Dokumen tidak ditemukan</p>
        <Button onClick={() => router.back()} className="mt-4">
          Kembali
        </Button>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8 px-4 md:px-6 mx-auto">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          disabled={saving}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Dokumen</h1>
          <p className="text-muted-foreground">
            Perbarui informasi dokumen yang sudah diupload
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Edit</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* FILE INFO */}
            <div className="p-4 bg-muted/50 rounded-lg border space-y-3">
              <Label className="text-muted-foreground">File Terlampir</Label>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span
                    className="font-medium truncate max-w-[200px] md:max-w-md"
                    title={document.file_name}
                  >
                    {getDisplayFileName()}
                  </span>
                </div>

                {/* Tombol Preview */}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handlePreview}
                >
                  <Eye className="mr-2 h-3 w-3" />
                  Cek File
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                *File tidak dapat diganti di menu edit.
              </p>
            </div>

            {/* FIELD SUBJECT */}
            <div className="space-y-2">
              <Label htmlFor="subject">
                Subjek / Perihal <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="subject"
                name="subject"
                rows={3}
                value={formData.subject}
                onChange={handleFormChange}
                disabled={saving}
                className="border-secondary/40"
                required
              />
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={saving}
              >
                Batal
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
