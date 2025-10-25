"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface LoginFormProps {
  className?: string;
  onSuccess?: () => void;
}

export function LoginForm({ className, onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login(email, password);
      toast({
        title: "Berhasil masuk",
        description: "Selamat datang kembali di sistem absensi SMP Saraswati Denpasar.",
      });
      onSuccess?.();
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: "Gagal masuk",
        description: error?.response?.data?.message ?? "Silakan periksa kembali email dan kata sandi Anda.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader className="space-y-1 pb-4">
        <CardTitle className="text-xl font-semibold text-center">
          Masuk ke Sistem
        </CardTitle>
        <CardDescription className="text-center text-sm">
          Masukkan email dan kata sandi Anda
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="nama@saraswati.sch.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              className="h-10"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm">Kata Sandi</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              className="h-10"
            />
          </div>
          <Button
            type="submit"
            className="w-full h-10 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-700"
            disabled={isLoading}
          >
            {isLoading ? "Memproses..." : "Masuk"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
