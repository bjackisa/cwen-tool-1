"use client"

import Link from "next/link"
import { useState } from "react"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Home,
  BarChart3,
  Users,
  FileText,
  Database,
  Menu,
  X,
} from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/respondents", label: "Respondents", icon: Users },
  { href: "/reports", label: "Reports", icon: FileText },
  { href: "/data-import", label: "Data Import", icon: Database },
]

export function Sidebar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()
  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 md:hidden p-2 text-gray-700 bg-white rounded-md shadow"
        aria-label="Toggle Menu"
        onClick={() => setOpen(!open)}
      >
        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-gradient-to-b from-slate-900 to-indigo-900 text-gray-100 shadow-lg transform transition-transform md:translate-x-0 md:static md:inset-auto",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="p-6 text-2xl font-bold tracking-tight">CWEN Tool</div>
        <nav className="px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-indigo-700 text-white"
                    : "text-gray-200 hover:bg-indigo-800 hover:text-white",
                )}
                onClick={() => setOpen(false)}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            )
          })}
        </nav>
      </aside>
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  )
}
