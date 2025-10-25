import {
  IconApps,
  IconBarrierBlock,
  IconBug,
  IconCalendar,
  IconClock,
  IconCoin,
  IconError404,
  IconLayoutDashboard,
  IconLock,
  IconLockAccess,
  IconNotification,
  IconServerOff,
  IconSettings,
  IconTool,
  IconUser,
  IconUserOff,
  IconUsers,
  IconFileText,
  IconClockHour4,
  IconBrandBooking,
  IconUserCircle,
  IconEdit,
  IconCurrency,
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import { type SidebarData } from "../types"

export const sidebarData: SidebarData = {
  user: {
    name: "Admin SIMAS",
    email: "admin@smp-saraswati.sch.id",
    avatar: "/avatars/admin.jpg",
  },
  teams: [
    {
      name: "SIMAS - SMP Saraswati",
      logo: ({ className }: { className: string }) => (
        <Logo className={cn("invert dark:invert-0", className)} />
      ),
      plan: "Attendance Management System",
    },
  ],
  navGroups: [
    {
      title: "Dashboard",
      items: [
        {
          title: "Beranda",
          url: "/dashboard",
          icon: IconLayoutDashboard,
        },
        {
          title: "Profil Pegawai",
          url: "/profile",
          icon: IconUserCircle,
        },
      ],
    },
    {
      title: "Manajemen Pegawai",
      items: [
        {
          title: "Data Pegawai",
          url: "/users",
          icon: IconUsers,
        },
        {
          title: "Jadwal Guru",
          url: "/schedules",
          icon: IconClockHour4,
        },
        {
          title: "Periode",
          url: "/periods",
          icon: IconClock,
        },
      ],
    },
    {
      title: "Absensi",
      items: [
        {
          title: "Rekap Absensi",
          url: "/attendance",
          icon: IconClock,
        },
        {
          title: "Ubah Absen",
          url: "/attendance-corrections",
          icon: IconEdit,
        },
        {
          title: "Kalender Sekolah",
          url: "/school-calendar",
          icon: IconCalendar,
        },
      ],
    },
    {
      title: "Pengajuan",
      items: [
        {
          title: "Izin/Cuti",
          url: "/leave-requests",
          icon: IconFileText,
        },
      ],
    },
    {
      title: "Penggajian",
      items: [
        {
          title: "Kelola Penggajian",
          url: "/payroll",
          icon: IconCurrency,
        },
        {
          title: "Generate Penggajian",
          url: "/payroll/generate",
          icon: IconCurrency,
        },
        {
          title: "Laporan & Statistik",
          url: "/payroll/summary",
          icon: IconCurrency,
        },
      ],
    },
    {
      title: "Laporan & Pengaturan",
      items: [
        {
          title: "Pengaturan",
          icon: IconSettings,
          items: [
            {
              title: "Umum",
              icon: IconTool,
              url: "/settings",
            },
            {
              title: "Profil",
              icon: IconUser,
              url: "/settings?section=profile",
            },
            {
              title: "Notifikasi",
              icon: IconNotification,
              url: "/settings?section=notifications",
            },
            {
              title: "Pembayaran",
              icon: IconCoin,
              url: "/settings?section=billing",
            },
          ],
        },
        {
          title: "Laporan",
          icon: IconFileText,
          items: [
            {
              title: "Laporan & Statistik",
              icon: IconApps,
              url: "/reports",
            },
          ],
        },
        {
          title: "Aktivitas",
          icon: IconNotification,
          items: [
            {
              title: "Log Audit",
              icon: IconFileText,
              url: "/audit-logs",
            },
          ],
        },
      ],
    },
    {
      title: "Pengembang",
      items: [
        {
          title: "API Keys",
          url: "/developers/api-keys",
          icon: IconApps,
        },
        {
          title: "Events/Logs",
          url: "/developers/events-&-logs",
          icon: IconFileText,
        },
      ],
    },
  ],
}
