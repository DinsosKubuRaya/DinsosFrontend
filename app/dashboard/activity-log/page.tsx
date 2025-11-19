"use client";

import React, { useEffect, useState } from "react";
import { activityLogAPI, getErrorMessage } from "@/lib/api";
import { ActivityLog } from "@/types";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity } from "lucide-react";
import { ActivityLogTable } from "@/components/activity/ActivityLogTable";

export default function ActivityLogPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      setIsLoading(true);
      try {
        const data = await activityLogAPI.getAll();
        setLogs(data);
      } catch (error) {
        toast.error("Gagal memuat log aktivitas", {
          description: getErrorMessage(error),
        });
      } finally {
        setIsLoading(false);
      }
    }
    fetchLogs();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 md:px-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Log Aktivitas
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center">Memuat data...</p>
          ) : (
            <ActivityLogTable logs={logs} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
