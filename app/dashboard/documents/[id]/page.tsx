"use client";

import { useEffect, useState, use } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { documentAPI, documentStaffAPI } from "@/lib/api";
import { Document, DocumentStaff } from "@/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Download,
  FileText,
  Calendar,
  User,
  Building,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";

export default function DocumentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const sourceParam = searchParams.get("source");

  const { user } = useAuth();
  const [document, setDocument] = useState<Document | DocumentStaff | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocument();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);

      if (sourceParam === "staff") {
        try {
          const res = await documentStaffAPI.getById(id);
          setDocument({ ...res, source: "staff" });
          return;
        } catch (e) {}
      }

      try {
        const response = await documentAPI.getById(id);
        setDocument({ ...response, source: "document" });
      } catch (err) {
        try {
          const staffResponse = await documentStaffAPI.getById(id);
          setDocument({ ...staffResponse, source: "staff" });
        } catch (innerErr) {
          throw innerErr;
        }
      }
    } catch (error) {
      toast.error("Gagal memuat dokumen");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!document) return;
    if (document.file_url) {
      window.open(document.file_url, "_blank");
    } else {
      toast.error("File tidak tersedia");
    }
  };

  if (loading)
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  if (!document)
    return (
      <div className="text-center py-10 text-muted-foreground">
        Dokumen tidak ditemukan
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="pl-0 hover:bg-transparent hover:text-primary gap-2"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali
      </Button>

      <Card className="rounded-3xl shadow-sm border-border/60 overflow-hidden">
        <div className="bg-muted/30 p-6 md:p-8 border-b border-border/40">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div className="space-y-3">
              <div className="flex gap-2">
                <Badge
                  variant={
                    document.letter_type === "masuk" ? "default" : "secondary"
                  }
                  className="rounded-full px-3"
                >
                  Surat {document.letter_type === "masuk" ? "Masuk" : "Keluar"}
                </Badge>
                <Badge
                  variant="outline"
                  className="rounded-full px-3 capitalize bg-background"
                >
                  {document.resource_type || "File"}
                </Badge>
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight">
                {document.subject}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                {new Date(document.created_at).toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
            <Button
              onClick={handleDownload}
              className="rounded-full px-6 shadow-md shadow-primary/20 h-12 text-base w-full md:w-auto"
            >
              <Download className="mr-2 h-5 w-5" /> Unduh File
            </Button>
          </div>
        </div>

        <CardContent className="p-6 md:p-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                <User className="h-4 w-4" /> Pengirim / Asal
              </h3>
              <p className="text-lg font-medium text-foreground">
                {document.sender || "-"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-2">
                <Building className="h-4 w-4" /> Pemilik Arsip
              </h3>
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                  {document.user?.name?.charAt(0) || "U"}
                </div>
                <div>
                  <p className="font-medium">{document.user?.name || "User"}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {document.user?.role || "Staff"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section */}
          <div className="bg-muted/20 rounded-2xl border border-border/50 p-1">
            {document.resource_type === "image" && document.file_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={document.file_url}
                alt="Preview"
                className="w-full h-auto rounded-xl object-contain max-h-[400px] md:max-h-[600px] bg-background"
              />
            ) : (
              <div className="py-16 flex flex-col items-center justify-center text-center gap-4 bg-background rounded-xl">
                <div className="h-20 w-20 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500">
                  <FileText className="h-10 w-10" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium">Pratinjau tidak tersedia</p>
                  <p className="text-sm text-muted-foreground">
                    Silakan unduh file untuk melihat isinya
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="mt-2 rounded-full"
                >
                  <ExternalLink className="mr-2 h-4 w-4" /> Buka di Tab Baru
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
