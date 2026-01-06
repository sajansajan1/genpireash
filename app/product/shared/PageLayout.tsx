"use client";

/**
 * Shared PageLayout Component
 * Main layout shell for product pages with sidebar, main content, and mobile nav
 */

import { cn } from "@/lib/utils";

interface PageLayoutProps {
  /** Header component */
  header: React.ReactNode;
  /** Sidebar component (desktop only) */
  sidebar?: React.ReactNode;
  /** Main content */
  children: React.ReactNode;
  /** Mobile bottom navigation */
  mobileNav?: React.ReactNode;
  /** Optional chat panel (for private pages) */
  chatPanel?: React.ReactNode;
  /** Additional class names for main content */
  mainClassName?: string;
}

export function PageLayout({
  header,
  sidebar,
  children,
  mobileNav,
  chatPanel,
  mainClassName,
}: PageLayoutProps) {
  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      {header}

      {/* Main layout with optional chat panel, sidebar, and content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Optional chat panel (for private pages with agentic chat) */}
        {chatPanel}

        {/* Desktop Sidebar */}
        {sidebar}

        {/* Main content area */}
        <main className={cn("flex-1 overflow-y-auto pb-12 md:pb-4 flex flex-col", mainClassName)}>
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      {mobileNav}
    </div>
  );
}

export default PageLayout;
