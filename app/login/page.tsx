"use client";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Image from "next/image";
import { toast } from "sonner";
export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(username, password);
      toast.success("Login Berhasil");
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Username atau Password salah.";
      toast.error(msg);
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto rounded-2xl flex items-center justify-center shadow-lg">
            <Image src="/logodinsos.png" alt="Logo" width={200} height={200} />
          </div>
          <CardTitle className="text-2xl font-bold">
            Sistem Arsip Digital
          </CardTitle>
          <CardDescription className="text-foreground/70">
            Masuk ke akun Anda untuk mengakses dokumen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <CardDescription className="text-red-600 bg-red-100 p-2 rounded">
                <CardDescription>{error}</CardDescription>
              </CardDescription>
            )}

            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                className="border-black/40"
                id="username"
                type="text"
                placeholder="Masukkan username Anda"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="text-center text-sm text-muted-foreground">
              Belum punya akun?{" "}
              <Link
                href="/register"
                className="text-primary hover:underline font-medium"
              >
                Daftar di sini
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full cursor-pointer"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Masuk"}{" "}
              {loading && <Spinner className="ml-2" />}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
