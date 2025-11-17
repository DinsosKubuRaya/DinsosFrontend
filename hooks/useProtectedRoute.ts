"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function useProtectedRoute(requireAdmin = false) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  
  const hasChecked = useRef(false);

  useEffect(() => {
    // Wait for auth to finish loading
    if (loading) {
      return;
    }

    // Only check once
    if (hasChecked.current) {
      console.log("useProtectedRoute: Already checked");
      return;
    }

    hasChecked.current = true;

    // Check authentication
    if (!user) {
      console.log("useProtectedRoute: Not authenticated, redirecting to login...");
      router.push("/login");
      return;
    }
    // Check admin requirement
    if (requireAdmin && !isAdmin) {
      console.log("useProtectedRoute: Not admin, redirecting to dashboard...");
      router.push("/dashboard");
      return;
    }
  }, [user, loading, isAdmin, requireAdmin, router]);

  return { user, loading, isAdmin };
}