"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { Sidebar } from "@/components/sidebar"
import { usePathname } from "next/navigation"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuth()
  const pathname = usePathname()

  // Don't show sidebar on auth pages or homepage for non-authenticated users
  const showSidebar = user && !pathname.startsWith("/auth") && pathname !== "/"

  if (!showSidebar) {
    return <div className="flex-1">{children}</div>
  }

  return (
    <>
      <Sidebar />
      <div className="flex-1 overflow-auto">{children}</div>
    </>
  )
}
