"use client";

import { Input } from "@/components/ui/input";
import { Search, Calendar, FilterX, User } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

interface DocumentFilterProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  year: string;
  setYear: (value: string) => void;
  month: string;
  setMonth: (value: string) => void;
  userFilter?: string;
  setUserFilter?: (value: string) => void;
  users?: Array<{ id: string; name: string }>;
  showUserFilter?: boolean;
}

export function DocumentFilter({
  searchTerm,
  setSearchTerm,
  year,
  setYear,
  month,
  setMonth,
  userFilter = "all",
  setUserFilter,
  users = [],
  showUserFilter = false,
}: DocumentFilterProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, i) =>
    (currentYear - i).toString()
  );

  const months = [
    { value: "1", label: "Januari" },
    { value: "2", label: "Februari" },
    { value: "3", label: "Maret" },
    { value: "4", label: "April" },
    { value: "5", label: "Mei" },
    { value: "6", label: "Juni" },
    { value: "7", label: "Juli" },
    { value: "8", label: "Agustus" },
    { value: "9", label: "September" },
    { value: "10", label: "Oktober" },
    { value: "11", label: "November" },
    { value: "12", label: "Desember" },
  ];

  const handleReset = () => {
    setSearchTerm("");
    setYear("all");
    setMonth("all");
    if (setUserFilter) setUserFilter("all");
  };

  return (
    <div className="bg-card rounded-2xl border border-border/50 p-1.5 shadow-sm mb-6 flex flex-col md:flex-row gap-2">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Cari judul, nomor surat, atau pengirim..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-transparent bg-muted/30 focus:bg-background focus:border-primary/20 h-11 rounded-xl"
        />
      </div>

      <div className="flex gap-2 flex-wrap md:flex-nowrap">
        {/* Filter User (hanya untuk staff monitoring) */}
        {showUserFilter && setUserFilter && (
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-full sm:w-40 md:w-[180px] h-11 rounded-xl border-transparent bg-muted/30 focus:bg-background focus:border-primary/20">
              <User className="mr-2 h-4 w-4 text-muted-foreground opacity-70" />
              <SelectValue placeholder="Semua Staff" />
            </SelectTrigger>
            <SelectContent className="rounded-xl border-border/60 shadow-lg max-h-[300px]">
              <SelectItem value="all">Semua Staff</SelectItem>
              {users.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {/* Filter Bulan */}
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-full sm:w-[140px] h-11 rounded-xl border-transparent bg-muted/30 focus:bg-background focus:border-primary/20">
            <Calendar className="mr-2 h-4 w-4 text-muted-foreground opacity-70" />
            <SelectValue placeholder="Bulan" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/60 shadow-lg">
            <SelectItem value="all">Semua Bulan</SelectItem>
            {months.map((m) => (
              <SelectItem key={m.value} value={m.value}>
                {m.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Filter Tahun */}
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-full sm:w-[110px] h-11 rounded-xl border-transparent bg-muted/30 focus:bg-background focus:border-primary/20">
            <SelectValue placeholder="Tahun" />
          </SelectTrigger>
          <SelectContent className="rounded-xl border-border/60 shadow-lg">
            <SelectItem value="all">Semua</SelectItem>
            {years.map((y) => (
              <SelectItem key={y} value={y}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Reset Button */}
        {(searchTerm ||
          year !== "all" ||
          month !== "all" ||
          userFilter !== "all") && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleReset}
            className="h-11 w-11 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            title="Reset Filter"
          >
            <FilterX className="h-5 w-5" />
          </Button>
        )}
      </div>
    </div>
  );
}
