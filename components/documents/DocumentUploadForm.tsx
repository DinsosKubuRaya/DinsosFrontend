"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
import { Spinner } from "@/components/ui/spinner";
import { Upload as UploadIcon, FileText, X } from "lucide-react";
import { toast } from "sonner";
import { userAPI } from "@/lib/api";
import { User } from "@/types";

interface DocumentUploadFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  loading: boolean;
  cancelHref: string;
  isStaff?: boolean;
}

export function DocumentUploadForm({
  onSubmit,
  loading,
  cancelHref,
  isStaff = false,
}: DocumentUploadFormProps) {
  const [sender, setSender] = useState("");
  const [subject, setSubject] = useState("");
  const [letterType, setLetterType] = useState("masuk");
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        toast.error("File terlalu besar", {
          description: "Ukuran maksimal file adalah 10MB",
        });
        e.target.value = "";
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!subject || !file) {
      toast.error("Subjek dan File wajib diisi!");
      return;
    }

    if (!isStaff && !sender) {
      toast.error("Pengirim wajib diisi!");
      return;
    }

    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("file", file);

    if (!isStaff) {
      formData.append("sender", sender);
      formData.append("letter_type", letterType);
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Kolom Kiri: Input Text */}
        <div className="space-y-5">
          {/* FIELD PENGIRIM: Hanya Admin */}
          {!isStaff && (
            <div className="space-y-2">
              <Label
                htmlFor="sender"
                className="text-sm font-medium text-foreground/80"
              >
                Pengirim / Asal Surat <span className="text-red-500">*</span>
              </Label>
              <Input
                id="sender"
                placeholder="Contoh: Dinas Kesehatan"
                value={sender}
                onChange={(e) => setSender(e.target.value)}
                required
                disabled={loading}
                className="h-11 rounded-lg border-border/60 focus:border-primary"
              />
            </div>
          )}

          {/* FIELD TIPE SURAT: Hanya Admin */}
          {!isStaff && (
            <div className="space-y-2">
              <Label
                htmlFor="letter_type"
                className="text-sm font-medium text-foreground/80"
              >
                Tipe Surat <span className="text-red-500">*</span>
              </Label>
              <Select
                value={letterType}
                onValueChange={setLetterType}
                disabled={loading}
              >
                <SelectTrigger
                  id="letter_type"
                  className="h-11 rounded-lg border-border/60"
                >
                  <SelectValue placeholder="Pilih tipe surat..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masuk">Surat Masuk</SelectItem>
                  <SelectItem value="keluar">Surat Keluar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* FIELD SUBJEK: Semua */}
          <div className="space-y-2">
            <Label
              htmlFor="subject"
              className="text-sm font-medium text-foreground/80"
            >
              Subjek / Perihal <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="subject"
              placeholder="Masukkan keterangan dokumen..."
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
              rows={4}
              disabled={loading}
              className="resize-none rounded-lg border-border/60 focus:border-primary min-h-[120px]"
            />
          </div>
        </div>

        {/* Kolom Kanan: Upload File Area */}
        <div className="space-y-2">
          <Label
            htmlFor="file"
            className="text-sm font-medium text-foreground/80"
          >
            File Dokumen <span className="text-red-500">*</span>
          </Label>

          <div
            className={`
                relative border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center transition-colors
                ${
                  file
                    ? "border-primary/50 bg-primary/5"
                    : "border-border hover:border-primary/50 hover:bg-muted/30"
                }
            `}
          >
            {!file ? (
              <>
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <UploadIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium text-foreground">
                  Klik untuk upload file
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  PDF, DOCX, JPG (Max 10MB)
                </p>
                <Input
                  id="file"
                  type="file"
                  onChange={handleFileChange}
                  required
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.xls,.xlsx,.ppt,.pptx"
                  disabled={loading}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </>
            ) : (
              <div className="flex flex-col items-center w-full">
                <div className="h-12 w-12 rounded-lg bg-white border shadow-sm flex items-center justify-center mb-3">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <p className="text-sm font-medium text-foreground max-w-full truncate px-4">
                  {file.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {(file.size / 1024).toFixed(2)} KB
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveFile}
                  className="mt-3 text-red-600 hover:text-red-700 hover:bg-red-50 h-8 text-xs"
                >
                  <X className="mr-1 h-3 w-3" /> Ganti File
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-6 border-t border-border/40">
        <Link href={cancelHref}>
          <Button
            type="button"
            variant="ghost"
            disabled={loading}
            className="px-6 text-muted-foreground hover:text-foreground"
          >
            Batal
          </Button>
        </Link>
        <Button
          type="submit"
          disabled={loading}
          className="px-8 rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all"
        >
          {loading ? (
            <>
              <Spinner className="mr-2 h-4 w-4" />
              Mengupload...
            </>
          ) : (
            <>
              <UploadIcon className="mr-2 h-4 w-4" />
              {isStaff ? "Simpan Dokumen" : "Upload Dokumen"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
