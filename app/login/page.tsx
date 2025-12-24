"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import Image from "next/image";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      await login(username, password);
      toast.success("Login Berhasil", {
        description: "Selamat datang kembali!",
      });
    } catch (err: unknown) {
      const msg = getErrorMessage(err);
      toast.error("Login Gagal", { description: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-muted/30">
      <div className="w-full max-w-[400px] animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <Image
            src="/logodinsos.png"
            alt="Logo Dinsos"
            width={180}
            height={60}
            className="h-12 w-auto mx-auto mb-4 object-contain"
            priority
          />
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            Sistem Arsip Digital
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Masuk untuk mengakses dan mengelola dokumen
          </p>
        </div>

        <Card className="border-border/60 shadow-xl shadow-primary/5 rounded-3xl overflow-hidden bg-card">
          <CardHeader className="pt-0" />
          <CardContent className="p-8 pt-4">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-medium ml-1">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Masukkan username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="rounded-xl h-12 bg-muted/30 border-2 focus:bg-background focus:border-primary/50 transition-all"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-1">
                  <Label htmlFor="password">Password</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="rounded-xl h-12 bg-muted/30 border-2 focus:bg-background focus:border-primary/50 transition-all"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-base font-medium rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all mt-2"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Spinner className="text-primary-foreground h-5 w-5" />
                    <span>Memproses...</span>
                  </div>
                ) : (
                  "Masuk Sekarang"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-8">
          &copy; {new Date().getFullYear()} Sekretariat Dinas Sosial
        </p>
      </div>
    </div>
  );
}
