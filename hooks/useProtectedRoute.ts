// hooks/useProtectedRoute.ts
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export function useProtectedRoute(requireAdmin = false) {
  const { user, loading, isAdmin } = useAuth();
  const router = useRouter();
  
  const hasChecked = useRef(false);

  useEffect(() => {
    if (loading) return;
    if (hasChecked.current) return;

    hasChecked.current = true;

    // Check authentication
    if (!user) {
      console.log('Not authenticated, redirecting to login...');
      router.push("/login");
      return;
    }

    if (requireAdmin && !isAdmin) {
      console.log('Not admin, redirecting to dashboard...');
      router.push("/dashboard");
      return;
    }

    console.log('✅ Protected route check passed');

    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, loading, isAdmin, requireAdmin]);


  return { user, loading, isAdmin };
}