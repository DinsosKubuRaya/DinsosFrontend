"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { documentStaffAPI, getErrorMessage } from "@/lib/api";
import { DocumentStaff } from "@/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Loader2, Download } from "lucide-react";
import { toast } from "sonner";

export default function EditDocumentStaffPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [document, setDocument] = useState<DocumentStaff | null>(null);
  const [formData, setFormData] = useState({
    sender: "",
    subject: "",
    letter_type: "masuk" as "masuk" | "keluar",
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
        sender: doc.sender || "",
        subject: doc.subject || "",
        letter_type: (doc.letter_type as "masuk" | "keluar") || "masuk",
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

    if (!formData.subject.trim() || !formData.sender.trim()) {
      toast.error("Sender dan Subjek wajib diisi");
      return;
    }

    try {
      setSaving(true);
      await documentStaffAPI.update(id, {
        sender: formData.sender.trim(),
        subject: formData.subject.trim(),
        letter_type: formData.letter_type,
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

  const handleSelectChange = (value: "masuk" | "keluar") => {
    setFormData((prev) => ({ ...prev, letter_type: value }));
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
    <div className="container max-w-3xl py-8 px-4 md:px-6">
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
            {/* FILE INFO (READ ONLY) */}
            <div className="p-4 bg-muted/50 rounded-lg border space-y-3">
              <Label className="text-muted-foreground">File Terlampir</Label>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-hidden">
                  <span className="font-medium truncate max-w-[200px] md:max-w-md">
                    {document.file_name?.split("/").pop() || "File"}
                  </span>
                </div>
                {document.file_name && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(document.file_name, "_blank")}
                  >
                    <Download className="mr-2 h-3 w-3" />
                    Cek File
                  </Button>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                *File tidak dapat diganti di menu edit. Hapus dan upload ulang
                jika file salah.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {/* SENDER */}
              <div className="space-y-2">
                <Label htmlFor="sender">
                  Pengirim <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="sender"
                  name="sender"
                  value={formData.sender}
                  onChange={handleFormChange}
                  disabled={saving}
                  required
                />
              </div>

              {/* LETTER TYPE */}
              <div className="space-y-2">
                <Label htmlFor="letter_type">
                  Jenis Surat <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.letter_type}
                  onValueChange={handleSelectChange}
                  disabled={saving}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih jenis surat" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masuk">Surat Masuk</SelectItem>
                    <SelectItem value="keluar">Surat Keluar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* SUBJECT */}
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
