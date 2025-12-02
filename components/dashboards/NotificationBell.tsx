"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { notificationAPI } from "@/lib/api";
import { Notification } from "@/types";
import { Bell } from "lucide-react";
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
  const router = useRouter();
  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getAll();
      setNotifications(response.notifications || []);
      setUnreadCount(response.unread_count || 0);
    } catch (error: unknown) {
      console.warn("Gagal sync notifikasi (polling)");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.is_read) {
        await notificationAPI.markAsRead(notification.id);
        setUnreadCount((prev) => Math.max(0, prev - 1));
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, is_read: true } : n
          )
        );
      }

      setIsOpen(false);

      if (notification.link) {
        router.push(notification.link);
      }
    } catch (error) {
      toast.error("Gagal memproses notifikasi");
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-red-500 border-2 border-background animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 max-h-[400px] overflow-y-auto"
      >
        <DropdownMenuLabel className="flex justify-between items-center sticky top-0 bg-popover z-10 py-2">
          <span>Notifikasi</span>
          {unreadCount > 0 && (
            <span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount} Baru
            </span>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {isLoading && notifications.length === 0 ? (
          <div className="py-4 text-center text-sm text-muted-foreground">
            Memuat...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Tidak ada notifikasi baru
          </div>
        ) : (
          notifications.map((notif) => (
            <DropdownMenuItem
              key={notif.id}
              onClick={() => handleNotificationClick(notif)}
              className="flex flex-col items-start gap-1 cursor-pointer p-3 border-b last:border-0 focus:bg-accent"
            >
              <div className="flex w-full justify-between gap-2">
                <p
                  className={`text-sm leading-tight ${
                    !notif.is_read
                      ? "font-semibold text-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  {notif.message}
                </p>
                {!notif.is_read && (
                  <span className="h-2 w-2 mt-1 shrink-0 rounded-full bg-blue-500" />
                )}
              </div>
              <p className="text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(notif.created_at), {
                  addSuffix: true,
                  locale: id,
                })}
              </p>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
