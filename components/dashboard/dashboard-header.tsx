"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import { ChevronDown, InfoIcon, LogOut, Settings, UserIcon, HelpCircle, Menu, Bell, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/ui/user-avatar";
import { GenpireLogo } from "@/components/ui/genpire-logo";
import { useMobile } from "@/hooks/use-mobile";
import { NotificationDropdown } from "@/components/ui/notification-dropdown";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUserStore } from "@/lib/zustand/useStore";
import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";
import { useGetNotificationsStore } from "@/lib/zustand/notifications/getNotification";
import { Dialog, DialogContent, DialogClose, DialogTitle } from "@/components/ui/dialog";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { Badge } from "../ui/badge";
import ProductGuideModal from "../product-guide-modal";
import GenpirePaymentModal from "../genpire-payment-modal";
import { MediaUploadModal } from "./media-upload-modal";
import { getCurrentUser } from "@/lib/auth-service";
interface DashboardHeaderProps {
  sidebarContent?: React.ReactNode;
  onMobileMenuToggle?: () => void;
}

export function DashboardHeader({ sidebarContent, onMobileMenuToggle }: DashboardHeaderProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const router = useRouter();
  const isMobile = useMobile();
  const { user, clear } = useUserStore();
  // Use Zustand store - RealtimeCreditsProvider handles real-time updates
  const { getCreatorCredits, refresCreatorCredits } = useGetCreditsStore();
  const credits = getCreatorCredits;
  const refetch = refresCreatorCredits;
  const { fetchUserNotifications } = useGetNotificationsStore();
  const [openModal, setOpenModal] = useState(false);
  const [role, setRole] = useState("");
  useEffect(() => {
    async function fetchUser() {
      const users = await getCurrentUser();
      console.log(users);
      const userRole = users?.user_metadata?.user_role || users?.identities?.[0]?.provider;
      setRole(userRole);
    }

    fetchUser();
  }, []);

  useEffect(() => {
    fetchUserNotifications();
  }, [fetchUserNotifications]);

  useEffect(() => {
    const header = document.getElementById("dashboard-header");
    if (header) {
      document.documentElement.style.setProperty("--header-height", `${header.offsetHeight}px`);
    }
  }, [credits?.credits]);

  const handleSignOut = async () => {
    try {
      setIsLoggingOut(true);
      await supabase.auth.signOut();
      clear();
      window.location.assign("/");
    } catch (error) {
      console.error("Error signing out:", error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <>
      {/* {role !== "supplier" && credits?.credits === 0 && (
        <div className="bg-[#1C1917] text-white px-3 py-2 sm:px-4 sm:py-3 text-center overflow-hidden relative">
          <div className="absolute inset-0 bg-white/5 animate-pulse"></div>

          <div className="relative flex flex-col items-center gap-1.5 sm:gap-2 text-center">
            <div className="flex items-center gap-1 sm:gap-2">
              <span className="font-semibold text-[10px] sm:text-xs">🚀 Ready to create amazing products?</span>
            </div>
            <span className="text-[9px] sm:text-xs text-blue-100">
              Purchase credits to start generating professional tech packs instantly!
            </span>
            <Button
              size="sm"
              className="h-6 sm:h-7 text-[9px] sm:text-xs font-semibold bg-white text-black hover:bg-blue-50 shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105 w-full sm:w-auto max-w-xs px-2 sm:px-3"
              onClick={() => setOpenModal(true)}
            >
              ✨ Get Credits Now
            </Button>
          </div>
        </div>
      )} */}

      <div className="flex flex-col">
        {/* Credits Banner - Show when credits are 0 */}

        <header className="sticky top-0 z-30 flex h-14 sm:h-16 w-full items-center justify-between border-b bg-background px-3 sm:px-4 md:px-6">
          <div className="flex items-center gap-2">
            {isMobile && onMobileMenuToggle && (
              <Button
                size="icon"
                variant="ghost"
                onClick={onMobileMenuToggle}
                className="lg:hidden h-8 w-8 sm:h-9 sm:w-9 cursor-pointer bg-transparent hover:bg-transparent"
                aria-label="Toggle navigation menu"
              >
                <Menu className="h-4 w-4 sm:h-5 sm:w-5 text-[#1C1917]" />
              </Button>
            )}
            <Link href="/creator-dashboard" className="hidden lg:flex items-center">
              <div className="relative w-[120px] h-[40px]">
                <img src="/creatorheadlogo.png" alt="Genpire" className="object-contain w-full h-full" />
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
            {role !== "supplier" && (
              <>
                <MediaUploadModal />
                <Button
                  variant="ghost"
                  className={`flex items-center gap-1 px-2 sm:px-3 py-1 border rounded-full text-xs font-medium h-7 sm:h-8 transition-colors`}
                  onClick={() => setIsDemoModalOpen(true)}
                >
                  <HelpCircle className="h-2 w-2 sm:h-3 sm:w-3 text-[#1C1917]" />
                </Button>
              </>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className={`flex items-center gap-1 px-2 sm:px-3 py-1 border rounded-full text-xs font-medium h-7 sm:h-8 transition-colors ${credits?.credits === 0
                      ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                      : (credits?.credits ?? 0) <= 5
                        ? "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
                        : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                      }`}
                    onClick={() => setOpenModal(true)}
                  >
                    <span className="text-xs font-semibold">
                      <span className="sm:hidden">{credits?.credits ? credits?.credits : 0} credits</span>
                      <span className="hidden sm:inline">{credits?.credits ? credits?.credits : 0} credits</span>
                    </span>
                    <InfoIcon className="h-2 w-2 sm:h-3 sm:w-3 text-[#1C1917]" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-xs">3 Credits = 1 Product Generation (all 5 views)</p>
                  <p className="text-xs">2 Credits = 1 Design Edit</p>
                  <p className="text-xs text-[#1C1917] mt-2">Click to purchase more credits</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Notification Dropdown - Hidden on mobile, shown on tablet+ */}
            <div className="hidden sm:block">
              <NotificationDropdown />
            </div>

            {/* User Dropdown Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-1 sm:gap-2 px-1 sm:px-2">
                  <UserAvatar user={user} />
                  <div className="hidden md:flex flex-col items-start">
                    <span className="text-sm font-medium text-black">
                      {user?.full_name || user?.email?.split("@")[0] || "User"}{" "}
                      {(credits?.membership === "saver" || credits?.membership === "pro") && (
                        <Badge
                          className={cn(
                            "bg-[#1C1917] text-white cursor-pointer text-[10px] px-1.5 py-0.5 rounded-sm leading-tight"
                          )}
                        >
                          {credits?.membership.charAt(0).toUpperCase() + credits?.membership.slice(1).toLowerCase()}
                        </Badge>
                      )}
                    </span>
                    <span className="text-xs text-[#1C1917] truncate max-w-[150px]">{user?.email}</span>
                  </div>
                  <ChevronDown className="h-3 w-3 sm:h-4 sm:w-4 text-[#1C1917]" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />

                {/* Mobile-only menu items */}
                {isMobile && (
                  <>
                    <DropdownMenuItem asChild>
                      <button
                        onClick={() => setShowHowItWorks(true)}
                        className="cursor-pointer flex w-full items-center"
                      >
                        <HelpCircle className="mr-2 h-4 w-4" />
                        How it works
                      </button>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <a className="cursor-pointer flex w-full items-center">
                        <Bell className="mr-2 h-4 w-4" />
                        Notifications
                      </a>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}

                <DropdownMenuItem asChild>
                  {role === "creator" ? (
                    <a href="/creator-dashboard/settings" className="cursor-pointer flex w-full items-center">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profile
                    </a>
                  ) : (
                    <a href="/supplier-dashboard/settings" className="cursor-pointer flex w-full items-center">
                      <UserIcon className="mr-2 h-4 w-4" />
                      Profile
                    </a>
                  )}
                </DropdownMenuItem>

                <DropdownMenuItem asChild>
                  {role === "creator" ? (
                    <a
                      href="/creator-dashboard/settings?tab=billing"
                      className="cursor-pointer flex w-full items-center"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </a>
                  ) : (
                    <a
                      href="/supplier-dashboard/settings?tab=billing"
                      className="cursor-pointer flex w-full items-center"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Settings
                    </a>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} disabled={isLoggingOut} className="cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  {isLoggingOut ? "Signing out..." : "Sign out"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* PayPal Modal */}
        {openModal && (
          <GenpirePaymentModal showPaymentModal={openModal} setShowPaymentModal={setOpenModal} userRole={role} />
        )}

        <ProductGuideModal
          onClose={() => setIsDemoModalOpen(false)}
          isDemoModalOpen={isDemoModalOpen}
          setIsDemoModalOpen={setIsDemoModalOpen}
        />
      </div>
    </>
  );
}
