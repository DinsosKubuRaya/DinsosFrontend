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

// Import komponen untuk Disposisi
import { UserMultiSelect } from "@/components/superior-orders/UserMultiSelect";
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
  const [letterType, setLetterType] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // State untuk Disposisi (Hanya dipakai Admin)
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Fetch users hanya jika user BUKAN staff (alias Admin)
  useEffect(() => {
    if (!isStaff) {
      const fetchUsers = async () => {
        try {
          const data = await userAPI.getAll();
          // Filter hanya staff agar admin tidak mendisposisi ke sesama admin
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

    // Validasi khusus Admin
    if (!isStaff && (!sender || !letterType)) {
      toast.error("Semua field wajib diisi!");
      return;
    }

    const formData = new FormData();
    formData.append("subject", subject);
    formData.append("file", file);

    // Data tambahan khusus Admin
    if (!isStaff) {
      formData.append("sender", sender);
      formData.append("letter_type", letterType);

      // Masukkan data disposisi ke FormData jika ada staff yang dipilih
      if (selectedUserIds.length > 0) {
        formData.append("target_user_ids", selectedUserIds.join(","));
      }
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* FIELD KHUSUS ADMIN: PENGIRIM */}
      {!isStaff && (
        <div className="space-y-2">
          <Label htmlFor="sender">Pengirim</Label>
          <Input
            id="sender"
            placeholder="Nama pengirim dokumen"
            value={sender}
            onChange={(e) => setSender(e.target.value)}
            required={!isStaff}
            className="border-secondary/40"
            disabled={loading}
          />
        </div>
      )}

      {/* FIELD UMUM: SUBJEK */}
      <div className="space-y-2">
        <Label htmlFor="subject">Subjek / Perihal</Label>
        <Textarea
          id="subject"
          className="border-secondary/40"
          placeholder="Masukkan subjek atau perihal dokumen"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          required
          rows={3}
          disabled={loading}
        />
      </div>

      {/* FIELD KHUSUS ADMIN: TIPE SURAT & DISPOSISI */}
      {!isStaff && (
        <>
          <div className="space-y-2">
            <Label htmlFor="letter_type">Tipe Surat</Label>
            <Select
              value={letterType}
              onValueChange={setLetterType}
              required={!isStaff}
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

          {/* Bagian Disposisi - Hanya Muncul untuk Admin */}
          <div className="p-4 border rounded-lg bg-slate-50 space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-base font-semibold text-slate-700">
                Disposisi / Perintah ke Staff
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              Pilih staff di bawah ini untuk menjadikan dokumen ini sebagai
              Perintah Atasan.
            </p>
            <UserMultiSelect
              users={users}
              selectedUserIds={selectedUserIds}
              onChange={setSelectedUserIds}
            />
          </div>
        </>
      )}

      {/* FIELD UMUM: FILE UPLOAD */}
      <div className="space-y-2">
        <Label htmlFor="file">File Dokumen</Label>
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
        <p className="text-xs text-muted-foreground">
          Format: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, JPG, PNG (Max 10MB)
        </p>
      </div>

      {/* TOMBOL ACTION */}
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
              {/* Ubah teks tombol jika ada disposisi yang dipilih */}
              {!isStaff && selectedUserIds.length > 0
                ? "Upload & Kirim Perintah"
                : "Upload Dokumen"}
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
