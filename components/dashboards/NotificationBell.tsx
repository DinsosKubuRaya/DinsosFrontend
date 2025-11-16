"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { notificationAPI } from "@/lib/api";
import { Notification } from "@/types";
import { Bell, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";

export function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log("🔔 Fetching notifications...");

      const response = await notificationAPI.getAll();
      console.log("✅ Notifications loaded:", response);

      setNotifications(response.notifications || []);
      setUnreadCount(response.unread_count || 0);
    } catch (error: unknown) {
      console.error("Gagal mengambil notifikasi:", error);

      // Jangan tampilkan toast error jika 401 (sudah di-handle oleh interceptor)
      if (
        (error as unknown as { response?: { status?: number } }).response
          ?.status !== 401
      ) {
        setError("Gagal mengambil notifikasi");
        toast.error("Gagal mengambil notifikasi");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;

    const loadNotifications = async () => {
      if (isMounted) {
        await fetchNotifications();
      }
    };

    loadNotifications();

    // Polling setiap 60 detik (only if mounted)
    const interval = setInterval(() => {
      if (isMounted) {
        fetchNotifications();
      }
    }, 60000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.is_read) {
        await notificationAPI.markAsRead(notification.id);
        setUnreadCount((prev) => (prev > 0 ? prev - 1 : 0));
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
      }

      setIsOpen(false);

      // Navigate ke link notifikasi
      if (notification.link) {
        router.push(notification.link);
      }
    } catch (error) {
      console.error("❌ Gagal memproses notifikasi:", error);
      toast.error("Gagal memproses notifikasi");
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
          Notifikasi
          {unreadCount > 0 && (
            <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading ? (
          <DropdownMenuItem disabled>Memuat notifikasi...</DropdownMenuItem>
        ) : error ? (
          <DropdownMenuItem disabled className="text-destructive">
            {error}
          </DropdownMenuItem>
        ) : notifications.length === 0 ? (
          <DropdownMenuItem disabled>
            Tidak ada notifikasi baru
          </DropdownMenuItem>
        ) : (
          notifications.map((notif) => (
            <DropdownMenuItem
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className="flex items-start gap-2 cursor-pointer hover:bg-accent"
            >
              <div className="flex-1 space-y-1">
                <p
                  className={`text-sm ${
                    !notif.is_read ? "font-semibold" : "text-muted-foreground"
                  }`}
                >
                  {notif.message}
                </p>
                <p className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(notif.created_at), {
                    addSuffix: true,
                    locale: id,
                  })}
                </p>
              </div>
              {!notif.is_read && (
                <div className="h-2 w-2 mt-1.5 rounded-full bg-blue-500" />
              )}
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
