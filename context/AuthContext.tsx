"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { authAPI, getErrorMessage } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { nanoid } from "nanoid";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    username: string;
    password: string;
    password_confirmation: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        // API AUTH /auth/me
        const userData = await authAPI.me();
        setUser(userData);
      }
    } catch (error) {
      console.error("Auth check failed:", error);
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  };

  const login = async (username: string, password: string) => {
    try {
      // LOGIC DUMMY
      console.log("LOGIN DUMMY DIMULAI DENGAN:", { username, password });
      const dummyUser: User = {
        id: nanoid(), //
        name: "Admin Dummy",
        username: username,
        role: "admin",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const response = {
        token: "ini-adalah-token-dummy-12345",
        user: dummyUser,
      };

      await new Promise((resolve) => setTimeout(resolve, 1000));
      // END LOGIC DUMMY

      // REAL API
      // const response = await authAPI.login(username, password);

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);

      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("Login error:", error);
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  };

  const register = async (data: {
    name: string;
    username: string;
    password: string;
    password_confirmation: string;
  }) => {
    try {
      // PANGGIL API REGISTRASI
      const response = await authAPI.register(data);

      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));
      setUser(response.user);

      toast.success("Registrasi Berhasil!", {
        description: "Akun berhasil didaftarkan dan login otomatis.",
      });
      router.push("/dashboard");
    } catch (error: unknown) {
      console.error("Registration error:", error);
      const errorMessage = getErrorMessage(error);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      toast.success("Logout Berhasil!");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout Gagal", {
        description: error instanceof Error ? error.message : "Logout Gagal",
      });
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      router.push("/login");
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
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
