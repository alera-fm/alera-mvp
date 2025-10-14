"use client";

import { AdminRoute } from "@/components/auth/admin-route";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  UserCheck,
  Music,
  DollarSign,
  FileText,
  BarChart3,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  {
    name: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Identity Verification",
    href: "/admin/dashboard/identity-verification",
    icon: UserCheck,
  },
  {
    name: "Release Management",
    href: "/admin/dashboard/release-management",
    icon: Music,
  },
  {
    name: "Withdrawal Management",
    href: "/admin/dashboard/withdrawal-management",
    icon: DollarSign,
  },
  {
    name: "Revenue Reports",
    href: "/admin/dashboard/revenue-reports",
    icon: FileText,
  },
  {
    name: "Analytics",
    href: "/admin/dashboard/analytics",
    icon: BarChart3,
  },
  {
    name: "Back to Dashboard",
    href: "/dashboard",
    icon: ArrowLeft,
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <AdminRoute>
      <div className="min-h-screen bg-background">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 z-50 h-16 bg-card border-b border-border flex items-center justify-between px-4">
          <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
            >
              {sidebarOpen ? (
                <X className="w-6 h-6 text-foreground" />
              ) : (
                <Menu className="w-6 h-6 text-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <aside
          className={`
            fixed top-0 left-0 z-40 h-full w-64 bg-card border-r border-border
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            lg:translate-x-0
          `}
        >
          <div className="flex flex-col h-full">
            {/* Logo/Brand */}
            <div className="h-16 flex items-center px-6 border-b border-border">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary via-[hsl(var(--alera-purple))] to-[hsl(var(--alera-dark-purple))] bg-clip-text text-transparent">
                ALERA Admin
              </h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                      ${
                        isActive
                          ? "bg-primary text-primary-foreground shadow-md"
                          : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }
                    `}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    <span className="font-medium text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* Footer */}
            <div className="p-4 border-t border-border">
              <p className="text-xs text-muted-foreground text-center">
                ALERA Admin Panel v1.0
              </p>
            </div>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/50 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <div className="lg:pl-64">
          {/* Header */}
          <header className="sticky top-0 z-20 h-16 bg-card/95 backdrop-blur-sm border-b border-border hidden lg:flex items-center justify-between px-8">
            <div>
              {/* <h2 className="text-lg font-semibold text-foreground">
                {navItems.find((item) => item.href === pathname)?.name ||
                  "Admin Dashboard"}
              </h2> */}
            </div>
            <div className="flex items-center gap-4">
              <div className="text-sm text-muted-foreground">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
              <ThemeToggle />
            </div>
          </header>

          {/* Page Content */}
          <main className="min-h-[calc(100vh-4rem)] lg:min-h-[calc(100vh-0rem)] mt-16 lg:mt-0">
            <div className="p-4 md:p-6 lg:p-8 max-w-[1800px] mx-auto">
              {children}
            </div>
          </main>
        </div>
      </div>
    </AdminRoute>
  );
}
