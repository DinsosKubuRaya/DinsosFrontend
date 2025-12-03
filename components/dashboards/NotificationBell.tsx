"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { notificationAPI } from "@/lib/api";
import { Notification } from "@/types";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { useAuth } from "@/context/AuthContext";

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const ws = useRef<WebSocket | null>(null);
  const fetchNotifications = async () => {
    try {
      const response = await notificationAPI.getAll();
      setNotifications(response.notifications || []);
      setUnreadCount(response.unread_count || 0);
    } catch (error) {
      console.warn("Gagal mengambil notifikasi");
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);
  useEffect(() => {
    if (!user) return;
    const apiUrl =
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";
    const wsBaseUrl = apiUrl.replace("http", "ws").replace("/api", "");
    const wsUrl = `${wsBaseUrl}/ws/notifications?user_id=${user.ID || user.id}`;

    const connectWebSocket = () => {
      if (ws.current) {
        ws.current.close();
      }

      console.log("Menghubungkan ke WebSocket:", wsUrl);
      const socket = new WebSocket(wsUrl);

      socket.onopen = () => {
        console.log(" WebSocket Terhubung");
      };

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          toast.info("Notifikasi Baru", {
            description: data.message || "Anda menerima notifikasi baru.",
          });
          fetchNotifications();
        } catch (e) {
          console.error("Error parsing WS message", e);
        }
      };

      socket.onclose = () => {
        console.log(" WebSocket Terputus");
      };
      ws.current = socket;
    };
    connectWebSocket();
    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [user]);

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
        let targetLink = notification.link;
        if (!targetLink.startsWith("/")) {
          targetLink = "/" + targetLink;
        }
        if (!targetLink.startsWith("/dashboard")) {
          targetLink = `/dashboard${targetLink}`;
        }
        console.log("Redirecting to:", targetLink);
        router.push(targetLink);
      }
    } catch (error) {
      toast.error("Gagal memproses notifikasi");
    }
  };

  const handleMarkAllRead = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (unreadCount === 0) return;

    try {
      await notificationAPI.markAllAsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      toast.success("Semua notifikasi ditandai sudah dibaca");
    } catch (error) {
      toast.error("Gagal menandai semua dibaca");
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
        <DropdownMenuLabel className="flex justify-between items-center sticky top-0 bg-popover z-10 py-2 border-b">
          <div className="flex items-center gap-2">
            <span>Notifikasi</span>
            {unreadCount > 0 && (
              <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} Baru
              </span>
            )}
          </div>

          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 text-[10px] px-2 text-muted-foreground hover:text-primary"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="mr-1 h-3 w-3" />
              Tandai dibaca
            </Button>
          )}
        </DropdownMenuLabel>

        {isLoading && notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
            Memuat...
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Tidak ada notifikasi baru
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`
                  flex flex-col items-start gap-1 cursor-pointer p-3 focus:bg-accent
                  ${!notif.is_read ? "bg-muted/30" : ""}
                `}
              >
                <div className="flex w-full justify-between gap-2 items-start">
                  <p
                    className={`text-sm leading-snug ${
                      !notif.is_read
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground"
                    }`}
                  >
                    {notif.message}
                  </p>
                  {!notif.is_read && (
                    <span className="h-2 w-2 mt-1.5 shrink-0 rounded-full bg-blue-500" />
                  )}
                </div>
                <p className="text-[10px] text-muted-foreground/80 mt-1">
                  {formatDistanceToNow(new Date(notif.created_at), {
                    addSuffix: true,
                    locale: id,
                  })}
                </p>
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
