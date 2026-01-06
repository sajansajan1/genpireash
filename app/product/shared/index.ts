/**
 * Shared exports for product pages (both public and private views)
 */

// Utilities and types
export {
  navItems,
  renderValue,
  capitalizeTitle,
  formatDate,
  type NavItem,
  type TechFileData,
  type TechFilesData,
} from "./utils";

// Components
export { TechFileGuideModal } from "./TechFileGuideModal";
export { SharedSidebar } from "./Sidebar";
export { SharedInfoBar } from "./InfoBar";
export { SharedHeader } from "./Header";
export { ImageViewerModal } from "./ImageViewerModal";
export { MobileBottomNav } from "./MobileBottomNav";
export { ImageGalleryCanvas } from "./ImageGalleryCanvas";
export { ProductNotFound } from "./ProductNotFound";
export { ProductSkeleton } from "./ProductSkeleton";
export { PageLayout } from "./PageLayout";
