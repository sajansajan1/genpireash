"use client";

import type React from "react";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "@/components/ui/sidebar";
import {
  ShoppingBag,
  Users,
  Settings,
  FileText,
  BarChart3,
  CreditCard,
  MessageSquare,
  Factory,
  FileStack,
  Menu,
} from "lucide-react";

interface DashboardSidebarProps {
  defaultOpen?: boolean;
  children?: React.ReactNode;
}

export function DashboardSidebar({ defaultOpen = false, children }: DashboardSidebarProps) {
  const pathname = usePathname();

  const routes = [
    {
      label: "Tech Packs",
      icon: FileStack,
      href: "/creator-dashboard/techpacks",
      active: pathname === "/creator-dashboard/techpacks" || pathname.startsWith("/creator-dashboard/techpacks/"),
    },
    {
      label: "Products",
      icon: ShoppingBag,
      href: "/creator-dashboard/products",
      active: pathname === "/creator-dashboard/products" || pathname.startsWith("/creator-dashboard/products/"),
    },
    {
      label: "Suppliers",
      icon: Factory,
      href: "/creator-dashboard/suppliers",
      active: pathname === "/creator-dashboard/suppliers" || pathname.startsWith("/creator-dashboard/suppliers/"),
    },
    {
      label: "RFQs",
      icon: FileText,
      href: "/creator-dashboard/rfqs",
      active: pathname === "/creator-dashboard/rfqs" || pathname.startsWith("/creator-dashboard/rfqs/"),
    },
    {
      label: "Messages",
      icon: MessageSquare,
      href: "/messages",
      active: pathname === "/messages",
    },
    {
      label: "Analytics",
      icon: BarChart3,
      href: "/creator-dashboard/analytics",
      active: pathname === "/creator-dashboard/analytics",
    },
    {
      label: "Team",
      icon: Users,
      href: "/creator-dashboard/team",
      active: pathname === "/creator-dashboard/team",
    },
    {
      label: "Billing",
      icon: CreditCard,
      href: "/creator-dashboard/billing",
      active: pathname === "/creator-dashboard/billing",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/creator-dashboard/settings",
      active: pathname === "/creator-dashboard/settings" || pathname.startsWith("/creator-dashboard/settings/"),
    },
  ];

  return (
    <>
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon" className="shrink-0 md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-72 p-0">
          <nav className="grid gap-2 p-4 text-lg font-medium">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent hover:text-accent-foreground",
                  route.active ? "bg-accent text-accent-foreground" : "text-[#1C1917]"
                )}
              >
                <route.icon className="h-5 w-5" />
                {route.label}
              </Link>
            ))}
          </nav>
        </SheetContent>
      </Sheet>
      <Sidebar className="hidden border-r bg-background md:block">
        <ScrollArea className="h-full py-6">
          <nav className="grid gap-2 px-4 text-sm font-medium">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-accent hover:text-accent-foreground",
                  route.active ? "bg-accent text-accent-foreground" : "text-[#1C1917]"
                )}
              >
                <route.icon className="h-5 w-5" />
                {route.label}
              </Link>
            ))}
          </nav>
          {children}
        </ScrollArea>
      </Sidebar>
    </>
  );
}
