"use client";

/**
 * ProductInfoBar - Wrapper around SharedInfoBar for authenticated product page
 * Shows product name, description, date, visibility toggle, and stats
 * NOTE: Stats and visibility toggle temporarily hidden for future use
 */

// TEMPORARILY HIDDEN - Imports commented out for future use
// import { useState } from "react";
// import { Switch } from "@/components/ui/switch";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipProvider,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { Eye, ThumbsUp, Globe, Lock } from "lucide-react";
// import { toast } from "@/components/ui/use-toast";
import { SharedInfoBar } from "@/app/product/shared";

interface ProductInfoBarProps {
  productName: string;
  description?: string;
  category?: string;
  createdAt?: string;
  isPublic?: boolean;
  viewCount?: number;
  upvoteCount?: number;
  onVisibilityChange?: (isPublic: boolean) => Promise<void>;
}

export function ProductInfoBar({
  productName,
  description,
  category,
  createdAt,
  // TEMPORARILY HIDDEN - Props commented out for future use
  // isPublic = false,
  // viewCount = 0,
  // upvoteCount = 0,
  // onVisibilityChange,
}: ProductInfoBarProps) {
  // TEMPORARILY HIDDEN - State and handlers commented out for future use
  // const [visibility, setVisibility] = useState(isPublic);
  // const [isUpdating, setIsUpdating] = useState(false);

  // const handleVisibilityToggle = async () => {
  //   if (!onVisibilityChange) return;

  //   const newVisibility = !visibility;
  //   setIsUpdating(true);

  //   try {
  //     await onVisibilityChange(newVisibility);
  //     setVisibility(newVisibility);
  //     toast({
  //       title: newVisibility ? "Product is now public" : "Product is now private",
  //       description: newVisibility
  //         ? "Anyone with the link can view this product."
  //         : "Only you can see this product.",
  //     });
  //   } catch (err) {
  //     toast({
  //       title: "Failed to update visibility",
  //       description: "Please try again.",
  //       variant: "destructive",
  //     });
  //   } finally {
  //     setIsUpdating(false);
  //   }
  // };

  // TEMPORARILY HIDDEN - Stats and visibility toggle commented out for future use
  // const authenticatedActions = (
  //   <TooltipProvider>
  //     <div className="flex items-center gap-4">
  //       {/* Stats */}
  //       <div className="flex items-center gap-3 text-sm text-muted-foreground">
  //         <Tooltip>
  //           <TooltipTrigger asChild>
  //             <span className="flex items-center gap-1 cursor-default">
  //               <Eye className="h-3.5 w-3.5" />
  //               {viewCount}
  //             </span>
  //           </TooltipTrigger>
  //           <TooltipContent>
  //             <p>{viewCount} views</p>
  //           </TooltipContent>
  //         </Tooltip>

  //         <Tooltip>
  //           <TooltipTrigger asChild>
  //             <span className="flex items-center gap-1 cursor-default">
  //               <ThumbsUp className="h-3.5 w-3.5" />
  //               {upvoteCount}
  //             </span>
  //           </TooltipTrigger>
  //           <TooltipContent>
  //             <p>{upvoteCount} upvotes</p>
  //           </TooltipContent>
  //         </Tooltip>
  //       </div>

  //       {/* Visibility Toggle */}
  //       <div className="flex items-center gap-2 pl-3 border-l">
  //         <Tooltip>
  //           <TooltipTrigger asChild>
  //             <div className="flex items-center gap-2">
  //               {visibility ? (
  //                 <Globe className="h-4 w-4 text-green-600" />
  //               ) : (
  //                 <Lock className="h-4 w-4 text-muted-foreground" />
  //               )}
  //               <Switch
  //                 checked={visibility}
  //                 onCheckedChange={handleVisibilityToggle}
  //                 disabled={isUpdating || !onVisibilityChange}
  //                 className="data-[state=checked]:bg-green-600"
  //               />
  //             </div>
  //           </TooltipTrigger>
  //           <TooltipContent>
  //             <p>{visibility ? "Public - Anyone can view" : "Private - Only you can view"}</p>
  //           </TooltipContent>
  //         </Tooltip>
  //         <span className="text-xs text-muted-foreground hidden sm:inline">
  //           {visibility ? "Public" : "Private"}
  //         </span>
  //       </div>
  //     </div>
  //   </TooltipProvider>
  // );

  return (
    <SharedInfoBar
      productName={productName}
      description={description}
      category={category}
      createdAt={createdAt}
      // actions={authenticatedActions}
    />
  );
}
