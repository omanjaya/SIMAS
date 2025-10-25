// src/app/(dashboard)/payroll/layout.tsx
import { ReactNode } from "react";

interface PayrollLayoutProps {
  children: ReactNode;
}

export default function PayrollLayout({ children }: PayrollLayoutProps) {
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
      {children}
    </div>
  );
}