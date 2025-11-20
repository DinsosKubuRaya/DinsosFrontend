"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { documentAPI, getErrorMessage } from "@/lib/api";
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
import { ArrowLeft, Save, Loader2, Download, ShieldAlert } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

interface DocumentData {
  id: string;
  sender: string;
  subject: string;
  letter_type: "masuk" | "keluar";
  file_url?: string;
}

export default function AdminDocumentDetail() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const { isAdmin } = useAuth();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<DocumentData>({
    id: "",
    sender: "",
    subject: "",
    letter_type: "masuk",
  });

  // ✅ PROTEKSI: Redirect jika bukan admin
  useEffect(() => {
    if (!isAdmin) {
      toast.error("Anda tidak memiliki akses ke halaman ini");
      router.push("/dashboard");
    }
  }, [isAdmin, router]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const doc = await documentAPI.getById(id);

        if (doc) {
          setFormData({
            id: doc.id,
            sender: doc.sender || "",
            subject: doc.subject || "",
            letter_type: (doc.letter_type as "masuk" | "keluar") || "masuk",
            file_url: doc.file_url,
          });
        }
      } catch (error) {
        console.error("Gagal mengambil data:", error);
        toast.error("Gagal memuat data dokumen");
        router.back();
      } finally {
        setLoading(false);
      }
    };

    if (id && isAdmin) fetchData();
  }, [id, router, isAdmin]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (val: "masuk" | "keluar") => {
    setFormData((prev) => ({ ...prev, letter_type: val }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await documentAPI.update(id, {
        sender: formData.sender,
        subject: formData.subject,
        letter_type: formData.letter_type,
        file: file,
      });

      toast.success("Dokumen berhasil diperbarui!");
      router.push(`/dashboard/documents`);
    } catch (error: unknown) {
      console.error("Update error:", error);
      toast.error("Gagal memperbarui dokumen", {
        description: getErrorMessage(error),
      });
    } finally {
      setSaving(false);
    }
  };

  // ✅ Tampilkan loading atau halaman akses ditolak
  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center h-[400px] gap-4">
        <ShieldAlert className="h-16 w-16 text-destructive" />
        <h2 className="text-2xl font-bold">Akses Ditolak</h2>
        <p className="text-muted-foreground">Halaman ini hanya untuk admin</p>
        <Button onClick={() => router.push("/dashboard")}>
          Kembali ke Dashboard
        </Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-8 px-4 md:px-6 mx-auto">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Cepat Dokumen</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdate} className="space-y-4">
            {/* FILE INFO SAAT INI */}
            <div className="p-3 bg-muted/50 rounded-md border flex justify-between items-center mb-4">
              <div className="text-sm">
                <span className="text-muted-foreground block">
                  File Saat Ini:
                </span>
                <span className="font-medium truncate max-w-[200px] block">
                  {formData.file_url?.split("/").pop() || "Tidak ada nama"}
                </span>
              </div>
              {formData.file_url && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(formData.file_url, "_blank")}
                >
                  <Download className="mr-2 h-3 w-3" /> Cek
                </Button>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="sender">Pengirim</Label>
                <Input
                  id="sender"
                  value={formData.sender}
                  onChange={handleChange}
                  placeholder="Nama pengirim surat"
                  required
                  disabled={saving}
                  className="border-black/40"
                />
              </div>

              <div className="space-y-2">
                <Label>Jenis Surat</Label>
                <Select
                  value={formData.letter_type}
                  onValueChange={handleSelectChange}
                  disabled={saving}
                >
                  <SelectTrigger className="border-2 border-black/40 ">
                    <SelectValue placeholder="Pilih jenis" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masuk">Surat Masuk</SelectItem>
                    <SelectItem value="keluar">Surat Keluar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Judul / Subjek</Label>
              <Textarea
                id="subject"
                value={formData.subject}
                onChange={handleChange}
                rows={3}
                required
                disabled={saving}
                className="border-black/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Ganti File (Opsional)</Label>
              <Input
                id="file"
                type="file"
                onChange={(e) => {
                  if (e.target.files?.[0]) setFile(e.target.files[0]);
                }}
                className="cursor-pointer border-black/10"
                disabled={saving}
                accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.xls,.xlsx,.ppt,.pptx"
              />
              <p className="text-xs text-muted-foreground">
                Biarkan kosong jika tidak ingin mengganti file.
              </p>
            </div>

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
