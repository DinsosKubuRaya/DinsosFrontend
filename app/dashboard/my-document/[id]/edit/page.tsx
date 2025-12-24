"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { documentStaffAPI, getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, FileText, Eye } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditMyDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<{
    subject: string;
    file_url?: string;
    file_name?: string;
  }>({
    subject: "",
    file_url: "",
    file_name: "",
  });

  useEffect(() => {
    const fetchDoc = async () => {
      try {
        setFetching(true);
        const data = await documentStaffAPI.getById(id);
        if (data) {
          setFormData({
            subject: data.subject || "",
            file_url: data.file_url || "",
            file_name: data.file_name || "",
          });
        }
      } catch (error) {
        toast.error("Gagal memuat data dokumen.");
        router.push("/dashboard/my-document");
      } finally {
        setFetching(false);
      }
    };

    if (id) fetchDoc();
  }, [id, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, subject: e.target.value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("Maksimal 10MB");
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.subject) {
        toast.error("Judul dokumen wajib diisi");
        setLoading(false);
        return;
      }

      const updatePayload = {
        subject: formData.subject,
        sender: "-",
        letter_type: "masuk" as const,
        file: file,
      };

      await documentStaffAPI.update(id, updatePayload);

      toast.success("Dokumen berhasil diperbarui!");
      router.push("/dashboard/my-document");
    } catch (error) {
      toast.error("Gagal update dokumen", {
        description: getErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewOrDownload = () => {
    if (formData.file_url) {
      window.open(formData.file_url, "_blank");
    } else {
      toast.error("File tidak tersedia atau link rusak.");
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit Dokumen Saya</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* FILE INFO */}
            <div className="p-4 bg-muted/40 rounded-lg border border-dashed flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="h-8 w-8 text-primary/70" />
                <div className="flex flex-col min-w-0">
                  <span
                    className="text-sm font-medium truncate max-w-[200px]"
                    title={formData.file_name}
                  >
                    {formData.file_name || "File Lama"}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    File Saat Ini
                  </span>
                </div>
              </div>
              {formData.file_url && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleViewOrDownload}
                >
                  <Eye className="mr-2 h-3.5 w-3.5" /> Lihat
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">Ganti File (Opsional)</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>

            {/* SUBJECT FIELD */}
            <div className="space-y-2">
              <Label htmlFor="subject">Judul / Keterangan Dokumen</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                placeholder="Contoh: Laporan Bulanan"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full mt-4">
              {loading ? (
                <Loader2 className="animate-spin mr-2" />
              ) : (
                <Save className="mr-2 h-4 w-4" />
              )}
              Simpan Perubahan
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
