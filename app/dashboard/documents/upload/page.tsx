"use client";

import { useState, useEffect } from "react";
import { documentAPI, categoryAPI, getErrorMessage } from "@/lib/api";
import { Category } from "@/types";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ArrowLeft, Upload, FileText, AlertCircle } from "lucide-react";

export default function UploadDocumentPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    document_number: "",
    document_date: "",
    category_id: "",
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await categoryAPI.getAll();
      setCategories(response.data);
    } catch (error) {
      console.error("Error fetching categories:", error);
      setError("Gagal memuat daftar kategori.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!file) {
      setError("Pilih file terlebih dahulu");
      return;
    }

    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    if (file.size > MAX_FILE_SIZE) {
      setError("Ukuran file maksimal 10MB");
      return;
    }

    if (
      !formData.title ||
      !formData.document_number ||
      !formData.document_date ||
      !formData.category_id
    ) {
      setError("Harap isi semua field yang bertanda *");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append("title", formData.title);
      data.append("description", formData.description);
      data.append("document_number", formData.document_number);
      data.append("document_date", formData.document_date);
      data.append("category_id", formData.category_id);
      data.append("file", file);

      await documentAPI.create(data);

      toast.success("Dokumen berhasil diupload!", {
        description: `File ${file.name} telah berhasil diarsipkan.`,
      });

      // Arahkan kembali ke daftar dokumen
      router.push("/dashboard/documents");
    } catch (error: unknown) {
      console.error("Error uploading document:", error);
      const errorMessage = getErrorMessage(error);
      setError(errorMessage);
      toast.error("Upload Gagal", {
        description: `Terjadi kesalahan saat mengupload: ${errorMessage}`,
      });
      toast.error("Upload Gagal", {
        description: `Terjadi kesalahan saat mengupload: ${errorMessage}`,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

      if (selectedFile.size > MAX_FILE_SIZE) {
        setError("Ukuran file maksimal 10MB");
        setFile(null); // Reset file
        return;
      }
      setFile(selectedFile);
      setError("");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Upload Dokumen</h1>
          <p className="text-muted-foreground mt-2">
            Tambahkan dokumen baru ke sistem arsip
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informasi Dokumen</CardTitle>
          <CardDescription>
            Isi form di bawah ini untuk mengupload dokumen baru. Tanda (*) wajib
            diisi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Judul Dokumen *</Label>
              <Input
                id="title"
                required
                placeholder="Masukkan judul dokumen"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="document_number">Nomor Dokumen *</Label>
                <Input
                  id="document_number"
                  required
                  placeholder="Contoh: DOC-2024-001"
                  value={formData.document_number}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      document_number: e.target.value,
                    })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="document_date">Tanggal Dokumen *</Label>
                <Input
                  id="document_date"
                  type="date"
                  required
                  value={formData.document_date}
                  onChange={(e) =>
                    setFormData({ ...formData, document_date: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Kategori *</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) =>
                  setFormData({ ...formData, category_id: value })
                }
                required
              >
                <SelectTrigger id="category">
                  <SelectValue
                    placeholder={
                      categories.length > 0
                        ? "Pilih kategori"
                        : "Memuat kategori..."
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id.toString()}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Deskripsi</Label>
              <Textarea
                id="description"
                rows={4}
                placeholder="Masukkan deskripsi dokumen (opsional)"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="file">File Dokumen * (Max 10MB)</Label>
              <div className="relative">
                <Input
                  id="file"
                  type="file"
                  required
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                  className="cursor-pointer"
                />
              </div>
              {file && (
                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg mt-2">
                  <FileText className="h-5 w-5 text-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
            </div>

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
                    <Spinner className="mr-2 h-4 w-4" />
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
