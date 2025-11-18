"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { documentStaffAPI, getErrorMessage } from "@/lib/api";
import { DocumentStaff } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function EditDocumentStaffPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [document, setDocument] = useState<DocumentStaff | null>(null);
  const [subject, setSubject] = useState("");

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
      setSubject(doc.subject);
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

    if (!subject.trim()) {
      toast.error("Subjek wajib diisi");
      return;
    }

    try {
      setSaving(true);
      await documentStaffAPI.update(id, { subject: subject.trim() });
      toast.success("Dokumen berhasil diupdate");
      router.push("/dashboard/my-document");
    } catch (error) {
      console.error("Update error:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!document) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="mb-6"
        disabled={saving}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali
      </Button>

      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">Edit Dokumen</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Name (Read Only) */}
          <div className="space-y-2">
            <Label>Nama File</Label>
            <Input
              value={document.file_name?.split("/").pop() || "-"}
              disabled
              className="bg-muted"
            />
            <p className="text-sm text-muted-foreground">
              File tidak dapat diubah
            </p>
          </div>

          {/* Subject (Editable) */}
          <div className="space-y-2">
            <Label htmlFor="subject">
              Subjek Dokumen <span className="text-destructive">*</span>
            </Label>
            <Input
              id="subject"
              placeholder="Contoh: Laporan Bulanan November 2025"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              disabled={saving}
              required
            />
          </div>

          {/* Upload Info */}
          <div className="space-y-2">
            <Label>Informasi Upload</Label>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>Diupload oleh: {document.user?.name || "Unknown"}</p>
              <p>
                Tanggal:{" "}
                {new Date(document.created_at).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={saving}
              className="flex-1"
            >
              Batal
            </Button>
            <Button type="submit" disabled={saving} className="flex-1">
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
      </Card>
    </div>
  );
}
