"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area"; // Pastikan punya ini atau ganti div biasa
import { userAPI, superiorOrderAPI } from "@/lib/api";
import { User } from "@/types";
import { toast } from "sonner";
import { Users, Send, Search } from "lucide-react";

interface DisposisiDialogProps {
  documentId: string;
  onSuccess?: () => void;
}

export function DisposisiDialog({
  documentId,
  onSuccess,
}: DisposisiDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  // Load data staff saat dialog dibuka
  useEffect(() => {
    if (open) {
      const fetchUsers = async () => {
        try {
          const data = await userAPI.getAll();
          // Filter hanya staff, admin tidak perlu diperintah
          const staffOnly = Array.isArray(data)
            ? data.filter((u) => u.role === "staff")
            : [];
          setUsers(staffOnly);
        } catch (error) {
          console.error(error);
          toast.error("Gagal memuat daftar staff");
        }
      };
      fetchUsers();
    }
  }, [open]);

  // Handle Checkbox
  const toggleUser = (userId: string) => {
    setSelectedUserIds(
      (prev) =>
        prev.includes(userId)
          ? prev.filter((id) => id !== userId) // Hapus jika sudah ada
          : [...prev, userId] // Tambah jika belum ada
    );
  };

  // Filter User berdasarkan Search
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Submit ke API
  const handleSubmit = async () => {
    if (selectedUserIds.length === 0) {
      toast.warning("Pilih minimal satu staff untuk diperintah/ditugaskan.");
      return;
    }

    setLoading(true);
    try {
      await superiorOrderAPI.create({
        document_id: documentId,
        user_ids: selectedUserIds,
      });

      toast.success("Perintah berhasil dikirim ke staff terpilih!");
      setOpen(false);
      setSelectedUserIds([]); // Reset pilihan
      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Gagal mengirim disposisi"
      );
    } finally {
      setLoading(false);
    }
  };

  // Ambil ID user (handle perbedaan huruf besar/kecil dari backend)
  const getID = (u: User) => u.id || u.ID || "";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2">
          <Send className="h-4 w-4" />
          Buat Perintah / Disposisi
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Pilih Staff Pelaksana</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Cari nama staff..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Daftar Staff dengan Checkbox */}
          <div className="border rounded-md p-2 h-[300px] overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {users.length === 0
                  ? "Memuat data..."
                  : "Staff tidak ditemukan."}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredUsers.map((user) => {
                  const uid = getID(user);
                  const isSelected = selectedUserIds.includes(uid);

                  return (
                    <div
                      key={uid}
                      onClick={() => toggleUser(uid)}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer border transition-colors ${
                        isSelected
                          ? "bg-blue-50 border-blue-500"
                          : "hover:bg-slate-50 border-transparent"
                      }`}
                    >
                      <div
                        className={`h-5 w-5 rounded border flex items-center justify-center ${
                          isSelected
                            ? "bg-blue-600 border-blue-600"
                            : "border-gray-300 bg-white"
                        }`}
                      >
                        {isSelected && (
                          <span className="text-white text-xs">✓</span>
                        )}
                      </div>

                      <div className="flex-1">
                        <p className="font-medium text-sm">{user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          @{user.username}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="text-sm text-muted-foreground text-right">
            {selectedUserIds.length} staff dipilih
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || selectedUserIds.length === 0}
          >
            {loading ? "Mengirim..." : "Kirim Perintah"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
