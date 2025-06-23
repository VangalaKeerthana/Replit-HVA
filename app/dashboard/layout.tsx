import type React from "react"
import { Sidebar } from "@/components/Sidebar"
import { ProtectedRoute } from "@/components/ProtectedRoute"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-screen">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">{children}</main>
      </div>
    </ProtectedRoute>
  )
}
