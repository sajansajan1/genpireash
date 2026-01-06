"use client";

import { useState, useEffect, forwardRef, useImperativeHandle, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  Package,
  Settings,
  Menu,
  Linkedin,
  FileText,
  Shield,
  BookOpen,
  Mail,
  Lightbulb,
  FolderOpen,
  Dna,
  GalleryVertical,
  X,
  Home,
  Users,
  CreditCard,
  MessageCircle,
  PartyPopper,
  Video,
  Camera,
  Calendar,
  Factory,
  ListOrdered,
  MessageSquare,
  Box,
  PanelRightOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabase/client";
import { useGetCreditsStore } from "@/lib/zustand/credits/getCredits";
import { Badge } from "@/components/ui/badge";
import { useUserProfileStore } from "@/lib/zustand/getUserProfile";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

interface User {
  id: string;
  role: string;
  email: string;
}

export interface RoleBasedSidebarRef {
  toggleMobileMenu: () => void;
}

interface RoleBasedSidebarProps {
  role?: string;
  isMobileOpen?: boolean;
  onMobileOpenChange?: (open: boolean) => void;
}

interface SidebarItem {
  title: string;
  href: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  badge?: string;
}

interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

const creatorSections: SidebarSection[] = [
  {
    title: "PRIMARY ACTIONS",
    items: [
      {
        title: "Home",
        href: "/creator-dashboard",
        icon: Home,
      },
      {
        title: "Products",
        href: "/creator-dashboard/techpacks",
        icon: Package,
      },
      {
        title: "Collections",
        href: "/creator-dashboard/collections",
        icon: FolderOpen,
      },
    ],
  },
  {
    title: "BRAND & VISUALS",
    items: [
      {
        title: "Brand DNA",
        href: "/creator-dashboard/dna",
        icon: Dna,
      },
      {
        title: "Studio",
        href: "/creator-dashboard/tryon",
        icon: GalleryVertical,
      },
      {
        title: "3D Model Gallery",
        href: "/creator-dashboard/3d-models",
        icon: Box,
      },
      {
        title: "Ambassador",
        href: "/creator-dashboard/ambassador",
        icon: PartyPopper,
        badge: "Pro Plan",
      },
    ],
  },
  // {
  //   title: "Manufacturing",
  //   items: [
  //     {
  //       title: "Messages",
  //       href: "/creator-dashboard/messages",
  //       icon: MessageCircle,
  //     },
  //     {
  //       title: "Suppliers",
  //       href: "/creator-dashboard/suppliers",
  //       icon: Factory,
  //     },

  //     {
  //       title: "RFQ",
  //       href: "/creator-dashboard/rfqs",
  //       icon: Lightbulb,
  //     },
  //   ],
  // },
  {
    title: "ACCOUNT & BILLING",
    items: [
      {
        title: "Plans & Credits",
        href: "/pricing",
        icon: CreditCard,
      },
      {
        title: "Settings",
        href: "/creator-dashboard/settings",
        icon: Settings,
      },
    ],
  },
  {
    title: "SUPPORT",
    items: [
      {
        title: "Genpire Guide",
        href: "/creator-dashboard/guide",
        icon: BookOpen,
      },
      {
        title: "Contact Us",
        href: "mailto:support@genpire.com",
        icon: MessageCircle,
      },
      {
        title: "Schedule a demo",
        href: "https://calendly.com/adam-genpire/30min",
        icon: Calendar,
      },
    ],
  },
];

const supplierItems: SidebarSection[] = [
  {
    title: "PRIMARY ACTIONS",
    items: [
      {
        title: "Dashboard",
        href: "/supplier-dashboard",
        icon: Home,
      },
      {
        title: "RFQ",
        href: "/supplier-dashboard/rfqs",
        icon: Package,
      },
      {
        title: "Chats",
        href: "/supplier-dashboard/messages",
        icon: MessageSquare,
      },
      // {
      //   title: "Orders",
      //   href: "/",
      //   icon: ListOrdered,
      // },
    ],
  },
  {
    title: "ACCOUNT & BILLING",
    items: [
      {
        title: "Plans & Credits",
        href: "/pricing",
        icon: CreditCard,
      },
      {
        title: "Settings",
        href: "/supplier-dashboard/settings",
        icon: Settings,
      },
    ],
  },
  {
    title: "SUPPORT",
    items: [
      {
        title: "Genpire Guide",
        href: "/guide",
        icon: BookOpen,
      },
      {
        title: "Contact Us",
        href: "mailto:support@genpire.com",
        icon: MessageCircle,
      },
      {
        title: "Schedule a demo",
        href: "https://calendly.com/adam-genpire/30min",
        icon: Calendar,
      },
    ],
  },
];

export const RoleBasedSidebar = forwardRef<RoleBasedSidebarRef, RoleBasedSidebarProps>(
  ({ role: propRole, isMobileOpen, onMobileOpenChange }, ref) => {
    const pathname = usePathname();
    const [openModal, setOpenModal] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const [internalIsOpen, setInternalIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(true);
    const sidebarRef = useRef<HTMLDivElement>(null);
    const { getCreatorCredits } = useGetCreditsStore();
    const router = useRouter();
    const { getUserProfile } = useUserProfileStore();

    const isOpen = isMobileOpen !== undefined ? isMobileOpen : internalIsOpen;
    const setIsOpen = onMobileOpenChange || setInternalIsOpen;

    useImperativeHandle(ref, () => ({
      toggleMobileMenu: () => {
        setIsOpen(!isOpen);
      },
    }));

    useEffect(() => {
      const getUser = async () => {
        const {
          data: { user: authUser },
        } = await supabase.auth.getUser();

        if (authUser) {
          setUser({
            id: authUser.id,
            email: authUser.email || "",
            role: "creator",
          });
        }
      };

      getUser();
    }, []);

    const userRole = propRole || user?.role || "creator";
    const sections = userRole === "supplier" ? supplierItems : creatorSections;
    const hasSubscriptionHistory = getCreatorCredits?.hasEverHadSubscription || false;
    const isAmbassador = getUserProfile?.isAmbassador || false;

    const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
      <div
        ref={!isMobile ? sidebarRef : undefined}
        className={cn(
          "flex flex-col h-full text-zinc-900 overflow-y-auto scrollbar-hide pointer-events-auto",
          isMobile ? "" : cn("border-r border-zinc-200 shadow-sm", isExpanded ? "w-64 items-start shadow-2xl" : "w-[72px] items-center")
        )}
      >
        {/* Mobile top bar */}
        {isMobile && (
          <div className="flex items-center justify-start px-4 py-4">
            <img src="/favicon.png" alt="Genpire" className="h-7 w-auto" />
          </div>
        )}

        {/* Desktop toggle button - always visible at top when collapsed */}
        {!isMobile && !isExpanded && (
          <div className="px-3 flex justify-center mb-4 mt-4">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="w-10 h-10 flex items-center justify-center rounded-lg text-stone-600 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
              aria-label="Toggle Sidebar"
            >
              <PanelRightOpen className="h-5 w-5" />
            </button>
          </div>
        )}



        <div className={cn("flex-1 overflow-y-auto scrollbar-hide", isMobile ? "py-6 px-4" : cn("w-full space-y-6", isExpanded ? "px-4 py-6" : "px-3"))}>
          <nav className={cn("space-y-6", isMobile ? "pt-2" : "")}>
            {sections.map((section, sectionIndex) => (
              <div key={sectionIndex} className={cn("space-y-1", isMobile || isExpanded ? "" : "flex flex-col items-center")}>
                {section.title && (isMobile || isExpanded) && (
                  <div className="flex items-center justify-between px-3 mb-3">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      {section.title}
                    </h3>
                    {/* Collapsible button on right side of PRIMARY ACTIONS */}
                    {!isMobile && sectionIndex === 0 && (
                      <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="text-zinc-500 hover:text-zinc-900 transition-colors"
                        aria-label="Toggle Sidebar"
                      >
                        <PanelRightOpen className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )}

                <div className={cn("space-y-1", isMobile || isExpanded ? "" : "w-full flex flex-col items-center gap-2")}>
                  {section.items
                    .filter((item) => {
                      if (item.title === "Ambassador" && !isAmbassador) return false;
                      return true;
                    })
                    .map((item) => {
                      const isRestricted =
                        (item.title === "Collections" ||
                          item.title === "Brand DNA" ||
                          item.title === "Studio" ||
                          item.title === "3D Model Gallery" ||
                          item.title === "Ambassador") &&
                        !hasSubscriptionHistory;

                      const handleClick = (e: React.MouseEvent) => {
                        if (isRestricted) {
                          e.preventDefault();
                          router.push("/pricing");
                        } else {
                          if (isMobile) {
                            setIsOpen(false);
                          } else {
                            // On desktop, expand sidebar on click
                            setIsExpanded(true);
                          }
                        }
                      };

                      const IconComponent = item.icon;
                      const isActive = pathname === item.href;

                      const content = (
                        <div
                          className={cn(
                            "flex items-center group relative overflow-hidden",
                            (isMobile || isExpanded)
                              ? "gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors"
                              : cn(
                                "justify-center w-10 h-10 rounded-lg transition-colors",
                                isActive
                                  ? "bg-zinc-900 text-white shadow-sm"
                                  : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                              ),
                            (isMobile || isExpanded) && isActive && "bg-gray-100 text-gray-900",
                            // Restricted item styling
                            isRestricted ? "text-gray-400 cursor-pointer" : "cursor-pointer hover:bg-gray-100"
                          )}
                          onClick={isRestricted ? () => router.push("/pricing") : undefined}
                        >
                          <IconComponent className={cn("flex-shrink-0 transition-transform duration-200", isMobile ? "h-5 w-5" : "h-5 w-5", !isMobile && !isExpanded && !isActive && "group-hover:scale-110")} />

                          {(isMobile || isExpanded) && (
                            <span className="flex-1 whitespace-nowrap">
                              {item.title}
                            </span>
                          )}

                          {(isMobile || isExpanded) && item.badge && getCreatorCredits?.membership !== "pro" && (
                            <Badge className="text-xs px-2 py-0.5 bg-[#1C1917] text-white ml-auto">
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                      );

                      // Wrap in Link or a tag if not restricted
                      const linkContent = isRestricted ? content : (() => {
                        const isExternal = item.href.startsWith("http") || item.href.startsWith("mailto:");
                        if (isExternal) {
                          return (
                            <a href={item.href} target="_blank" rel="noopener noreferrer" onClick={handleClick} className={cn("w-full", !isMobile && !isExpanded && "flex justify-center")}>
                              {content}
                            </a>
                          );
                        }
                        return (
                          <Link href={item.href} onClick={handleClick} className={cn("w-full", !isMobile && !isExpanded && "flex justify-center")}>
                            {content}
                          </Link>
                        );
                      })();

                      // Wrap in Tooltip for Desktop ONLY when collapsed
                      if (!isMobile && !isExpanded) {
                        return (
                          <TooltipProvider key={item.href}>
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger asChild>
                                {linkContent}
                              </TooltipTrigger>
                              <TooltipContent side="right" className="flex items-center gap-2 font-medium" sideOffset={10}>
                                {item.title}
                                {isRestricted && <span className="text-[10px] bg-zinc-900 text-white px-1.5 py-0.5 rounded-full">PRO</span>}
                                {item.badge && !isRestricted && <span className="text-[10px] bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded-full border border-zinc-200">{item.badge}</span>}
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      }

                      // For expanded sidebar, add tooltip only for restricted items
                      if ((isMobile || isExpanded) && isRestricted) {
                        return (
                          <TooltipProvider key={item.href}>
                            <Tooltip delayDuration={0}>
                              <TooltipTrigger asChild>
                                <div>{linkContent}</div>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="space-y-1">
                                <h2 className="font-semibold">Pro Plan Only</h2>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      }

                      return (
                        <div key={item.href}>
                          {linkContent}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </nav>
        </div>

        {userRole === "creator" && (isMobile || isExpanded) && (
          <div className={cn("mt-auto border-t ", isMobile ? "p-4 space-y-5 lg:pb-6" : cn("pt-6 pb-6 w-full flex flex-col", isExpanded ? "px-6 items-start gap-5" : "px-3 items-center gap-4"))}>

            <div className="space-y-3 w-full">
              <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">CONNECT</h4>
              <div className="flex gap-3">
                <Link
                  href="https://x.com/Genpire_AI"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-800 hover:text-zinc-900 transition-colors rounded-lg p-0"
                  aria-label="X (Twitter)"
                >
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </Link>

                <Link
                  href="https://www.youtube.com/@genpire"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-zinc-800 hover:text-zinc-900 transition-colors rounded-lg p-0"
                  aria-label="YouTube"
                >
                  <Video className="h-5 w-5" />
                </Link>
              </div>
            </div>

            <div className={cn("space-y-2", isMobile || isExpanded ? "w-full" : "flex flex-col items-center gap-2")}>
              {(isMobile || isExpanded) && <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">LEGAL</h4>}
              <div className={cn("space-y-1", isMobile || isExpanded ? "w-full" : "flex flex-col gap-2")}>
                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        href="/terms"
                        className={cn("flex items-center transition-colors", isMobile || isExpanded ? "gap-2 text-sm text-gray-600 hover:text-gray-900" : "p-2 hover:bg-zinc-50 rounded-lg text-zinc-400 hover:text-zinc-900")}
                      >
                        <FileText className={cn("h-4 w-4", !isMobile && !isExpanded && "h-5 w-5")} />
                        {(isMobile || isExpanded) && <span>Terms of Service</span>}
                      </Link>
                    </TooltipTrigger>
                    {!isMobile && !isExpanded && <TooltipContent side="right">Terms of Service</TooltipContent>}
                  </Tooltip>
                </TooltipProvider>

                <TooltipProvider>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>
                      <Link
                        href="/privacy"
                        className={cn("flex items-center transition-colors", isMobile || isExpanded ? "gap-2 text-sm text-gray-600 hover:text-gray-900" : "p-2 hover:bg-zinc-50 rounded-lg text-zinc-400 hover:text-zinc-900")}
                      >
                        <Shield className={cn("h-4 w-4", !isMobile && !isExpanded && "h-5 w-5")} />
                        {(isMobile || isExpanded) && <span>Privacy Policy</span>}
                      </Link>
                    </TooltipTrigger>
                    {!isMobile && !isExpanded && <TooltipContent side="right">Privacy Policy</TooltipContent>}
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </div>
        )}
      </div>
    );

    return (
      <>
        <div className="hidden lg:block h-full">
          <SidebarContent isMobile={false} />
        </div>

        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent side="left" className="p-0 w-64">
            <SidebarContent isMobile={true} />
          </SheetContent>
        </Sheet>
      </>
    );
  }
);

RoleBasedSidebar.displayName = "RoleBasedSidebar";
