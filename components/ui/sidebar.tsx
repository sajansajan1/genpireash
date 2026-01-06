"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultOpen?: boolean
}

const Sidebar = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return <div ref={ref} className={cn("hidden border-r bg-background md:block", className)} {...props} />
  },
)
Sidebar.displayName = "Sidebar"

interface SidebarProviderProps {
  children: React.ReactNode
}

const SidebarContext = React.createContext<{
  isCollapsed: boolean
  setIsCollapsed: (isCollapsed: boolean) => void
}>({
  isCollapsed: false,
  setIsCollapsed: () => {},
})

const SidebarProvider = ({ children }: SidebarProviderProps) => {
  const [isCollapsed, setIsCollapsed] = React.useState(false)

  return <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>{children}</SidebarContext.Provider>
}

export { SidebarProvider, Sidebar }
