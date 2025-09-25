"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, ClipboardList, Users, Megaphone, Menu, X, Building2, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Ticketing", href: "/tickets", icon: ClipboardList },
  { name: "Tenants", href: "/tenants", icon: Users },
  { name: "ML Forecasting", href: "/forecasting", icon: Brain },
  { name: "Announcements", href: "/announcements", icon: Megaphone },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMobileOpen(false)
      }
    }

    if (isMobileOpen) {
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [isMobileOpen])

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
          className="bg-background/95 backdrop-blur-sm border-border/50"
        >
          {isMobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-sidebar border-r border-sidebar-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 px-4 border-b border-sidebar-border bg-gradient-to-r from-primary/5 to-accent/5">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary text-primary-foreground">
                <Building2 className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-bold text-sidebar-foreground tracking-tight">Property Ops</h1>
            </div>
          </div>

          <nav className="flex-1 px-4 py-6 space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-sidebar-ring group",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                  onClick={() => setIsMobileOpen(false)}
                >
                  <item.icon
                    className={cn(
                      "mr-3 h-5 w-5 flex-shrink-0 transition-colors",
                      isActive
                        ? "text-sidebar-primary-foreground"
                        : "text-sidebar-foreground group-hover:text-sidebar-accent-foreground",
                    )}
                  />
                  <span className="font-medium">{item.name}</span>
                  {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-sidebar-primary-foreground" />}
                </Link>
              )
            })}
          </nav>

          <div className="px-4 py-4 border-t border-sidebar-border">
            <div className="text-xs text-muted-foreground text-center">Property Manager v1.0</div>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}
