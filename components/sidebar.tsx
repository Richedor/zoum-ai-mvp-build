"use client"

import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  Home,
  Truck,
  Users,
  MapPin,
  AlertTriangle,
  Calendar,
  Wrench,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  if (!user) return null

  const managerMenuItems = [
    {
      title: "Tableau de bord",
      href: "/manager",
      icon: Home,
    },
    {
      title: "Trajets",
      href: "/manager/trips",
      icon: MapPin,
    },
    {
      title: "Flotte",
      href: "/manager/fleet",
      icon: Truck,
    },
    {
      title: "Chauffeurs",
      href: "/manager/drivers",
      icon: Users,
    },
    {
      title: "Maintenance",
      href: "/manager/maintenance",
      icon: Wrench,
    },
    {
      title: "Alertes",
      href: "/manager/alerts",
      icon: AlertTriangle,
    },
    {
      title: "Rapports",
      href: "/manager/reports",
      icon: BarChart3,
    },
    {
      title: "Paramètres",
      href: "/manager/settings",
      icon: Settings,
    },
  ]

  const driverMenuItems = [
    {
      title: "Tableau de bord",
      href: "/driver",
      icon: Home,
    },
    {
      title: "Mes trajets",
      href: "/driver/trips",
      icon: MapPin,
    },
    {
      title: "Mes alertes",
      href: "/driver/alerts",
      icon: AlertTriangle,
    },
    {
      title: "Planning",
      href: "/driver/schedule",
      icon: Calendar,
    },
    {
      title: "Profil",
      href: "/driver/profile",
      icon: Settings,
    },
  ]

  const menuItems = user.role === "MANAGER" ? managerMenuItems : driverMenuItems

  return (
    <div
      className={cn(
        "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300",
        isCollapsed ? "w-16" : "w-64",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        {!isCollapsed && (
          <div className="flex items-center gap-2">
            <Truck className="h-6 w-6 text-sidebar-accent" />
            <span className="font-bold text-sidebar-foreground">ZoumAI</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="text-sidebar-foreground hover:bg-sidebar-accent/10"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sidebar-accent rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-sidebar-accent-foreground">
                {user.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
              <p className="text-xs text-sidebar-foreground/60">
                {user.role === "MANAGER" ? "Gestionnaire" : "Chauffeur"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 p-2">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/")

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent/10 hover:text-sidebar-foreground",
                    isCollapsed && "justify-center px-2",
                  )}
                >
                  <Icon className="h-4 w-4 flex-shrink-0" />
                  {!isCollapsed && <span>{item.title}</span>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Logout */}
      <div className="p-2 border-t border-sidebar-border">
        <Button
          variant="ghost"
          onClick={logout}
          className={cn(
            "w-full justify-start gap-3 text-sidebar-foreground hover:bg-destructive/10 hover:text-destructive",
            isCollapsed && "justify-center px-2",
          )}
        >
          <LogOut className="h-4 w-4 flex-shrink-0" />
          {!isCollapsed && <span>Déconnexion</span>}
        </Button>
      </div>
    </div>
  )
}
