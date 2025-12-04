"use client";

import { useRouter } from "next/navigation";
import { documentAPI, getErrorMessage } from "@/lib/api";
import { toast } from "sonner";
import { DocumentUploadForm } from "@/components/documents/DocumentUploadForm";
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

export default function DocumentUploadPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleUpload = async (formData: FormData) => {
    setLoading(true);
    try {
      await documentAPI.create(formData);
      toast.success("Dokumen berhasil diupload");
      router.push("/dashboard/documents");
    } catch (error) {
      toast.error("Gagal mengupload dokumen", {
        description: getErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="pl-0 hover:bg-transparent hover:text-primary gap-2"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Daftar
      </Button>

      <Card className="rounded-2xl shadow-sm border-border/60 overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-muted/20 px-8 py-6">
          <CardTitle className="text-xl font-bold">
            Upload Surat Dinas
          </CardTitle>
          <CardDescription>
            Tambahkan dokumen baru ke arsip dinas (dapat dilihat oleh semua
            staff).
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8">
          <DocumentUploadForm
            onSubmit={handleUpload}
            loading={loading}
            cancelHref="/dashboard/documents"
            isStaff={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}
