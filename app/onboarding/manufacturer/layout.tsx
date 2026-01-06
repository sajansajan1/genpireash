import type React from "react";
import { Volkhov } from "next/font/google";
import Link from "next/link";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { LandingNavbar } from "@/components/landing-navbar";

const volkhov = Volkhov({ weight: ["400", "700"], subsets: ["latin"] });

export default function ManufacturerOnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream dark:bg-gray-950">
      <LandingNavbar />
      <main className="container mx-auto py-8 px-4 max-w-4xl">{children}</main>
    </div>
  );
}
