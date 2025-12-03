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
import { Upload as UploadIcon } from "lucide-react";
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

  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (!isStaff) {
      const fetchUsers = async () => {
        try {
          const data = await userAPI.getAll();
          const staffOnly = Array.isArray(data)
            ? data.filter((u) => u.role === "staff")
            : [];
          setUsers(staffOnly);
        } catch (error) {
          console.error("Gagal memuat daftar user:", error);
        }
      };
      fetchUsers();
    }
  }, [isStaff]);

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

    if (!subject || !file) {
      toast.error("Subjek dan File wajib diisi!");
      return;
    }

    // Validasi Sender hanya untuk Admin
    if (!isStaff && !sender) {
      toast.error("Pengirim wajib diisi!");
      return;
    }

    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("file", file);

    // Kirim field ini hanya jika bukan staff (Admin mode)
    // Staff tidak punya kolom ini di DB, jadi tidak perlu kirim
    if (!isStaff) {
      formData.append("sender", sender);
      formData.append("letter_type", letterType);

      if (selectedUserIds.length > 0) {
        formData.append("target_user_ids", selectedUserIds.join(","));
      }
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* FIELD PENGIRIM: Hanya Admin */}
      {!isStaff && (
        <div className="space-y-2">
          <Label htmlFor="sender">
            Pengirim / Asal Surat <span className="text-red-500">*</span>
          </Label>
          <Input
            id="sender"
            placeholder="Contoh: Dinas Kesehatan"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            required
            className="border-secondary/40"
            disabled={loading}
          />
        </div>
      )}

      {/* FIELD SUBJEK: Semua */}
      <div className="space-y-2">
        <Label htmlFor="subject">
          Subjek / Perihal <span className="text-red-500">*</span>
        </Label>
        <Textarea
          id="subject"
          className="border-secondary/40"
          placeholder="Masukkan keterangan dokumen..."
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          rows={3}
          disabled={loading}
        />
      </div>

      {/* FIELD TIPE SURAT: Hanya Admin */}
      {!isStaff && (
        <div className="space-y-2">
          <Label htmlFor="letter_type">
            Tipe Surat <span className="text-red-500">*</span>
          </Label>
          <Select
            value={letterType}
            onValueChange={setLetterType}
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
      )}

      {/* FIELD FILE UPLOAD */}
      <div className="space-y-2">
        <Label htmlFor="file">
          File Dokumen <span className="text-red-500">*</span>
        </Label>
        <Input
          id="file"
          type="file"
          onChange={handleFileChange}
          required
          accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.xls,.xlsx,.ppt,.pptx"
          disabled={loading}
          className="border-secondary/40 text-gray-500"
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
              {!isStaff ? "Upload & Kirim" : "Simpan Dokumen"}
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
