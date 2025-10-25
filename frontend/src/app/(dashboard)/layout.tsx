'use client';

import { useEffect, useState } from 'react';

import { AppSidebar } from "@/components/layout/app-sidebar"
import { SidebarProvider } from "@/components/ui/sidebar"
import { cn } from "@/lib/utils"

interface Props {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: Props) {
  const [defaultOpen, setDefaultOpen] = useState(true);

  useEffect(() => {
    const cookie = document.cookie.split('; ').find((row) => row.startsWith('sidebar:state='));
    if (cookie) {
      const value = cookie.split('=')[1];
      setDefaultOpen(value !== 'false');
    }
  }, []);

  return (
    <div className="border-grid flex flex-1 flex-col">
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <div
          id="content"
          className={cn(
            "flex h-full w-full flex-col",
            "has-[div[data-layout=fixed]]:h-svh",
            "group-data-[scroll-locked=1]/body:h-full",
            "has-[data-layout=fixed]:group-data-[scroll-locked=1]/body:h-svh"
          )}
        >
          {children}
        </div>
      </SidebarProvider>
    </div>
  )
}
