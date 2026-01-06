/**
 * useProductManagement Hook
 * Manages product listing, selection, and name extraction
 */

import { useState, useEffect } from "react";
import { getUserProducts, type UserProduct } from "@/app/actions/get-user-products";
import { extractProductNameAction } from "@/app/actions/extract-product-name";
import { devLog } from "../../utils/devLogger";
import type { ViewImages } from "../../types";

export interface UseProductManagementReturn {
  userProducts: UserProduct[];
  extractedProductName: string | null;
  isProductDropdownOpen: boolean;
  setIsProductDropdownOpen: (open: boolean) => void;
}

export function useProductManagement(
  productId: string | null,
  currentViews: ViewImages
): UseProductManagementReturn {
  const [userProducts, setUserProducts] = useState<UserProduct[]>([]);
  const [extractedProductName, setExtractedProductName] = useState<string | null>(null);
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);

  // Reset extracted product name when productId changes (switching to a new product)
  useEffect(() => {
    setExtractedProductName(null);
  }, [productId]);

  // Fetch user products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      devLog("fetch-products", "Fetching user products...");
      const result = await getUserProducts();
      if (result.success && result.products) {
        devLog(
          "fetch-products",
          `✅ Loaded ${result.products.length} products`
        );
        setUserProducts(result.products);
      } else {
        console.error("❌ Failed to fetch products:", result.error);
      }
    };
    fetchProducts();
  }, []);

  // Extract product name when first view is generated
  useEffect(() => {
    const extractName = async () => {
      if (
        currentViews &&
        currentViews.front &&
        !currentViews.front.includes("placeholder") &&
        !extractedProductName // Only extract once
      ) {
        const name = await extractProductNameAction(
          currentViews.front,
          productId
        );
        devLog("extract-product-name", { name }, "Product name extracted");
        if (name) {
          setExtractedProductName(name);
        }
      }
    };

    extractName();
  }, [currentViews?.front, productId, extractedProductName]);

  return {
    userProducts,
    extractedProductName,
    isProductDropdownOpen,
    setIsProductDropdownOpen,
  };
}
