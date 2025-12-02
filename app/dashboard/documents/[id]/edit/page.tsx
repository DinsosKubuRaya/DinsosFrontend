"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { documentAPI, documentStaffAPI } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ArrowLeft, Save } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function EditDocumentPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const id = params.id as string;
  const source = searchParams.get("source");

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  const [formData, setFormData] = useState({
    sender: "",
    subject: "",
    letter_type: "masuk" as "masuk" | "keluar",
  });

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

        if (data) {
          setFormData({
            sender: data.sender || "",
            subject: data.subject || "",
            letter_type: data.letter_type || "masuk",
          });
        }
      } catch (error) {
        console.error("Error fetching document:", error);
        toast.error("Gagal memuat data dokumen");
        router.push("/dashboard/documents");
      } finally {
        setFetching(false);
      }
    };

    if (id) {
      fetchDocument();
    }
  }, [id, router, source]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: "masuk" | "keluar") => {
    setFormData((prev) => ({ ...prev, letter_type: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (source === "staff") {
        await documentStaffAPI.update(id, formData);
      } else {
        await documentAPI.update(id, formData);
      }

      toast.success("Dokumen berhasil diperbarui");
      router.push("/dashboard/documents");
    } catch (error) {
      console.error("Error updating document:", error);
      toast.error("Gagal memperbarui dokumen");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex items-center justify-center h-[50vh]">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kembali
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>
            Edit Dokumen {source === "staff" ? "(Staff)" : "(Dinsos)"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="sender">Pengirim</Label>
              <Input
                id="sender"
                name="sender"
                value={formData.sender}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subject">Perihal / Judul</Label>
              <Input
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="letter_type">Jenis Surat</Label>
              <Select
                value={formData.letter_type}
                onValueChange={handleSelectChange}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih jenis surat" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="masuk">Surat Masuk</SelectItem>
                  <SelectItem value="keluar">Surat Keluar</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Menyimpan...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Simpan Perubahan
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
