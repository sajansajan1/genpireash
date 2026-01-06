"use client";

/**
 * ProductHeader - Top header component for the product page
 * Includes: Back buttons, Product selector, CTA buttons, Export menu
 * Uses Zustand store for loading states
 */

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  LayoutDashboard,
  Pencil,
  Share2,
  Megaphone,
  Factory,
  Download,
  FileText,
  FileSpreadsheet,
  FolderDown,
  Copy,
  Check,
  ExternalLink,
  Loader2,
  Printer,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";
import { useDownloadLoaders, useTechPack, useProjectId, useIsPublic, useProductPageActions } from "@/lib/zustand/product/productPageStore";
import { BOMSidebar } from "./BOMSidebar";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Globe, Lock, AlertCircle } from "lucide-react";

interface ProductHeaderProps {
  onPdfDownload: () => Promise<void>;
  onExcelDownload?: () => Promise<void>;
  onFilesDownload?: () => Promise<void>;
  onPrintFileDownload?: () => Promise<void>;
  onDeleteProduct?: () => Promise<void>;
}

export function ProductHeader({
  onPdfDownload,
  onExcelDownload,
  onFilesDownload,
  onPrintFileDownload,
  onDeleteProduct,
}: ProductHeaderProps) {
  // Get state from Zustand store
  const projectId = useProjectId();
  const techPack = useTechPack();
  const isPublic = useIsPublic();
  const { setIsPublic } = useProductPageActions();
  const { pdfLoader, printFileLoader, productFilesLoader, excelLoader } = useDownloadLoaders();

  // Derived values
  const productId = projectId || "";
  const productName = techPack?.productName || "Untitled Product";
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [promoteModalOpen, setPromoteModalOpen] = useState(false);
  const [bomSidebarOpen, setBomSidebarOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isTogglingVisibility, setIsTogglingVisibility] = useState(false);

  // Public share URL - uses /p/[id] for public viewing
  const publicShareUrl = typeof window !== "undefined"
    ? `${window.location.origin}/p/${productId}`
    : "";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(publicShareUrl);
      setCopied(true);
      toast({
        title: "Link copied!",
        description: isPublic
          ? "Public link has been copied to clipboard."
          : "Link copied. Note: Product is private - only you can view it.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const handleToggleVisibility = async () => {
    if (!productId) return;
    setIsTogglingVisibility(true);
    try {
      const response = await fetch("/api/product/toggle-visibility", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        const newStatus = result.data.is_public;
        setIsPublic(newStatus);
        toast({
          title: newStatus ? "Product is now public" : "Product is now private",
          description: newStatus
            ? "Anyone with the link can view this product."
            : "Only you can view this product.",
        });
      } else {
        toast({
          title: "Failed to update visibility",
          description: result.error || "Please try again.",
          variant: "destructive",
        });
      }
    } catch (err) {
      toast({
        title: "Failed to update visibility",
        description: "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsTogglingVisibility(false);
    }
  };

  return (
    <>
      <header className="flex-shrink-0 border-b bg-background z-10">
        <div className="flex justify-between items-center px-3 py-2 gap-2 min-h-[48px]">
          {/* Left side - Back buttons */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs h-8 px-2"
              asChild
            >
              <Link href="/creator-dashboard">
                <ChevronLeft className="h-3.5 w-3.5" />
                <LayoutDashboard className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
            </Button>
            <div className="w-px h-4 bg-border mx-1 hidden sm:block" />
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5 text-xs h-8 px-2"
              asChild
            >
              <Link href={`/ai-designer?projectId=${productId}&version=modular`}>
                <Pencil className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Back to Editor</span>
              </Link>
            </Button>
          </div>

          {/* Right side - CTA buttons and menu */}
          <div className="flex items-center gap-1.5">
            {/* Share Button */}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-8 px-2.5"
              onClick={() => setShareModalOpen(true)}
            >
              <Share2 className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Share</span>
            </Button>

            {/* Promote Button */}
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs h-8 px-2.5"
              onClick={() => setPromoteModalOpen(true)}
            >
              <Megaphone className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Promote</span>
            </Button>

            {/* Manufacture Button */}
            <Button
              size="sm"
              className="gap-1.5 text-xs h-8 px-2.5 bg-primary"
              onClick={() => setBomSidebarOpen(true)}
            >
              <Factory className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Manufacture</span>
            </Button>

            {/* Downloads menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Download className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={onPdfDownload} disabled={pdfLoader}>
                  {pdfLoader ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="h-4 w-4 mr-2" />
                  )}
                  Download PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onExcelDownload} disabled={excelLoader}>
                  {excelLoader ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                  )}
                  Download Excel
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onFilesDownload} disabled={productFilesLoader}>
                  {productFilesLoader ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <FolderDown className="h-4 w-4 mr-2" />
                  )}
                  Product Files
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onPrintFileDownload} disabled={printFileLoader}>
                  {printFileLoader ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Printer className="h-4 w-4 mr-2" />
                  )}
                  Generate Print File
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Share Modal */}
      <Dialog open={shareModalOpen} onOpenChange={setShareModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share Product</DialogTitle>
            <DialogDescription>
              Share this product with others using the link below.
            </DialogDescription>
          </DialogHeader>

          {/* Visibility Toggle */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <Globe className="h-5 w-5 text-green-600" />
              ) : (
                <Lock className="h-5 w-5 text-orange-500" />
              )}
              <div>
                <Label htmlFor="public-toggle" className="text-sm font-medium">
                  {isPublic ? "Public" : "Private"}
                </Label>
                <p className="text-xs text-muted-foreground">
                  {isPublic
                    ? "Anyone with the link can view"
                    : "Only you can view this product"}
                </p>
              </div>
            </div>
            <Switch
              id="public-toggle"
              checked={isPublic}
              onCheckedChange={handleToggleVisibility}
              disabled={isTogglingVisibility}
            />
          </div>

          {/* Warning if private */}
          {!isPublic && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-orange-50 border border-orange-200 text-orange-800">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="text-xs">
                This product is private. Enable public visibility above to allow others to view it.
              </p>
            </div>
          )}

          {/* Share Link */}
          <div className="flex items-center gap-2">
            <Input
              readOnly
              value={publicShareUrl}
              className="flex-1 text-sm"
            />
            <Button
              size="sm"
              onClick={handleCopyLink}
              className="shrink-0"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>

          <div className="flex justify-end gap-2 mt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(publicShareUrl, "_blank")}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Promote Modal */}
      <Dialog open={promoteModalOpen} onOpenChange={setPromoteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Promote Product</DialogTitle>
            <DialogDescription>
              Share your product on the Made-with page or connect to social accounts.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Button variant="outline" className="w-full justify-start gap-3" disabled>
              <Image
                src="/favicon.png"
                alt="Genpire"
                width={32}
                height={32}
                className="h-8 w-8 rounded"
              />
              <div className="text-left">
                <p className="text-sm font-medium">Made with Genpire</p>
                <p className="text-xs text-muted-foreground">Feature on our showcase page</p>
              </div>
              <Badge variant="secondary" className="ml-auto">Soon</Badge>
            </Button>
            <Button variant="outline" className="w-full justify-start gap-3" disabled>
              <div className="h-8 w-8 rounded bg-black flex items-center justify-center">
                <span className="text-white text-xs">🛒</span>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium">Online Store</p>
                <p className="text-xs text-muted-foreground">Connect Shopify, WooCommerce</p>
              </div>
              <Badge variant="secondary" className="ml-auto">Soon</Badge>
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* BOM Sidebar */}
      <BOMSidebar
        isOpen={bomSidebarOpen}
        onClose={() => setBomSidebarOpen(false)}
        techPack={techPack}
        productName={productName}
      />
    </>
  );
}
