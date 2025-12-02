"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/superior-orders/PageHeader";
import { SuperiorOrderTable } from "@/components/superior-orders/SuperiorOrderTable";
import { superiorOrderAPI } from "@/lib/api";
import { SuperiorOrder } from "@/types";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function SuperiorOrdersPage() {
  const [orders, setOrders] = useState<SuperiorOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const data = await superiorOrderAPI.getAll();
      setOrders(data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data perintah atasan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchOrders();
    }
  }, [user]);

  // Filter: Jika Staff, hanya tampilkan perintah untuk dirinya sendiri
  const displayedOrders = isAdmin
    ? orders
    : orders.filter((o) => o.user_id === user?.id);

  return (
    <div className="space-y-6">
      <PageHeader
        title={isAdmin ? "Manajemen Perintah Atasan" : "Kotak Masuk Perintah"}
        description={
          isAdmin
            ? "Kelola perintah atasan kepada staff untuk menangani dokumen."
            : "Daftar dokumen yang ditugaskan kepada Anda."
        }
      />

      {loading ? (
        <div className="flex h-64 w-full items-center justify-center">
          <Spinner className="h-8 w-8 text-primary" />
        </div>
      ) : (
        <SuperiorOrderTable
          orders={displayedOrders}
          onRefresh={fetchOrders}
          isStaffView={!isAdmin}
        />
      )}
    </div>
  );
}
