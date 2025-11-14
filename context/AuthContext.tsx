"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { User } from "@/types";
import { authAPI, getErrorMessage } from "@/lib/api";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    username: string;
    password: string;
    password_confirmation: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = Cookies.get("token");
    if (token) {
      authAPI
        .me()
        .then((data) => {
          console.log("User data from API:", data);
          setUser(data);
        })
        .catch((error) => {
          console.error("Failed to fetch user:", error);
          Cookies.remove("token");
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const res = await authAPI.login(username, password);
      console.log("Login response:", res); // ✅ Debug log

      Cookies.set("token", res.token, { expires: 7 });
      setUser(res.user);

      toast.success("Login Berhasil!");
      router.push("/dashboard");
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const register = async (data: {
    name: string;
    username: string;
    password: string;
    password_confirmation: string;
  }) => {
    try {
      await authAPI.register(data);
      toast.success("Registrasi Berhasil", {
        description: "Silakan login dengan akun baru Anda.",
      });
      router.push("/login");
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      toast.error(msg);
      throw new Error(msg);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      Cookies.remove("token");
      setUser(null);
      router.push("/login");
      toast.success("Logout berhasil!");
    }
  };

  const isAdmin = user?.role === "admin";

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, isAdmin }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
