"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { documentAPI, documentStaffAPI } from "@/lib/api";
import { Document, DocumentStaff } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, Calendar, FileText, User, Download } from "lucide-react";

export default function DocumentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const source = searchParams.get("source");

  const [document, setDocument] = useState<Document | DocumentStaff | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        let data;
        if (source === "staff") {
          const response = await documentStaffAPI.getById(id);
          data = response;
        } else {
          const response = await documentAPI.getById(id);
          data = response;
        }
        setDocument(data);
      } catch (error) {
        console.error("Error fetching document:", error);
        toast.error("Gagal memuat detail dokumen");
        router.push("/dashboard/documents");
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDocument();
    }
  }, [id, router, source]);

  const handleDownload = async () => {
    if (!document) return;
    try {
      if (source === "staff") {
        await documentStaffAPI.download(document.id);
      } else {
        await documentAPI.download(document.id);
      }
      toast.success("Mulai mengunduh...");
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Gagal mengunduh file");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!document) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali
      </Button>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
            <div>
              <CardTitle className="text-2xl font-bold wrap-break-word">
                {document.subject}
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Pengirim:{" "}
                <span className="font-semibold">{document.sender}</span>
              </p>
            </div>

            <Badge
              variant={
                document.letter_type === "masuk" ? "default" : "secondary"
              }
              className="capitalize w-fit"
            >
              Surat {document.letter_type}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-1">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-2 h-4 w-4" />
                Tanggal Upload
              </div>
              <p className="font-medium">
                {new Date(document.created_at).toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>

            {/* Tampilkan Info Uploader jika ini dokumen staff */}
            {source === "staff" && (
              <div className="space-y-1">
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="mr-2 h-4 w-4" />
                  ID Pengunggah
                </div>
                <p className="font-medium">
                  {(document as DocumentStaff).user_id}
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <h3 className="text-sm font-medium mb-2 flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              File Lampiran
            </h3>
            <div className="flex items-center justify-between p-3 bg-muted rounded-md">
              <span className="text-sm truncate max-w-[200px] sm:max-w-md">
                {document.file_name}
              </span>
              <Button size="sm" onClick={handleDownload}>
                <Download className="mr-2 h-4 w-4" />
                Unduh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
