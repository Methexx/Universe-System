import React from "react";
import { TrendingUp, TrendingDown, LucideIcon } from "lucide-react";
import clsx from "clsx";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trendValue?: number | string; // e.g. "+12.5%" or 12.5
  trendDirection?: "up" | "down" | "neutral";
  variant?: "default" | "danger" | "success" | "warning" | "active" | "suspended";
  action?: React.ReactNode;
}

export function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  trendValue, 
  trendDirection = "up",
  variant = "default",
  action
}: StatCardProps) {
  
  // Style overrides mapped to the variant prop
  const variantStyles = {
    default: {
      wrapper: "border border-[#e0e7ff] bg-white",
      iconBox: "bg-[#f8fafc] text-[#64748b] border-[#f1f5f9]",
      titleText: "text-[#64748b]",
      valueText: "text-[#0f172a]",
    },
    danger: {
      wrapper: "border border-[#ffcfca] bg-[#ffeae6]",
      iconBox: "bg-[#fff2ef] text-[#475569] border-[#ffddd7]",
      titleText: "text-[#475569]",
      valueText: "text-[#0f172a]",
    },
    success: {
      wrapper: "border border-[#bbf7d0] bg-[#f0fdf4]",
      iconBox: "bg-[#dcfce7] text-[#16a34a] border-[#bbf7d0]",
      titleText: "text-[#16a34a]",
      valueText: "text-[#0f172a]",
    },
    warning: {
      wrapper: "border border-[#fef08a] bg-[#fefce8]",
      iconBox: "bg-[#fef9c3] text-[#ca8a04] border-[#fef08a]",
      titleText: "text-[#ca8a04]",
      valueText: "text-[#0f172a]",
    },
    active: {
      wrapper: "border border-[#e0e7ff] bg-white",
      iconBox: "bg-[#f8fafc] text-[#64748b] border-[#f1f5f9]",
      titleText: "text-[#64748b]",
      valueText: "text-[#cbd5e1]",
    },
    suspended: {
      wrapper: "border border-[#ffcfca] bg-[#ffeae6]",
      iconBox: "bg-[#fff2ef] text-[#475569] border-[#ffddd7]",
      titleText: "text-[#475569]",
      valueText: "text-[#f97316]",
    },
  };

  const selectedStyles = variantStyles[variant];
  
  const TrendIcon = trendDirection === "down" ? TrendingDown : TrendingUp;
  const trendColorClass = trendDirection === "down" ? "text-red-500" : "text-[#3b82f6]";

  return (
    <div className={clsx(
      "col-span-1 rounded-2xl p-[22px] shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[180px] transition-all duration-200 hover:-translate-y-1 hover:scale-[1.03] hover:shadow-lg",
      selectedStyles.wrapper
    )}>
      <div className="flex items-center justify-between">
        <div className={clsx(
          "flex h-11 w-11 items-center justify-center rounded-full border", 
          selectedStyles.iconBox
        )}>
          <Icon className="h-5 w-5" strokeWidth={2.5} />
        </div>
        
        {trendValue && (
          <div className="flex items-center gap-[6px] rounded-full border border-[#e2e8f0] bg-white px-3 py-1.5 shadow-[0_2px_6px_rgba(0,0,0,0.04)]">
            <TrendIcon className={clsx("h-[14px] w-[14px]", trendColorClass)} strokeWidth={3} />
            <span className="text-[12px] font-bold text-[#0f172a]">{trendValue}</span>
          </div>
        )}
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className={clsx("text-[13px] font-bold", selectedStyles.titleText)}>
            {title}
          </p>
          <p className={clsx("mt-1 text-[26px] font-bold leading-none", selectedStyles.valueText)}>
            {value}
          </p>
        </div>
        {action && (
          <div className="mb-1">
            {action}
          </div>
        )}
      </div>
    </div>
  );
}