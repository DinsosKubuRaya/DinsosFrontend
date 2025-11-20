"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface DocumentData {
  id: string;
  sender: string;
  subject: string;
  letter_type: string; // Backend pakai letter_type
  file_url?: string;
}

export default function AdminDocumentDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // State Form
  const [formData, setFormData] = useState<DocumentData>({
    id: "",
    sender: "",
    subject: "",
    letter_type: "masuk",
  });

  const [file, setFile] = useState<File | null>(null);

  // 1. Fetch Data Awal
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await api.get(`/documents/${id}`);
        const doc = response.data.data || response.data.document; // Handle struktur data backend

        if (doc) {
          setFormData({
            id: doc.id,
            sender: doc.sender || "",
            subject: doc.subject || "",
            letter_type: doc.letter_type || "masuk",
            file_url: doc.file_url,
          });
        }
      } catch (error) {
        console.error("Gagal mengambil data:", error);
        toast.error("Gagal memuat data dokumen");
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (val: string) => {
    setFormData((prev) => ({ ...prev, letter_type: val }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const dataToSend = new FormData();
      dataToSend.append("sender", formData.sender);
      dataToSend.append("subject", formData.subject);
      dataToSend.append("letter_type", formData.letter_type);

      if (file) {
        dataToSend.append("file", file);
      }

      await api.put(`/documents/${id}`, dataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Dokumen berhasil diperbarui!", {
        description: "Perubahan telah disimpan ke sistem.",
        duration: 3000,
      });

      router.push(`/dashboard`);
    } catch (error: unknown) {
      console.error("Update error:", error);

      const errMsg =
        error instanceof Error ? error.message : "Gagal menyimpan perubahan";

      toast.error("Gagal memperbarui dokumen", {
        description: errMsg,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Dokumen</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            {/* Input Pengirim (Wajib ada agar backend tidak error) */}
            <div className="space-y-2">
              <Label htmlFor="sender">Pengirim</Label>
              <Input
                id="sender"
                value={formData.sender}
                onChange={handleChange}
                placeholder="Nama pengirim surat"
                required
              />
            </div>

            {/* Input Subject */}
            <div className="space-y-2">
              <Label htmlFor="subject">Judul / Subjek</Label>
              <Textarea
                id="subject"
                value={formData.subject}
                onChange={handleChange}
                rows={3}
                required
              />
            </div>

            {/* Input Type */}
            <div className="space-y-2">
              <Label>Jenis Surat</Label>
              <Select
                value={formData.letter_type}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masuk">Surat Masuk</SelectItem>
                  <SelectItem value="keluar">Surat Keluar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Input File */}
            <div className="space-y-2">
              <Label htmlFor="file">Update File (Opsional)</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => {
                  if (e.target.files?.[0]) setFile(e.target.files[0]);
                }}
                className="cursor-pointer file:text-primary"
              />
              <p className="text-xs text-muted-foreground">
                {formData.file_url ? "File saat ini sudah ada. " : ""}
                Biarkan kosong jika tidak ingin mengganti file.
              </p>
            </div>

            {/* Tombol Action */}
            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={saving} className="min-w-[150px]">
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
