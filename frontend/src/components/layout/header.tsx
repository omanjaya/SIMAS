import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"


import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"

export function Header() {
  return (
    <header
      className={cn(
        "bg-background z-50 flex h-16 shrink-0 items-center gap-2 border-b px-4",
        "sticky top-0"
      )}
    >
      <SidebarTrigger className="-ml-1" />
      <Separator orientation="vertical" className="mr-2 h-4" />
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">Sistem Informasi Manajemen Absensi</span>
          <span className="text-sm font-semibold">SIMAS Saraswati Denpasar</span>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="outline" size="sm">
            <Link href="/settings">Pengaturan</Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link href="/users">Data Pegawai</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
