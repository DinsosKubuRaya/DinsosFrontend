"use client";

import React, { useEffect, useState } from "react";
import { activityLogAPI } from "@/lib/api";
import { ActivityLog } from "@/types";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ChevronLeft, ChevronRight } from "lucide-react";
import { ActivityLogTable } from "@/components/activity/ActivityLogTable";
import { ActivityLogMobileList } from "@/components/activity/ActivityLogMobileList";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function fetchLogs() {
    setIsLoading(true);
    try {
      const response = await activityLogAPI.getAll(page, limit);

      setLogs(response.data);
      setTotal(response.total);
    } catch (error) {
      toast.error("Gagal memuat log aktivitas");
    } finally {
      setIsLoading(false);
    }
  }

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
          Log Aktivitas
        </h1>
        <p className="text-muted-foreground text-sm">
          Memantau semua tindakan yang terjadi dalam sistem.
        </p>
      </div>

      <Card className="rounded-2xl border-border/60 shadow-sm bg-card overflow-hidden">
        <CardHeader className="border-b border-border/40 bg-muted/20 py-4 px-6">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Activity className="h-5 w-5 text-primary" />
            Riwayat Aktivitas
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Spinner className="h-8 w-8 text-primary" />
            </div>
          ) : (
            <>
              {/* Tampilan Desktop */}
              <div className="hidden md:block">
                <ActivityLogTable logs={logs} />
              </div>

              {/* Tampilan Mobile */}
              <div className="block md:hidden p-4">
                <ActivityLogMobileList logs={logs} />
              </div>

              {/* --- PAGINATION CONTROLS --- */}
              <div className="flex items-center justify-between p-4 border-t border-border/40 bg-muted/10">
                <p className="text-xs text-muted-foreground">
                  Hal {page} dari {totalPages || 1} (Total {total} data)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || isLoading}
                    className="rounded-lg h-8 px-3"
                  >
                    <ChevronLeft className="h-4 w-4" /> Prev
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page >= totalPages || isLoading}
                    className="rounded-lg h-8 px-3"
                  >
                    Next <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
