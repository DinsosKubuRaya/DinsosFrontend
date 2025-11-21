"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { UserMultiSelect } from "./UserMultiSelect";
import { userAPI, superiorOrderAPI } from "@/lib/api";
import { User } from "@/types";
import { toast } from "sonner";
import { Send } from "lucide-react";

interface CreateOrderDialogProps {
  documentId: string;
  onSuccess?: () => void;
}

export function CreateOrderDialog({
  documentId,
  onSuccess,
}: CreateOrderDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (open) {
      const fetchUsers = async () => {
        try {
          const allUsers = await userAPI.getAll();
          const staffOnly = allUsers.filter((u) => u.role === "staff");
          setUsers(staffOnly);
        } catch (error: unknown) {
          toast.error(
            error instanceof Error ? error.message : "Gagal memuat daftar user"
          );
        }
      };
      fetchUsers();
    }
  }, [open]);

  const handleSubmit = async () => {
    if (selectedUserIds.length === 0) {
      toast.warning("Pilih minimal satu staff");
      return;
    }

    setLoading(true);
    try {
      await superiorOrderAPI.create({
        document_id: documentId,
        user_ids: selectedUserIds,
      });
      toast.success("Berhasil mendisposisikan dokumen!");
      setOpen(false);
      setSelectedUserIds([]);
      if (onSuccess) onSuccess();
    } catch (error: unknown) {
      toast.error(
        error instanceof Error ? error.message : "Gagal mengirim disposisi"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Send className="h-4 w-4" />
          Disposisi / Perintah Atasan
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Disposisi Dokumen</DialogTitle>
          <DialogDescription>
            Pilih staff yang akan menerima dokumen ini sebagai perintah atasan.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="staff">Pilih Staff Penerima</Label>
            <UserMultiSelect
              users={users}
              selectedUserIds={selectedUserIds}
              onChange={setSelectedUserIds}
            />
            <p className="text-sm text-muted-foreground">
              {selectedUserIds.length} staff dipilih.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Mengirim..." : "Kirim Disposisi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
