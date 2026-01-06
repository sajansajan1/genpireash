"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { BarChart3, Users, Shield, PartyPopper, Palette, LucidePartyPopper, Factory, Gift, Box } from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/admin", icon: BarChart3 },
  { name: "Creators", href: "/admin/creators", icon: Palette },
  { name: "Ambassador", href: "/admin/ambassador", icon: PartyPopper },
  { name: "Supplier", href: "/admin/supplier", icon: Factory },
  { name: "Announcements", href: "/admin/announcements", icon: LucidePartyPopper },
  { name: "Credits", href: "/admin/credits-table", icon: Gift },
  { name: "Products", href: "/admin/products", icon: Box },
];

export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white shadow-sm border-r">
      <div className="flex items-center px-6 py-4 border-b">
        <Shield className="h-8 w-8 text-blue-600" />
        <span className="ml-2 text-xl font-bold">Genpire Admin</span>
      </div>
      <nav className="mt-6">
        <div className="px-3">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "group flex items-center px-3 py-2 text-sm font-medium rounded-md mb-1",
                  isActive ? "bg-blue-50 text-blue-700" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}
              >
                <item.icon
                  className={cn("mr-3 h-5 w-5", isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500")}
                />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
