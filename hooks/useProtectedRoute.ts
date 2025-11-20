"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function useProtectedRoute(requireAdmin = false) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  
  const hasChecked = useRef(false);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (hasChecked.current) {
      return;
    }

    hasChecked.current = true;

    if (!user) {
      router.push("/login");
      return;
    }
    if (requireAdmin && !isAdmin) {
      router.push("/dashboard");
      return;
    }
  }, [user, loading, isAdmin, requireAdmin, router]);

  return { user, loading, isAdmin };
}