"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { documentStaffAPI } from "@/lib/api";
import { Upload, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DocumentUploadFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

export function DocumentUploadForm({
  onSuccess,
  onCancel,
}: DocumentUploadFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sender: "",
    subject: "",
    letter_type: "masuk",
    file: null as File | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.file) {
      toast.error("Mohon pilih file dokumen (PDF/Gambar)");
      return;
    }

    setLoading(true);
    const form = new FormData();
    form.append("sender", formData.sender);
    form.append("subject", formData.subject);
    form.append("letter_type", formData.letter_type);
    form.append("file", formData.file);

    try {
      await documentStaffAPI.create(form);
      toast.success("Dokumen berhasil diupload!");
      onSuccess();
    } catch (error: unknown) {
      console.error(error);
      const msg =
        error instanceof Error ? error.message : "Gagal mengupload dokumen";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="sender">
          Pengirim / Asal Surat <span className="text-red-500">*</span>
        </Label>
        <Input
          id="sender"
          placeholder="Contoh: Dinas Kesehatan / Bagian Umum"
          value={formData.sender}
          onChange={(e) => setFormData({ ...formData, sender: e.target.value })}
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subject">
          Perihal / Subjek <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="subject"
          placeholder="Contoh: Laporan Kegiatan Bulanan..."
          value={formData.subject}
          onChange={(e) =>
            setFormData({ ...formData, subject: e.target.value })
          }
          required
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="letter_type">
          Jenis Surat <span className="text-red-500">*</span>
        </Label>
        <Select
          value={formData.letter_type}
          onValueChange={(val) =>
            setFormData({ ...formData, letter_type: val })
          }
          disabled={loading}
        >
          <SelectTrigger>
            <SelectValue placeholder="Pilih jenis surat" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="masuk">Surat Masuk</SelectItem>
            <SelectItem value="keluar">Surat Keluar</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-[10px] text-muted-foreground">
          *Wajib dipilih sesuai kategori arsip.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="file">
          File Dokumen <span className="text-red-500">*</span>
        </Label>
        <div className="border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition-colors text-center cursor-pointer relative">
          <Input
            id="file"
            type="file"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.jpeg,.png"
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={loading}
          />
          {formData.file ? (
            <div className="flex flex-col items-center gap-2 text-green-600">
              <CheckCircle2 className="h-8 w-8" />
              <span className="text-sm font-medium">{formData.file.name}</span>
              <span className="text-xs text-muted-foreground">
                {(formData.file.size / 1024 / 1024).toFixed(2)} MB
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <Upload className="h-8 w-8" />
              <span className="text-sm">
                Klik untuk upload atau drag & drop
              </span>
              <span className="text-xs">PDF, JPG, PNG (Max 10MB)</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex gap-3 pt-4 justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Batal
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? "Mengupload..." : "Simpan Dokumen"}
        </Button>
      </div>
    </form>
  );
}
