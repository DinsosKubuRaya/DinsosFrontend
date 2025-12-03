"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { documentAPI, documentStaffAPI, getErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2, Eye, FileText, Upload } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditDocumentPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params?.id as string;
  const source = searchParams.get("source");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [file, setFile] = useState<File | null>(null);

  const [formData, setFormData] = useState<{
    sender: string;
    subject: string;
    letter_type: "masuk" | "keluar";
    file_url?: string;
    file_name?: string;
  }>({
    sender: "",
    subject: "",
    letter_type: "masuk",
    file_url: "",
    file_name: "",
  });

  useEffect(() => {
    const fetchDoc = async () => {
      if (!id) return;

      try {
        setFetching(true);
        let data;

        if (source === "staff") {
          data = await documentStaffAPI.getById(id);
        } else {
          data = await documentAPI.getById(id);
        }

        if (data) {
          setFormData({
            sender: data.sender || "",
            subject: data.subject || "",
            letter_type:
              data.letter_type?.toLowerCase() === "keluar" ? "keluar" : "masuk",
            file_url: data.file_url || "",
            file_name: data.file_name || "",
          });
        }
      } catch (error) {
        console.error("Error fetching document:", error);
        toast.error(
          "Gagal memuat data. ID tidak ditemukan atau akses ditolak."
        );
        router.push("/dashboard/documents");
      } finally {
        setFetching(false);
      }
    };

    fetchDoc();
  }, [id, source, router]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (val: "masuk" | "keluar") => {
    setFormData((prev) => ({ ...prev, letter_type: val }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        toast.error("Ukuran file terlalu besar (maks 10MB)");
        e.target.value = "";
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.sender || !formData.subject) {
        toast.error("Pengirim dan Perihal wajib diisi!");
        setLoading(false);
        return;
      }

      const updatePayload = {
        sender: formData.sender,
        subject: formData.subject,
        letter_type: formData.letter_type,
        file: file,
      };

      if (source === "staff") {
        await documentStaffAPI.update(id, updatePayload);
      } else {
        await documentAPI.update(id, updatePayload);
      }

      toast.success("Dokumen berhasil diperbarui!");
      router.push("/dashboard/documents");
    } catch (error) {
      console.error("Error updating:", error);
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
          <CardTitle>
            Edit Dokumen {source === "staff" ? "(Staff)" : "(Dinas)"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* FILE SECTION */}
            <div className="space-y-3">
              <Label>File Dokumen</Label>

              <div className="p-4 bg-muted/40 rounded-lg border border-dashed border-muted-foreground/25 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium truncate text-foreground/80 block max-w-[200px] sm:max-w-xs">
                      {formData.file_name || "File Tersimpan"}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      File saat ini
                    </span>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleViewOrDownload}
                  className="shrink-0 gap-2"
                  title="Lihat file saat ini"
                >
                  <Eye className="h-4 w-4" />
                  Lihat
                </Button>
              </div>

              <div className="pt-2">
                <Label
                  htmlFor="file_upload"
                  className="text-xs font-normal text-muted-foreground mb-2 block"
                >
                  Ganti file (Biarkan kosong jika tidak ingin mengubah):
                </Label>
                <Input
                  id="file_upload"
                  type="file"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.xlsx"
                  className="cursor-pointer border-black/20"
                />
                {file && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <Upload className="h-3 w-3" /> File terpilih: {file.name}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sender">
                Pengirim <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sender"
                value={formData.sender}
                onChange={handleChange}
                required
                className="border-black/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">
                Perihal / Subjek <span className="text-red-500">*</span>
              </Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                className="border-black/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="letter_type">Jenis Surat</Label>
              <Select
                value={formData.letter_type}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger className="border-black/20">
                  <SelectValue placeholder="Pilih jenis surat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masuk">Surat Masuk</SelectItem>
                  <SelectItem value="keluar">Surat Keluar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Simpan Perubahan
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
