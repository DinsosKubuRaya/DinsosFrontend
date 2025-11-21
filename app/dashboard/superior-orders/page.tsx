"use client";

import { useEffect, useState } from "react";
import { PageHeader } from "@/components/superior-orders/PageHeader";
import { SuperiorOrderTable } from "@/components/superior-orders/SuperiorOrderTable";
import { superiorOrderAPI } from "@/lib/api";
import { SuperiorOrder } from "@/types";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";

export default function SuperiorOrdersPage() {
  const [orders, setOrders] = useState<SuperiorOrder[]>([]);
  const [loading, setLoading] = useState(true);

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
    fetchOrders();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Perintah Atasan"
        description="Kelola perintah atasan kepada staff untuk menangani dokumen."
      />

      {loading ? (
        <div className="flex h-64 w-full items-center justify-center">
          <Spinner className="w-5 h-5" />
        </div>
      ) : (
        <SuperiorOrderTable orders={orders} onRefresh={fetchOrders} />
      )}
    </div>
  );
}
