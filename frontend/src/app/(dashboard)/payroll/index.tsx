// src/app/(dashboard)/payroll/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PayrollIndex() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/payroll/dashboard");
  }, [router]);

  return (
    <div className="flex items-center justify-center h-96">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );
}