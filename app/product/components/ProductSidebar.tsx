"use client";

/**
 * ProductSidebar - Wrapper around SharedSidebar for authenticated product page
 * Uses Zustand store for state management
 */

import {
  useActiveTab,
  useIsSidebarCollapsed,
  useTechPack,
  useProductImages,
  useProductPageActions,
} from "@/lib/zustand/product/productPageStore";
import { SharedSidebar } from "@/app/product/shared";
import { navItems, type NavItem } from "@/app/product/shared/utils";

interface ProductSidebarProps {
  // All props are now optional since we use Zustand store
}

export function ProductSidebar({}: ProductSidebarProps) {
  // Get state from Zustand store
  const activeTab = useActiveTab();
  const isCollapsed = useIsSidebarCollapsed();
  const techPack = useTechPack();
  const productImages = useProductImages();
  const { setActiveTab, toggleSidebar } = useProductPageActions();

  // Derived values
  const productName = techPack?.productName || "Untitled Product";
  const productThumbnail = productImages?.front;

  return (
    <SharedSidebar
      activeTab={activeTab}
      onTabChange={setActiveTab}
      isCollapsed={isCollapsed}
      onToggleCollapse={toggleSidebar}
      productName={productName}
      productThumbnail={productThumbnail}
      readOnly={false}
    />
  );
}

// Export nav items for use elsewhere
export { navItems };
export type { NavItem };
