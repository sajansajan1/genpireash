"use client";

import { useState } from "react";
import { RoleBasedSidebar } from "@/components/shared/role-based-sidebar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function SidebarDemo() {
  const [role, setRole] = useState<"creator" | "supplier">("creator");

  return (
    <div className="border rounded-lg overflow-hidden">
      <div className="p-4 bg-muted">
        <Tabs defaultValue="creator" onValueChange={(value) => setRole(value as "creator" | "supplier")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="creator">Creator View</TabsTrigger>
            <TabsTrigger value="supplier">Supplier View</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex h-[500px] border-t">
        <RoleBasedSidebar role={role} />
        <div className="flex-1 p-4 overflow-auto">
          <Card>
            <CardHeader>
              <CardTitle>{role === "creator" ? "Creator" : "Supplier"} Dashboard</CardTitle>
              <CardDescription>
                This is a demo of the {role === "creator" ? "creator" : "supplier"} dashboard with the responsive
                sidebar.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>
                The sidebar automatically adapts based on the user role, showing different navigation options. It's also
                responsive, collapsing to a hamburger menu on mobile devices.
              </p>
              <div className="mt-4 text-sm text-[#1C1917]">
                Try resizing your browser window to see how the sidebar responds.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
