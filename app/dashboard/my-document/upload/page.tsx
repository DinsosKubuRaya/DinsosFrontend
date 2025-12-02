"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { documentStaffAPI, getErrorMessage } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Upload as UploadIcon } from "lucide-react";
import { DocumentUploadForm } from "@/components/documents/DocumentUploadForm";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function UploadDocumentStaffPage() {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const handleUpload = async (formData: FormData) => {
    if (!user) return;
    setLoading(true);
    try {
      // Logika upload tetap di sini, Form memanggil ini via onSubmit
      const response = await documentStaffAPI.create(formData);
      toast.success("Dokumen berhasil diupload!", {
        description: response.message || "File telah tersimpan di arsip anda",
      });
      setTimeout(() => router.push("/dashboard/my-document"), 1500);
    } catch (error: unknown) {
      console.error("Upload Error:", error);
      toast.error("Gagal mengupload dokumen", {
        description: getErrorMessage(error),
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/my-document">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Upload Dokumen (Staff)
          </h1>
          <p className="text-muted-foreground mt-2">
            Upload dokumen baru ke Arsip Pribadi
          </p>
        </div>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UploadIcon className="h-5 w-5" />
            Form Upload Dokumen
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DocumentUploadForm
            onSubmit={handleUpload} // Menggunakan onSubmit, cocok dengan Form baru
            loading={loading}
            cancelHref="/dashboard/my-document"
            isStaff={true} // Mode Staff
          />
        </CardContent>
      </Card>
    </div>
  );
}
