"use client";
import { useEffect, useState } from "react";
import { documentAPI } from "@/lib/api";
import { Document } from "@/types";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, Eye, Trash2, Search, Filter, FileText } from "lucide-react";
import { toast } from "sonner";

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [letterTypeFilter, setLetterTypeFilter] = useState<string>("all");

  useEffect(() => {
    fetchDocuments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [letterTypeFilter, search]);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const params: { letter_type?: string; search?: string } = {};

      if (letterTypeFilter && letterTypeFilter !== "all") {
        params.letter_type = letterTypeFilter;
      }
      if (search) {
        params.search = search;
      }

      // Response dari API
      const response = await documentAPI.getAll(params);
      setDocuments(response.documents || []);
    } catch (error) {
      console.error("Error fetching documents:", error);
      toast.error("Gagal memuat dokumen");
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus dokumen ini?")) return;

    try {
      await documentAPI.delete(id);
      toast.success("Dokumen berhasil dihapus");
      fetchDocuments();
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Gagal menghapus dokumen");
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dokumen Surat</h1>
          <p className="text-muted-foreground mt-2">
            Kelola surat masuk dan surat keluar
          </p>
        </div>
        <Link href="/dashboard/documents/upload">
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Dokumen
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filter & Pencarian
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Cari Dokumen</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Cari berdasarkan pengirim, subjek, nama file..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="letter_type">Filter Tipe Surat</Label>
              <Select
                value={letterTypeFilter}
                onValueChange={setLetterTypeFilter}
              >
                <SelectTrigger id="letter_type">
                  <SelectValue placeholder="Semua Tipe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Tipe</SelectItem>
                  <SelectItem value="masuk">Surat Masuk</SelectItem>
                  <SelectItem value="keluar">Surat Keluar</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documents Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
              <p>Tidak ada dokumen ditemukan</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pengirim</TableHead>
                    <TableHead>Subjek</TableHead>
                    <TableHead>Nama File</TableHead>
                    <TableHead>Tipe Surat</TableHead>
                    <TableHead>Diupload Oleh</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documents.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell className="font-medium">
                        {doc.sender || "-"}
                      </TableCell>
                      <TableCell>{doc.subject || "-"}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {doc.file_name || "-"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            doc.letter_type === "masuk"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {doc.letter_type === "masuk"
                            ? "Surat Masuk"
                            : "Surat Keluar"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {doc.user_name || doc.user?.name || "-"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(doc.created_at)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/dashboard/documents/${doc.id}`}>
                            <Button variant="ghost" size="icon">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(doc.id.toString())} // Konversi ke string jika id adalah number
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
