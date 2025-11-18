"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { documentStaffAPI, getErrorMessage } from "@/lib/api";
import { DocumentStaff } from "@/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Upload,
  FileText,
  Download,
  Trash2,
  Edit,
  Search,
  User as UserIcon,
  Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";

export default function MyDocumentPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentStaff[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentStaffAPI.getAll({ search });
      setDocuments(response.documents || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (doc: DocumentStaff) => {
    router.push(`/dashboard/my-document/${doc.id}/edit`);
  };

  const handleDownload = async (doc: DocumentStaff) => {
    try {
      if (!doc.file_name) {
        toast.error("URL file tidak ditemukan");
        return;
      }
      window.open(doc.file_name, "_blank");
      toast.success("Membuka file di tab baru");
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const handleDelete = async (id: string, fileName: string) => {
    if (
      !confirm(
        `Hapus dokumen "${fileName}"?\nTindakan ini tidak dapat dibatalkan.`
      )
    )
      return;

    try {
      await documentStaffAPI.delete(id);
      toast.success("Dokumen berhasil dihapus");
      fetchDocuments();
    } catch (error) {
      toast.error(getErrorMessage(error));
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Dokumen Staff</h1>
          <p className="text-muted-foreground">
            Kelola dokumen bersama tim staff
          </p>
        </div>
        <Link href="/dashboard/my-document/upload">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Dokumen
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama file atau subjek..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : documents.length === 0 ? (
        <Card className="p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {search ? "Tidak ada hasil" : "Belum ada dokumen"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {search
              ? "Coba kata kunci lain"
              : "Upload dokumen pertama untuk tim"}
          </p>
          {!search && (
            <Link href="/dashboard/my-document/upload">
              <Button>
                <Upload className="mr-2 h-4 w-4" />
                Upload Dokumen
              </Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="grid gap-4">
          {documents.map((doc) => (
            <Card
              key={doc.id}
              className="p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Document Info */}
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  <FileText className="h-10 w-10 text-primary flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate text-lg">
                      {doc.subject || "Tanpa Subjek"}
                    </h3>
                    <p className="text-sm text-muted-foreground truncate mb-2">
                      File: {doc.file_name?.split("/").pop() || "-"}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <UserIcon className="h-3 w-3" />
                        <span>{doc.user?.name || "Unknown"}</span>
                      </div>
                      <span>•</span>
                      <span>{formatDate(doc.created_at)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(doc)}
                    title="Edit dokumen"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDownload(doc)}
                    title="Buka file"
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(doc.id, doc.subject)}
                    title="Hapus dokumen"
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination info */}
      {!loading && documents.length > 0 && (
        <div className="mt-6 text-center text-sm text-muted-foreground">
          Menampilkan {documents.length} dokumen
        </div>
      )}
    </div>
  );
}
