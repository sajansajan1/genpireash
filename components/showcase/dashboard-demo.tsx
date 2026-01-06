"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  FileStack,
  Factory,
  FileText,
  Settings,
  LayoutDashboard,
  Sparkles,
  MessageSquare,
  Building2,
} from "lucide-react";
import Link from "next/link";

export function DashboardDemo() {
  const [role, setRole] = useState<"creator" | "supplier">("creator");

  const creatorNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: FileStack, label: "Tech Packs", active: false },
    { icon: Factory, label: "Suppliers", active: false },
    { icon: FileText, label: "RFQs", active: false },
    { icon: Settings, label: "Settings", active: false },
  ];

  const supplierNavItems = [
    { icon: LayoutDashboard, label: "Dashboard", active: true },
    { icon: Sparkles, label: "Tech Packs", active: false },
    { icon: FileText, label: "RFQs", active: false },
    { icon: MessageSquare, label: "Messages", active: false },
    { icon: Building2, label: "Profile", active: false },
    { icon: Settings, label: "Settings", active: false },
  ];

  const navItems = role === "creator" ? creatorNavItems : supplierNavItems;

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Interactive Dashboard Demo</CardTitle>
        <Tabs value={role} onValueChange={(value) => setRole(value as "creator" | "supplier")} className="mt-2">
          <TabsList>
            <TabsTrigger value="creator">Creator View</TabsTrigger>
            <TabsTrigger value="supplier">Supplier View</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent className="p-0">
        <div className="flex border-t">
          {/* Sidebar */}
          <div className="w-[200px] border-r bg-muted/20 p-2 hidden md:block">
            <div className="py-2 px-4 font-semibold border-b mb-2">
              Genpire {role === "creator" ? "Creator" : "Supplier"}
            </div>
            <nav className="space-y-1">
              {navItems.map((item, i) => (
                <div
                  key={i}
                  className={`flex items-center gap-2 px-4 py-2 text-sm rounded-md ${
                    item.active ? "bg-accent text-zinc-900" : "text-[#1C1917] hover:bg-accent/50"
                  }`}
                >
                  <item.icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </div>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="flex-1 p-4">
            <h3 className="text-lg font-medium mb-4">
              {role === "creator" ? "Creator Dashboard" : "Supplier Dashboard"}
            </h3>
            <div className="grid grid-cols-3 gap-4">
              {role === "creator" ? (
                <>
                  <div className="p-4 rounded-md bg-muted/20 flex flex-col items-center justify-center">
                    <FileStack className="h-8 w-8 mb-2 text-[#1C1917]" />
                    <div className="text-sm font-medium">Tech Packs</div>
                  </div>
                  <div className="p-4 rounded-md bg-muted/20 flex flex-col items-center justify-center">
                    <Factory className="h-8 w-8 mb-2 text-[#1C1917]" />
                    <div className="text-sm font-medium">Suppliers</div>
                  </div>
                  <div className="p-4 rounded-md bg-muted/20 flex flex-col items-center justify-center">
                    <FileText className="h-8 w-8 mb-2 text-[#1C1917]" />
                    <div className="text-sm font-medium">RFQs</div>
                  </div>
                </>
              ) : (
                <>
                  <div className="p-4 rounded-md bg-muted/20 flex flex-col items-center justify-center">
                    <FileText className="h-8 w-8 mb-2 text-[#1C1917]" />
                    <div className="text-sm font-medium">RFQs</div>
                  </div>
                  <div className="p-4 rounded-md bg-muted/20 flex flex-col items-center justify-center">
                    <Sparkles className="h-8 w-8 mb-2 text-[#1C1917]" />
                    <div className="text-sm font-medium">Tech Packs</div>
                  </div>
                  <div className="p-4 rounded-md bg-muted/20 flex flex-col items-center justify-center">
                    <Building2 className="h-8 w-8 mb-2 text-[#1C1917]" />
                    <div className="text-sm font-medium">Profile</div>
                  </div>
                </>
              )}
            </div>
            <div className="mt-6 text-center">
              <Button asChild>
                <Link href={role === "creator" ? "/creator-dashboard" : "/supplier-dashboard"}>
                  Go to {role === "creator" ? "Creator" : "Supplier"} Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
