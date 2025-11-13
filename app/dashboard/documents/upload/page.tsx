"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { documentAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Upload as UploadIcon } from "lucide-react";
import Link from "next/link";

export default function UploadDocumentPage() {
  const [sender, setSender] = useState("");
  const [subject, setSubject] = useState("");
  const [letterType, setLetterType] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!sender || !subject || !letterType || !file) {
      toast.error("Semua field wajib diisi!");
      return;
    }

    if (!user?.ID) {
      toast.error("User tidak terautentikasi");
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("sender", sender);
      formData.append("subject", subject);
      formData.append("letter_type", letterType);
      formData.append("user_id", user.ID.toString());
      formData.append("file", file);

      const response = await documentAPI.create(formData);

      toast.success("Dokumen berhasil diupload!", {
        description: response.message || "File telah tersimpan di Google Drive",
      });

      // Redirect setelah 1 detik
      setTimeout(() => {
        router.push("/dashboard/documents");
      }, 1000);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Gagal mengupload dokumen", {
        description:
          error instanceof Error ? error.message : "Terjadi kesalahan",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/documents">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Dokumen</h1>
          <p className="text-muted-foreground mt-2">
            Upload dokumen baru ke Google Drive
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadIcon className="h-5 w-5" />
            Form Upload Dokumen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="sender">Pengirim</Label>
              <Input
                id="sender"
                placeholder="Nama pengirim dokumen"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Subjek / Perihal</Label>
              <Textarea
                id="subject"
                placeholder="Masukkan subjek atau perihal dokumen"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="letter_type">Tipe Surat</Label>
              <Select value={letterType} onValueChange={setLetterType} required>
                <SelectTrigger id="letter_type">
                  <SelectValue placeholder="Pilih tipe surat..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masuk">Surat Masuk</SelectItem>
                  <SelectItem value="keluar">Surat Keluar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">File Dokumen</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                required
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
              />
              {file && (
                <p className="text-sm text-muted-foreground">
                  File: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading} className="flex-1">
                {loading ? (
                  <>
                    <Spinner className="mr-2" />
                    Mengupload...
                  </>
                ) : (
                  <>
                    <UploadIcon className="mr-2 h-4 w-4" />
                    Upload Dokumen
                  </>
                )}
              </Button>
              <Link href="/dashboard/documents">
                <Button type="button" variant="outline" disabled={loading}>
                  Batal
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
