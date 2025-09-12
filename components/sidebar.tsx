"use client";

import Link from "next/link";
import NextImage from "next/image";
import { usePathname } from "next/navigation";
import {
  Home,
  BarChart3,
  Wallet,
  MessageSquareText,
  ChevronRight,
  Users,
  Rocket,
  Music,
  LogOut,
  Settings,
  Globe,
} from "lucide-react";
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/context/AuthContext";

export function Sidebar() {
  const pathname = usePathname();
  const { logout, user } = useAuth();
  const navItems = [
    { name: "New Release", href: "/dashboard/new-release", icon: Rocket },
    { name: "Home", href: "/dashboard", icon: Home },
    { name: "My Music", href: "/dashboard/my-music", icon: Music },
    { name: "My Page", href: "/dashboard/my-page", icon: Globe },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { name: "Wallet", href: "/dashboard/wallet", icon: Wallet },
    { name: "Fanzone", href: "/dashboard/fanzone", icon: Users },
    ...(user?.isAdmin
      ? [{ name: "Admin", href: "/dashboard/admin", icon: Users }]
      : []),
  ];

  const isPathActive = (basePath: string) => {
    if (basePath === "/dashboard") {
      return pathname === basePath;
    }
    return pathname.startsWith(basePath);
  };

  return (
    <div className="hidden overflow-y-auto md:flex md:w-72 md:flex-col fixed top-0 left-0 h-screen">
      <div className="flex flex-col flex-grow border-r border-gray-200 dark:border-gray-800/40 bg-white dark:bg-[#0a0a13] pt-6 shadow-lg transition-colors duration-300">
        <div className="flex items-center justify-between flex-shrink-0 px-5 mb-4">
          <Link href="/dashboard" className="flex items-center gap-3">
            {/* Light mode logo */}
            <div className="block dark:hidden">
              <NextImage
                src="/alera-logo-black.png"
                alt="ALERA Logo"
                width={32}
                height={32}
                className="rounded-sm"
              />
            </div>
            {/* Dark mode logo */}
            <div className="hidden dark:block">
              <NextImage
                src="/alera-logo-white.png"
                alt="ALERA Logo"
                width={32}
                height={32}
                className="rounded-sm"
              />
            </div>
            <span className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
              ALERA
            </span>
          </Link>
          <ThemeToggle />
        </div>
        <div className="mt-6 flex flex-grow overflow-y-auto flex-col px-3">
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const isActive = isPathActive(item.href);
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group relative flex items-center px-4 py-3 text-base font-medium rounded-lg transition-all duration-200 ease-in-out ${
                    isActive
                      ? "bg-gradient-to-r from-purple-500/10 to-indigo-500/10 text-purple-600 dark:text-indigo-300 dark:from-purple-600/20 dark:to-indigo-600/20 shadow-sm"
                      : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-900/50 hover:text-gray-900 dark:hover:text-white"
                  } hover:shadow-md hover:scale-[1.02] transform`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="sidebar-active-indicator"
                      className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-purple-500 to-indigo-500 dark:from-purple-400 dark:to-indigo-400 rounded-r-full"
                      initial={{ opacity: 0, scaleY: 0.8 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                        mass: 0.5,
                      }}
                    />
                  )}
                  <item.icon
                    className={`mr-4 h-6 w-6 flex-shrink-0 transition-colors duration-200 ${
                      isActive
                        ? "text-purple-500 dark:text-indigo-300"
                        : "text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-200"
                    }`}
                  />
                  <span className="truncate font-medium">{item.name}</span>
                  {isActive &&
                    !["/dashboard"].includes(item.href) && (
                      <ChevronRight className="ml-auto h-5 w-5 text-purple-500 dark:text-indigo-300 opacity-80 transition-opacity group-hover:opacity-100" />
                    )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
      {/* Bottom section */}
      <div className="mt-auto pt-5 pb-4 bg-white dark:bg-[#0a0a13] border border-gray-200 dark:border-gray-800/40 ">
        <div className="flex flex-col gap-3 px-5">
          <button
            onClick={logout}
            className="flex items-center gap-4 w-full px-4 py-3 text-base font-medium text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-900/60 rounded-lg transition-all duration-200 hover:shadow-sm"
          >
            <LogOut className="h-6 w-6 transition-colors duration-200" />
            <span className="text-base font-medium">Logout</span>
          </button>
        </div>
      </div>
    </div>
  );
}
