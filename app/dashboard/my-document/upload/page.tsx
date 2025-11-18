"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { documentStaffAPI, getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Upload, Loader2, FileIcon } from "lucide-react";
import { toast } from "sonner";
import { Textarea } from "@/components/ui/textarea";

export default function UploadDocumentStaffPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    sender: "",
    subject: "",
    letter_type: "masuk" as "masuk" | "keluar",
    file: null as File | null,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
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

    if (!formData.file || !formData.subject.trim() || !formData.sender.trim()) {
      toast.error("Semua field wajib diisi");
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append("file", formData.file);
      data.append("sender", formData.sender.trim());
      data.append("subject", formData.subject.trim());
      data.append("letter_type", formData.letter_type);

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
    <div className="container max-w-3xl py-8 px-4 md:px-6">
      <div className="mb-6 flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          disabled={loading}
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Dokumen</h1>
          <p className="text-muted-foreground">
            Tambahkan dokumen surat baru ke arsip pribadi
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Form Upload</CardTitle>
          <CardDescription>
            Isi detail dokumen dan pilih file yang akan diupload.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* SENDER */}
              <div className="space-y-2">
                <Label htmlFor="sender">
                  Pengirim <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="sender"
                  placeholder="Contoh: Dinas Pendidikan / PT. Maju"
                  value={formData.sender}
                  onChange={(e) =>
                    setFormData({ ...formData, sender: e.target.value })
                  }
                  disabled={loading}
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
                  onValueChange={(value: "masuk" | "keluar") =>
                    setFormData({ ...formData, letter_type: value })
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
              </div>
            </div>

            {/* SUBJECT */}
            <div className="space-y-2">
              <Label htmlFor="subject">
                Subjek / Perihal <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="subject"
                rows={3}
                placeholder="Contoh: Undangan Rapat Koordinasi Akhir Tahun"
                value={formData.subject}
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                disabled={loading}
                required
              />
            </div>

            {/* FILE */}
            <div className="space-y-2">
              <Label htmlFor="file">
                File Dokumen <span className="text-destructive">*</span>
              </Label>
              <div className="border-2 border-dashed rounded-lg p-6 hover:bg-muted/50 transition-colors text-center cursor-pointer relative">
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                  disabled={loading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  required
                />
                <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <FileIcon className="h-10 w-10 text-muted-foreground/50" />
                  {formData.file ? (
                    <div className="text-center">
                      <p className="text-sm font-medium text-foreground">
                        {formData.file.name}
                      </p>
                      <p className="text-xs">
                        {(formData.file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium">
                        Klik untuk pilih file atau drag & drop
                      </p>
                      <p className="text-xs">
                        PDF, Word, Excel, Gambar (Max 10MB)
                      </p>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* ACTIONS */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Batal
              </Button>
              <Button type="submit" disabled={loading}>
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
        </CardContent>
      </Card>
    </div>
  );
}
