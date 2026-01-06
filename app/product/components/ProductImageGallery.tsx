"use client";

/**
 * ProductImageGallery - Wrapper around ImageGalleryCanvas for authenticated product page
 * Uses Zustand store for state and opens ImageViewerModal on click
 */

import {
  useProductImages,
  useIsGeneratingImages,
} from "@/lib/zustand/product/productPageStore";
import { useImageViewerStore } from "@/modules/ai-designer/store/imageViewerStore";
import { ImageGalleryCanvas } from "@/app/product/shared";

export function ProductImageGallery() {
  const productImages = useProductImages();
  const isGeneratingImages = useIsGeneratingImages();
  const { openViewer } = useImageViewerStore();

  const handleImageClick = (url: string, title?: string, description?: string) => {
    openViewer({ url, title, description });
  };

  return (
    <ImageGalleryCanvas
      productImages={productImages}
      isGenerating={isGeneratingImages}
      onImageClick={handleImageClick}
    />
  );
}
