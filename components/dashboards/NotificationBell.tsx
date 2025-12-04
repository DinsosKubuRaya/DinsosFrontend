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
      if (ws.current) ws.current.close();
      const socket = new WebSocket(wsUrl);

      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          toast.info("Notifikasi Baru", { description: data.message });
          fetchNotifications();
        } catch (e) {
          console.error("WS Parse Error", e);
        }
      };
      ws.current = socket;
    };

    connectWebSocket();
    return () => {
      if (ws.current) ws.current.close();
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
        if (!targetLink.startsWith("/")) targetLink = "/" + targetLink;
        if (!targetLink.startsWith("/dashboard"))
          targetLink = `/dashboard${targetLink}`;
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
      toast.success("Semua ditandai sudah dibaca");
    } catch (error) {
      toast.error("Gagal menandai");
    }
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative h-10 w-10 rounded-full hover:bg-muted/50 border border-transparent hover:border-border/50"
        >
          <Bell className="h-5 w-5 text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-destructive border-2 border-background shadow-sm animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 rounded-2xl shadow-xl border-border/60 p-0 overflow-hidden"
      >
        <DropdownMenuLabel className="flex justify-between items-center p-4 bg-muted/20 border-b border-border/40">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Notifikasi</span>
            {unreadCount > 0 && (
              <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded-full">
                {unreadCount} Baru
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs px-2 text-primary hover:text-primary hover:bg-primary/10 rounded-lg gap-1"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="h-3 w-3" />
              Baca Semua
            </Button>
          )}
        </DropdownMenuLabel>

        <div className="max-h-[350px] overflow-y-auto scrollbar-thin">
          {isLoading && notifications.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Memuat...
            </div>
          ) : notifications.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground flex flex-col items-center gap-2">
              <Bell className="h-8 w-8 opacity-20" />
              <span>Tidak ada notifikasi baru</span>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {notifications.map((notif) => (
                <DropdownMenuItem
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`
                    flex flex-col items-start gap-1 p-4 cursor-pointer focus:bg-muted/50 transition-colors
                    ${!notif.is_read ? "bg-primary/30" : ""}
                    `}
                >
                  <div className="flex w-full justify-between gap-3 items-start">
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
                      <span className="h-2 w-2 mt-1.5 shrink-0 rounded-full bg-primary shadow-sm" />
                    )}
                  </div>
                  <p className="text-[10px] text-muted-foreground/70 mt-1 font-medium">
                    {formatDistanceToNow(new Date(notif.created_at), {
                      addSuffix: true,
                      locale: id,
                    })}
                  </p>
                </DropdownMenuItem>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
