"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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
import { ArrowLeft, Save, Loader2, Eye, FileText } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditDocumentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();

  // ✅ Ambil source dari URL (?source=staff atau ?source=document)
  const source = searchParams.get("source");
  const isStaffDoc = source === "staff";

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
      try {
        setFetching(true);
        let data;

        // ✅ Logika Fetching Ganda (Admin vs Staff Doc)
        if (isStaffDoc) {
          data = await documentStaffAPI.getById(id);
        } else {
          data = await documentAPI.getById(id);
        }

        if (data) {
          setFormData({
            sender: data.sender || "-", // Dokumen staff tidak punya sender
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
          "Gagal memuat dokumen. Mungkin ID salah atau sudah dihapus."
        );
        router.push("/dashboard/documents");
      } finally {
        setFetching(false);
      }
    };

    fetchDoc();
  }, [id, isStaffDoc, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (val: "masuk" | "keluar") => {
    setFormData((prev) => ({ ...prev, letter_type: val }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.size > 10 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 10MB");
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
      if (!formData.subject) {
        toast.error("Perihal / Judul wajib diisi!");
        setLoading(false);
        return;
      }

      if (isStaffDoc) {
        await documentStaffAPI.update(id, {
          subject: formData.subject,
          sender: "-",
          letter_type: "masuk",
          file: file,
        });
      } else {
        // Update Dokumen Dinas (Full Fields)
        if (!formData.sender) {
          toast.error("Pengirim wajib diisi untuk dokumen dinas!");
          setLoading(false);
          return;
        }
        await documentAPI.update(id, {
          sender: formData.sender,
          subject: formData.subject,
          letter_type: formData.letter_type,
          file: file,
        });
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
            Edit {isStaffDoc ? "Dokumen Staff (Monitoring)" : "Arsip Dinas"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
            {/* FILE INFO */}
            <div className="p-4 bg-muted/40 rounded-lg border border-dashed flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <FileText className="h-8 w-8 text-primary/70" />
                <div className="flex flex-col min-w-0">
                  <span
                    className="text-sm font-medium truncate max-w-[180px] sm:max-w-[250px]"
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
                  onClick={() => window.open(formData.file_url, "_blank")}
                  className="shrink-0"
                >
                  <Eye className="mr-2 h-3.5 w-3.5" /> Lihat
                </Button>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="file_upload">Ganti File (Opsional)</Label>
              <Input
                id="file_upload"
                type="file"
                onChange={handleFileChange}
                className="cursor-pointer"
              />
            </div>

            {/* FIELD UNTUK ARSIP DINAS (Disembunyikan jika Dokumen Staff) */}
            {!isStaffDoc && (
              <div className="space-y-2">
                <Label htmlFor="sender">Pengirim / Instansi</Label>
                <Input
                  id="sender"
                  value={formData.sender}
                  onChange={handleChange}
                  required
                />
              </div>
            )}

            {/* SUBJECT (Semua Tipe Ada) */}
            <div className="space-y-2">
              <Label htmlFor="subject">Perihal / Judul Surat</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>

            {/* FIELD UNTUK ARSIP DINAS (Disembunyikan jika Dokumen Staff) */}
            {!isStaffDoc && (
              <div className="space-y-2">
                <Label>Jenis Surat</Label>
                <Select
                  value={formData.letter_type}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih tipe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="masuk">Surat Masuk</SelectItem>
                    <SelectItem value="keluar">Surat Keluar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <Button type="submit" disabled={loading} className="w-full mt-4 sm:mt-6">
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
