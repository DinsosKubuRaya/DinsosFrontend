"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { documentStaffAPI, getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function UploadDocumentStaffPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    subject: "",
    file: null as File | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validasi ukuran file (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 10MB");
        e.target.value = "";
        return;
      }
      setFormData({ ...formData, file });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.file || !formData.subject.trim()) {
      toast.error("Semua field wajib diisi");
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append("file", formData.file);
      data.append("subject", formData.subject.trim());

      await documentStaffAPI.create(data);
      toast.success("Dokumen berhasil diupload");
      router.push("/dashboard/my-document");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
        disabled={loading}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali
      </Button>

      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Upload Dokumen Baru</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subject */}
          <div className="space-y-2">
            <Label htmlFor="subject">
              Subjek Dokumen <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject"
              placeholder="Contoh: Laporan Bulanan November 2025"
              value={formData.subject}
              onChange={(e) =>
                setFormData({ ...formData, subject: e.target.value })
              }
              disabled={loading}
              required
            />
            <p className="text-sm text-muted-foreground">
              Berikan judul yang jelas dan deskriptif
            </p>
          </div>

          {/* File */}
          <div className="space-y-2">
            <Label htmlFor="file">
              File Dokumen <span className="text-destructive">*</span>
            </Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
              disabled={loading}
              required
            />
            <p className="text-sm text-muted-foreground">
              Format: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG (Maksimal
              10MB)
            </p>
            {formData.file && (
              <p className="text-sm text-primary">
                File terpilih: {formData.file.name} (
                {(formData.file.size / 1024 / 1024).toFixed(2)} MB)
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
              className="flex-1"
            >
              Batal
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Mengupload...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Dokumen
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
