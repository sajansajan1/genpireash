/**
 * ProductSwitcher Component
 * Dropdown to switch between user's products
 */

import React from "react";
import { Package, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { UserProduct } from "@/app/actions/get-user-products";

export interface ProductSwitcherProps {
  currentProductId: string | null;
  currentProductName: string;
  extractedProductName: string | null;
  products: UserProduct[];
  isOpen: boolean;
  onToggle: () => void;
  onSelectProduct: (productId: string) => void;
}

export function ProductSwitcher({
  currentProductId,
  currentProductName,
  extractedProductName,
  products,
  isOpen,
  onToggle,
  onSelectProduct,
}: ProductSwitcherProps) {
  return (
    <div className="relative flex-1 min-w-0">
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors w-full sm:w-auto"
      >
        <Package className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600 flex-shrink-0" />
        <span className="text-xs sm:text-sm font-semibold text-gray-900 truncate">
          {extractedProductName || currentProductName || "Select Product"}
        </span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-600 transition-transform flex-shrink-0",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={onToggle}
          />

          {/* Dropdown Content */}
          <div className="absolute left-0 top-full mt-2 w-[280px] sm:w-[320px] bg-white rounded-lg shadow-lg border border-gray-200 z-50 overflow-hidden">
            {/* Header */}
            <div className="text-[10px] font-medium text-gray-500 px-3 py-2 border-b border-gray-100 bg-gray-50/50">
              Recent Products ({products.length})
            </div>
            {/* Scrollable List */}
            <div className="max-h-80 overflow-y-auto p-1.5">
              {products.length === 0 ? (
                <div className="px-2 py-3 text-xs text-gray-500 text-center">
                  No products found
                </div>
              ) : (
                products.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => onSelectProduct(product.id)}
                    className={cn(
                      "w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-colors",
                      product.id === currentProductId
                        ? "bg-[#1C1917]/5 text-[#1C1917]"
                        : "hover:bg-gray-50 text-gray-900"
                    )}
                  >
                    {product.image_data?.front?.url ? (
                      <img
                        src={product.image_data.front.url}
                        alt={product.product_name}
                        className="w-8 h-8 rounded object-cover border border-gray-200 flex-shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center flex-shrink-0">
                        <Package className="h-4 w-4 text-gray-400" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">
                        {product.product_name || "Untitled Product"}
                      </div>
                      <div className="text-[10px] text-gray-500">
                        {new Date(product.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    {product.id === currentProductId && (
                      <div className="w-1.5 h-1.5 rounded-full bg-[#1C1917] flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
