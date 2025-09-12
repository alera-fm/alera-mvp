
"use client"

import { useState, useEffect, useContext } from "react"
import { useRouter } from "next/navigation"
import { AuthContext } from "@/context/AuthContext"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  User, 
  CreditCard, 
  Settings, 
  UserPlus, 
  Globe, 
  HelpCircle, 
  LogOut,
  Sun,
  Moon
} from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function HeaderSection() {
  const authContext = useContext(AuthContext);
  const { user, logout } = authContext || {};
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const displayName = user?.artistName || user?.email?.split('@')[0] || "User";

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout?.();
    setIsOpen(false);
  };

  return (
    <div className="flex items-center justify-between py-2">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h2 className="text-3xl font-medium text-[#111] dark:text-white">Hello</h2>
          <span className="text-3xl">👋</span>
          <h2 className="text-3xl font-medium text-[#111] dark:text-white">,</h2>
        </div>
        <h1 className="text-3xl font-bold text-[#5d2c91] dark:text-[#6b46c1]">{displayName}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Mobile Theme Toggle */}
        <div className="md:hidden">
          <ThemeToggle />
        </div>
        
        <div className="relative">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 rounded-full">
              <div className="h-14 w-14 rounded-full bg-gradient-to-br from-purple-500 to-yellow-500 flex items-center justify-center hover:shadow-lg transition-shadow cursor-pointer">
                <span className="text-white text-xl font-bold">
                  {displayName.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-[#BFFF00] rounded-full flex items-center justify-center">
                <span className="text-black text-xs">✓</span>
              </div>
            </button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent 
            align="end" 
            className="w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
          >
            <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {displayName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {user?.email}
              </p>
            </div>
            
            <DropdownMenuItem 
              onClick={() => handleNavigation("/dashboard/settings")}
              className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <User className="h-4 w-4" />
              Profile Settings
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => handleNavigation("/dashboard/settings?tab=billing")}
              className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <CreditCard className="h-4 w-4" />
              Subscription
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => handleNavigation("/dashboard/settings?tab=login")}
              className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Settings className="h-4 w-4" />
              Account Settings
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => alert("Refer a Friend feature coming soon!")}
              className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <UserPlus className="h-4 w-4" />
              Refer a Friend
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => alert("Language settings coming soon!")}
              className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Globe className="h-4 w-4" />
              Language
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => alert("Help center coming soon!")}
              className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <HelpCircle className="h-4 w-4" />
              Help
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            
            <DropdownMenuItem 
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 text-red-600 dark:text-red-400"
            >
              <LogOut className="h-4 w-4" />
              Log Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        </div>
      </div>
    </div>
  )
}
