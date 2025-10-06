"use client";

import { useState } from "react";

interface SimpleSocialAvatarProps {
  platform: "instagram" | "tiktok" | "youtube" | "facebook";
  username: string;
  profilePicture?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function SimpleSocialAvatar({
  platform,
  username,
  profilePicture,
  size = "md",
  className = "",
}: SimpleSocialAvatarProps) {
  const [showFallback, setShowFallback] = useState(!profilePicture);

  const sizeClasses = {
    sm: "w-8 h-8 text-sm",
    md: "w-16 h-16 text-xl",
    lg: "w-24 h-24 text-2xl",
  };

  const platformColors = {
    instagram: "from-pink-500 via-red-500 to-yellow-500",
    tiktok: "from-gray-800 to-gray-900",
    youtube: "from-red-500 to-red-600",
    facebook: "from-blue-600 to-blue-700",
  };

  const platformIcons = {
    instagram: "📷",
    tiktok: "🎵",
    youtube: "📺",
    facebook: "👤",
  };

  const getInitials = (username: string) => {
    return username.slice(0, 2).toUpperCase();
  };

  // Always show the beautiful platform avatar
  return (
    <div
      className={`${sizeClasses[size]} rounded-full bg-gradient-to-br ${platformColors[platform]} flex items-center justify-center text-white font-bold shadow-lg ${className}`}
    >
      <div className="text-center">
        <div className="text-lg leading-none">{platformIcons[platform]}</div>
        <div className="text-xs leading-tight mt-1">
          {getInitials(username)}
        </div>
      </div>
    </div>
  );
}
