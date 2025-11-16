"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import { authAPI, getErrorMessage } from "@/lib/api";
import Cookies from "js-cookie";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { set } from "date-fns";

interface AuthContextType {
  user: User | null;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: {
    name: string;
    username: string;
    password: string;
    password_confirmation: string;
  }) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const verifyUser = async () => {
      const token = Cookies.get("access_token");

      if (token) {
        try {
          const userData = await authAPI.me();
          setUser(userData);
          setIsAdmin(userData.role === "admin");
        } catch (error) {
          console.error("Sesi tidak valid:", error);
          Cookies.remove("access_token");
          setUser(null);
          setIsAdmin(false);
        }
      }
      setLoading(false);
    };

    verifyUser();
  }, []);

  const login = async (username: string, password: string) => {
    try {
      const response = await authAPI.login(username, password);
      if (!response.token) {
        throw new Error("Token tidak diterima dari server");
      }

      Cookies.set("access_token", response.token, {
        expires: 1,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      const userData = await authAPI.me();
      setUser(userData);
      setIsAdmin(userData.role === "admin");

      setTimeout(() => {
        window.location.href = "/dashboard";
      }, 1500);
    } catch (error) {
      const message = getErrorMessage(error);
      toast.error(`Login Gagal: ${message}`);
      console.error("Login failed:", error);
      throw error;
    }
  };
  const register = async (data: {
    name: string;
    username: string;
    password: string;
    password_confirmation: string;
  }) => {
    try {
      const response = await authAPI.register(data);

      toast.success("Registrasi Berhasil!", {
        description: "Akun Anda telah dibuat. Silakan login.",
      });

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      toast.error("Registrasi Gagal. Silakan coba lagi.");
      console.error("Registration failed:", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Panggil API logout (akan menghapus token dari database)
      await authAPI.logout();
      toast.success("Logout Berhasil");
    } catch (error) {
      console.error("Backend logout failed:", error);
      // Tetap lanjutkan logout di frontend meskipun backend error
      toast.warning("Logout berhasil (dengan peringatan)");
    } finally {
      // Hapus token dari cookie
      Cookies.remove("access_token");

      // Reset state
      setUser(null);
      setIsAdmin(false);

      // Redirect ke login
      router.push("/login");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <AuthContext.Provider
      value={{ user, isAdmin, login, logout, register, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
