"use client";

import { ActivityLog } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Activity } from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale/id";

interface ActivityLogMobileListProps {
  logs: ActivityLog[];
}

export function ActivityLogMobileList({ logs }: ActivityLogMobileListProps) {
  const formatWaktu = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd MMM yyyy, HH:mm", {
        locale: id,
      });
    } catch {
      return dateString;
    }
  };

  if (logs.length === 0) {
    return (
      <div className="md:hidden text-center py-8 text-muted-foreground">
        Belum ada aktivitas.
      </div>
    );
  }

  return (
    <div className="md:hidden space-y-4">
      {logs.map((log) => (
        <Card key={log.id} className="overflow-hidden border shadow-sm">
          <CardContent className="p-4 space-y-3">
            {/* Header: User & Waktu */}
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <User className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="font-medium text-sm truncate">
                  {log.user_name || "User Tidak Dikenal"}
                </span>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                <Clock className="h-3 w-3" />
                {formatWaktu(log.created_at)}
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-primary shrink-0" />
                <Badge variant="secondary" className="text-xs">
                  {log.action}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {log.message}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
