import React from "react";
import { Circle } from "lucide-react";
import clsx from "clsx";
import { formatLastSeen } from "@/features/messages/lib/messages-api";

interface UserStatusProps {
  isOnline: boolean;
  lastSeen?: string | null;
  showText?: boolean;
  className?: string;
}

export function UserStatus({ isOnline, lastSeen, showText = true, className }: UserStatusProps) {
  return (
    <div className={clsx("flex items-center gap-1.5", className)}>
      <Circle 
        className={clsx(
          "h-2 w-2 transition-colors", 
          isOnline ? "fill-green-500 text-green-500" : "fill-gray-300 text-gray-300"
        )} 
      />
      {showText && (
        <span className="text-[11px] font-medium text-[#64748b]">
          {isOnline ? "Online" : (
            formatLastSeen(lastSeen) === "Offline" 
              ? "Offline" 
              : `Last seen: ${formatLastSeen(lastSeen)}`
          )}
        </span>
      )}
    </div>
  );
}
