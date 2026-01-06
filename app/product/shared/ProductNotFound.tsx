"use client";

/**
 * Shared ProductNotFound Component
 * Error state when product is not available or private
 */

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

interface ProductNotFoundProps {
  /** Error message to display */
  error?: string | null;
  /** Title text */
  title?: string;
  /** Whether to show sign-in button */
  showSignIn?: boolean;
}

export function ProductNotFound({
  error,
  title = "Product Not Available",
  showSignIn = true,
}: ProductNotFoundProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Lock className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground mb-6 max-w-md">
          {error || "This product is either private or doesn't exist."}
        </p>
        <div className="flex gap-3 justify-center">
          <Button asChild variant="outline">
            <Link href="/">Go Home</Link>
          </Button>
          {showSignIn && (
            <Button asChild>
              <Link href="/auth/sign-in">Sign In</Link>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductNotFound;
