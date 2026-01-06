import { getProductById } from "@/lib/supabase/made-with-genpire";
import { ProductDetailView } from "@/components/discover/product-detail-view";
import { notFound } from "next/navigation";
import { Metadata } from "next";

interface PageProps {
  params: {
    id: string;
  };
}

// ⭐ Dynamic OpenGraph + Twitter card based on product data
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductById(id);

  if (!product) {
    return {
      title: "Product Not Found | Genpire",
      description: "This product is no longer available.",
    };
  }

  return {
    title: product.productName || "Genpire Product",
    description: product.shortDescription || "AI-generated tech pack on Genpire.",

    openGraph: {
      title: product.product_name,
      description: product.product_description,
      type: "website",
      url: `https://www.genpire.com/discover/${id}`,
      images: [
        {
          url: product.image_data.front.url || "https://www.genpire.com/og-image.png",
          width: 1200,
          height: 630,
          alt: product.product_name,
        },
      ],
    },

    twitter: {
      card: "summary_large_image",
      title: product.product_name,
      description: product.product_description,
      images: [product.image_data.front.url || "https://www.genpire.com/og-image.png"],
    },
  };
}

export default async function ProductPage({ params }: PageProps) {
  const { id } = await params;
  const product = await getProductById(id);
  console.log("🔍 ~ ProductPage ~ app/discover/[id]/page.tsx:52 ~ product:", product);

  if (!product) notFound();

  return <ProductDetailView product={product} />;
}
