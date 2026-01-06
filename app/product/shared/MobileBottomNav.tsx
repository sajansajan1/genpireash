"use client";

/**
 * Shared MobileBottomNav Component
 * Bottom navigation bar for mobile devices
 * Works in both authenticated and public modes
 */

import { cn } from "@/lib/utils";
import { navItems } from "./utils";

interface MobileBottomNavProps {
  /** Current active tab */
  activeTab: string;
  /** Callback when tab changes */
  onTabChange: (tab: string) => void;
}

export function MobileBottomNav({
  activeTab,
  onTabChange,
}: MobileBottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full px-1 py-2 transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className={cn("h-5 w-5", isActive && "text-primary")} />
              <span
                className={cn(
                  "text-[10px] mt-1 truncate max-w-full",
                  isActive ? "font-medium" : "font-normal"
                )}
              >
                {/* Shorten "Factory Specs" for mobile */}
                {item.label === "Factory Specs" ? "Factory" : item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

export default MobileBottomNav;
