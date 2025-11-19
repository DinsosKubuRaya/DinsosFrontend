"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Image from "next/image";
import { Spinner } from "@/components/ui/spinner";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import Link from "next/link";
import { UserPlus, ArrowLeft } from "lucide-react";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.password_confirmation) {
      setError("Password dan Konfirmasi Password tidak cocok.");
      return;
    }

    setLoading(true);

    try {
      await register(formData);
    } catch (err: unknown) {
      console.error("Registration error:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Registrasi Gagal";
      setError(errorMessage);
      toast.error("Registrasi Gagal", { description: errorMessage });
    } finally {
      toast.success("Registrasi Berhasil! Silahkan login.", {
        description: "Dengan akun yang telah dibuat.",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto rounded-2xl flex items-center justify-center shadow-lg">
            <Image
              src="/logodinsos.png"
              alt="Logo"
              width={250}
              height={250}
              className="mx-auto rounded-2xl flex items-center justify-center shadow-lg"
            />
          </div>
          <CardTitle className="text-3xl font-bold">Daftar Akun Baru</CardTitle>
          <CardDescription className="text-foreground/70">
            Buat akun untuk mengakses sistem arsip digital
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">Nama Lengkap</Label>
              <Input
                className="border-black/40"
                id="name"
                type="text"
                placeholder="Masukkan nama lengkap Anda"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                className="border-black/40"
                id="username"
                type="text"
                placeholder="Masukkan username unik"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                className="border-black/40"
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password_confirmation">Konfirmasi Password</Label>
              <Input
                className="border-black/40"
                id="password_confirmation"
                type="password"
                placeholder="••••••••"
                value={formData.password_confirmation}
                onChange={handleChange}
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full cursor-pointer "
              disabled={loading}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              {loading ? "Mendaftarkan..." : "Daftar Sekarang"}
              {loading && <Spinner className="ml-2" />}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              Sudah punya akun?{" "}
              <Link
                href="/login"
                className="text-primary hover:underline font-medium flex items-center justify-center gap-1 mt-2"
              >
                <ArrowLeft className="h-4 w-4" /> Kembali ke Login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
