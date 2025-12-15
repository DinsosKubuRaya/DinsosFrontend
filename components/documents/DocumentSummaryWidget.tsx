"use client";

import { useEffect, useState } from "react";
import { documentAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon, Calendar } from "lucide-react";

interface WeekSummary {
  week: number;
  start: string;
  end: string;
  masuk: number;
  keluar: number;
}

interface SummaryData {
  year: number;
  month: number;
  month_name: string;
  weeks: WeekSummary[];
}

export function DocumentSummaryWidget() {
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const data = await documentAPI.getSummary();
      setSummary(data);
    } catch (error) {
      console.error("Failed to fetch document summary:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="rounded-2xl border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Statistik Bulanan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-16 bg-muted/50 rounded-lg"></div>
            <div className="h-16 bg-muted/50 rounded-lg"></div>
            <div className="h-16 bg-muted/50 rounded-lg"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summary) return null;

  const totalMasuk = summary.weeks.reduce((sum, week) => sum + week.masuk, 0);
  const totalKeluar = summary.weeks.reduce((sum, week) => sum + week.keluar, 0);

  return (
    <Card className="rounded-2xl border-border/60 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Statistik {summary.month_name} {summary.year}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {/* Total Summary */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          <div className="p-2 sm:p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
              <ArrowDownIcon className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600 dark:text-blue-400" />
              <span className="text-[10px] sm:text-xs font-medium text-blue-700 dark:text-blue-300">
                Surat Masuk
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalMasuk}
            </p>
          </div>
          <div className="p-2 sm:p-3 rounded-xl bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-1.5 sm:gap-2 mb-1">
              <ArrowUpIcon className="h-3 w-3 sm:h-4 sm:w-4 text-green-600 dark:text-green-400" />
              <span className="text-[10px] sm:text-xs font-medium text-green-700 dark:text-green-300">
                Surat Keluar
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
              {totalKeluar}
            </p>
          </div>
        </div>

        {/* Weekly Breakdown */}
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Per Minggu
          </h4>
          {summary.weeks.map((week) => (
            <div
              key={week.week}
              className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
            >
              <span className="text-sm font-medium text-foreground">
                Minggu {week.week}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-blue-600 dark:text-blue-400 font-semibold">
                  ↓ {week.masuk}
                </span>
                <span className="text-xs text-green-600 dark:text-green-400 font-semibold">
                  ↑ {week.keluar}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
