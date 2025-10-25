"use client";

import { Button } from "@/components/ui/button";
import { CircleUser, Users, UserCheck, Cog, Shield } from "lucide-react";

interface RoleLoginButtonProps {
  role: "admin" | "teacher" | "employee" | "headmaster";
  onClick: () => void;
  disabled?: boolean;
}

const RoleLoginButton = ({ role, onClick, disabled }: RoleLoginButtonProps) => {
  const getRoleInfo = () => {
    switch (role) {
      case "admin":
        return {
          icon: Cog,
          label: "Admin",
          description: "Administrator Sistem"
        };
      case "teacher":
        return {
          icon: UserCheck,
          label: "Guru",
          description: "Tenaga Pendidik"
        };
      case "employee":
        return {
          icon: Users,
          label: "Pegawai",
          description: "Staf Tata Usaha"
        };
      case "headmaster":
        return {
          icon: Shield,
          label: "Kepala Sekolah",
          description: "Pimpinan Sekolah"
        };
      default:
        return {
          icon: CircleUser,
          label: "Pengguna",
          description: "Peran Pengguna"
        };
    }
  };

  const { icon: Icon, label, description } = getRoleInfo();

  return (
    <Button
      variant="outline"
      className="h-auto w-full flex-col items-center justify-center gap-2 p-4 hover:bg-primary/10 transition-colors"
      onClick={onClick}
      disabled={disabled}
    >
      <Icon className="h-6 w-6 text-primary" />
      <div className="flex flex-col items-center">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground">{description}</span>
      </div>
    </Button>
  );
};

export default RoleLoginButton;