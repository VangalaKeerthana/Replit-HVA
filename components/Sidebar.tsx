"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { FileText, History, PieChart, Plus, LogOut, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"

const navItems = [
  {
    title: "New Assessment",
    href: "/dashboard",
    icon: Plus,
  },
  {
    title: "History",
    href: "/history",
    icon: History,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: PieChart,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <div className="flex flex-col w-64 bg-blue-700 text-white min-h-screen">
      <div className="p-4 border-b border-blue-600">
        <div className="flex items-center gap-2">
          <FileText className="h-6 w-6" />
          <h1 className="text-xl font-bold">HVA Dashboard</h1>
        </div>
      </div>

      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-blue-600",
                  pathname === item.href ? "bg-blue-600" : "transparent",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User Info Section */}
      <div className="p-4 border-t border-blue-600 space-y-3">
        {user && (
          <div className="flex items-center gap-2 text-sm">
            <User className="h-4 w-4" />
            <span className="truncate">{user.email}</span>
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={handleSignOut}
          className="w-full justify-start text-white hover:bg-blue-600"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>

        <div className="text-xs text-blue-200">HVA Dashboard v1.0</div>
      </div>
    </div>
  )
}
