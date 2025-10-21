"use client";

import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdminStatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  onClick?: () => void;
  variant?: "default" | "warning" | "success" | "info";
  className?: string;
  subtitle?: string;
  formatValue?: (value: number | string) => string;
}

const variantStyles = {
  default: {
    gradient: "from-primary/10 via-primary/5 to-background",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    border: "border-primary/20",
  },
  warning: {
    gradient: "from-orange-500/10 via-orange-500/5 to-background",
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-500",
    border: "border-orange-500/20",
  },
  success: {
    gradient: "from-green-500/10 via-green-500/5 to-background",
    iconBg: "bg-green-500/10",
    iconColor: "text-green-500",
    border: "border-green-500/20",
  },
  info: {
    gradient: "from-blue-500/10 via-blue-500/5 to-background",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-500",
    border: "border-blue-500/20",
  },
};

export function AdminStatsCard({
  title,
  value,
  icon: Icon,
  onClick,
  variant = "default",
  className,
  subtitle,
  formatValue,
}: AdminStatsCardProps) {
  const styles = variantStyles[variant];
  const isClickable = !!onClick;
  const displayValue = formatValue
    ? formatValue(value)
    : typeof value === "number"
    ? value.toLocaleString()
    : value;

  return (
    <Card
      className={cn(
        "relative overflow-hidden border transition-all duration-300",
        styles.border,
        isClickable &&
          "cursor-pointer hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]",
        className
      )}
      onClick={onClick}
    >
      <CardContent
        className={cn(
          "p-6 bg-gradient-to-br",
          styles.gradient,
          "min-h-[140px] flex flex-col justify-between"
        )}
      >
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              "p-3 rounded-lg backdrop-blur-sm border border-border/50 transition-transform duration-300",
              styles.iconBg,
              isClickable && "group-hover:scale-110"
            )}
          >
            <Icon className={cn("h-5 w-5", styles.iconColor)} />
          </div>
        </div>

        <div className="flex-1 flex flex-col justify-end">
          <div className="text-3xl md:text-4xl font-bold text-foreground mb-2 tabular-nums">
            {displayValue}
          </div>
          <div className="text-sm text-muted-foreground font-medium leading-tight">
            {title}
          </div>
          {subtitle && (
            <div className="text-xs text-muted-foreground/70 mt-1">
              {subtitle}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
