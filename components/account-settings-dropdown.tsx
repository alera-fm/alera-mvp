
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { 
  User, 
  CreditCard, 
  Monitor, 
  LogOut,
  Settings
} from "lucide-react"
import { toast } from "react-hot-toast"

interface AccountSettingsDropdownProps {
  user?: {
    email: string
    display_name?: string
  }
}

export function AccountSettingsDropdown({ user }: AccountSettingsDropdownProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    toast.success("Logged out successfully")
    router.push("/auth/login")
  }

  const navigateTo = (path: string) => {
    router.push(path)
    setIsOpen(false)
  }

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    }
    if (email) {
      return email.slice(0, 2).toUpperCase()
    }
    return "U"
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Avatar className="h-8 w-8">
            <AvatarImage src="" alt={user?.display_name || user?.email} />
            <AvatarFallback className="bg-[#6366f1] text-white text-sm">
              {getInitials(user?.display_name, user?.email)}
            </AvatarFallback>
          </Avatar>
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-56 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700"
      >
        <div className="px-3 py-2 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
            {user?.display_name || "User"}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {user?.email}
          </p>
        </div>
        
        <DropdownMenuItem 
          onClick={() => navigateTo("/dashboard/settings")}
          className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <Settings className="h-4 w-4" />
          Settings & Profile
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => navigateTo("/dashboard/settings?tab=billing")}
          className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <CreditCard className="h-4 w-4" />
          Billing History
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => navigateTo("/dashboard/settings?tab=login")}
          className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
        >
          <Monitor className="h-4 w-4" />
          Login History
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 text-red-600 dark:text-red-400"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
