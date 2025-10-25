"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/auth-context";
import { LoginForm } from "@/components/auth/login-form";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleLoginSuccess = () => {
    router.push("/dashboard");
  };

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-background">
      {/* Background gradient */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-background to-background dark:from-emerald-500/10 dark:via-slate-900 dark:to-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.15),transparent_70%)]" />
      </div>

      {/* Theme toggle - top right */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      {/* Login container */}
      <div className="relative z-10 w-full max-w-md px-6">
        {/* Logo and branding */}
        <div className="mb-8 text-center">
          <div className="mb-6 flex justify-center">
            <Image
              src="/images/layout/logo.svg"
              alt="SIMAS Saraswati"
              width={160}
              height={40}
              className="dark:invert"
              style={{ width: "160px", height: "auto" }}
            />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Selamat Datang
          </h1>
          <p className="text-sm text-muted-foreground">
            Sistem Absensi SMP Saraswati Denpasar
          </p>
        </div>

        {/* Login form */}
        <LoginForm
          className="shadow-lg border border-border bg-card"
          onSuccess={handleLoginSuccess}
        />

        {/* Footer text */}
        <p className="mt-6 text-xs text-center text-muted-foreground">
          Hubungi admin sekolah apabila membutuhkan bantuan
        </p>
      </div>
    </main>
  );
}
