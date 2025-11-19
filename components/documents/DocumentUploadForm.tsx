"use client";

import { useState } from "react";
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
import { Upload as UploadIcon } from "lucide-react";
import { toast } from "sonner";

interface DocumentUploadFormProps {
  onSubmit: (formData: FormData) => Promise<void>;
  loading: boolean;
  cancelHref: string;
}

export function DocumentUploadForm({
  onSubmit,
  loading,
  cancelHref,
}: DocumentUploadFormProps) {
  const [sender, setSender] = useState("");
  const [subject, setSubject] = useState("");
  const [letterType, setLetterType] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (selectedFile.size > maxSize) {
        toast.error("File terlalu besar", {
          description: "Ukuran maksimal file adalah 10MB",
        });
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sender || !subject || !letterType || !file) {
      toast.error("Semua field wajib diisi!");
      return;
    }

    const formData = new FormData();
    formData.append("sender", sender);
    formData.append("subject", subject);
    formData.append("letter_type", letterType);
    formData.append("file", file);

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="sender">Pengirim</Label>
        <Input
          id="sender"
          placeholder="Nama pengirim dokumen"
          value={sender}
          onChange={(e) => setSender(e.target.value)}
          required
          disabled={loading}
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
          disabled={loading}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="letter_type">Tipe Surat</Label>
        <Select
          value={letterType}
          onValueChange={setLetterType}
          required
          disabled={loading}
        >
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
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.xls,.xlsx,.ppt,.pptx"
          disabled={loading}
        />
        {file && (
          <p className="text-sm text-muted-foreground">
            File: {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Format: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG (Max 10MB)
        </p>
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
        <Link href={cancelHref}>
          <Button type="button" variant="outline" disabled={loading}>
            Batal
          </Button>
        </Link>
      </div>
    </form>
  );
}
