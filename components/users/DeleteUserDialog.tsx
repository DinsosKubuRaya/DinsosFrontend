"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { User } from "@/types";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface DeleteUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToDelete: User | null;
  onConfirm: () => void;
  loading?: boolean;
}

export function DeleteUserDialog({
  open,
  onOpenChange,
  userToDelete,
  onConfirm,
  loading = false,
}: DeleteUserDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle>Hapus Pengguna?</AlertDialogTitle>
          <AlertDialogDescription>
            Apakah Anda yakin ingin menghapus user{" "}
            <span className="font-bold text-foreground">
              {userToDelete?.name}
            </span>
            ? Tindakan ini tidak dapat dibatalkan dan semua data terkait user
            ini akan hilang.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 sm:gap-0">
          <AlertDialogCancel disabled={loading} className="rounded-lg mt-0">
            Batal
          </AlertDialogCancel>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-lg bg-red-600 hover:bg-red-700"
          >
            {loading ? (
              <>
                <Spinner className="mr-2 h-4 w-4" />
                Menghapus...
              </>
            ) : (
              "Ya, Hapus Permanen"
            )}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
