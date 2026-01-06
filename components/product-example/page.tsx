"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Diamond, Eye, ToyBrick, Sofa, ShoppingBag, Shirt, Sparkle, Store, Tag } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { products } from "./product";
import { useRouter } from "next/navigation";
import { fetchSamples } from "@/lib/supabase/demoProducts";
const categories = [
  { name: "Apparel", icon: Shirt, key: "apparel" },
  { name: "Jewelry", icon: Diamond, key: "jewelry" },
  { name: "Toys/Plush", icon: ToyBrick, key: "toys" },
  { name: "Furniture", icon: Sofa, key: "furniture" },
  { name: "Beauty & Cosmetics", icon: Sparkle, key: "beauty" },
  { name: "Home Goods", icon: Store, key: "goods" },
  { name: "Accessories", icon: Tag, key: "accessories" },
  { name: "Footwear", icon: ShoppingBag, key: "footwear" },
];

export default function ProductCard() {
  const [selectedCat, setSelectedCat] = useState(categories[0].key);
  const router = useRouter();
  const [products, setProducts] = useState<
    Array<{
      category: string;
      product_name: string;
      product_description: string;
      image_data: { front?: { url: string }; back?: { url: string }; side?: { url: string } };
      id: string;
    }>
  >([]);

  useEffect(() => {
    async function fetchData() {
      const res = await fetchSamples();
      setProducts(res || []); // safe
    }
    fetchData();
  }, []);

  const filteredProducts = products?.filter((p) => p?.category === selectedCat);
  console.log("products ==> ", products);
  return (
    <TooltipProvider>
      <>
        <div className="mb-6 flex flex-wrap sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4 text-sm font-medium text-[#1C1917] overflow-x-auto">
          {categories?.map((category, idx) => {
            const IconComponent = category?.icon;
            const active = selectedCat === category?.key;
            return (
              <Button
                key={idx}
                className={`flex items-center gap-1 rounded-md px-2 py-1 cursor-pointer transition border flex-shrink-0 ${
                  active ? "border-[#1C1917]" : "border-gray-300"
                }`}
                variant={active ? "default" : "ghost"}
                onClick={() => setSelectedCat(category?.key)}
              >
                <span className="text-lg">
                  <IconComponent className="h-5 w-5" />
                </span>
                <span>{category?.name}</span>
              </Button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 gap-6">
          {filteredProducts?.map((product, idx) => (
            <Card key={idx} className="p-6 border rounded-xl shadow-sm bg-white flex flex-col space-y-4">
              {/* Image Row */}
              <div className="flex justify-center gap-4">
                {/* FRONT */}
                <div className="w-28 h-28 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={product?.image_data?.front?.url}
                    alt={`${product?.product_name} front`}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                  />
                </div>

                {/* BACK */}
                <div className="w-28 h-28 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={product?.image_data?.back?.url}
                    alt={`${product?.product_name} back`}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                  />
                </div>

                {/* SIDE */}
                <div className="w-28 h-28 rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={product?.image_data?.side?.url}
                    alt={`${product?.product_name} side`}
                    className="w-full h-full object-cover"
                    onError={(e) => (e.currentTarget.src = "/placeholder.png")}
                  />
                </div>
              </div>

              {/* Title */}
              <h3 className="text-lg font-semibold text-gray-900 text-center">{product?.product_name}</h3>

              {/* Description */}
              <p className="text-sm text-gray-600 text-center line-clamp-2">{product?.product_description}</p>

              {/* Button */}
              <div className="pt-2 flex justify-center">
                <Button
                  variant="outline"
                  className="w-full sm:w-40 flex items-center justify-center gap-2"
                  onClick={() => router.push(
                    `/ai-designer?projectId=${product.id}&version=modular`
                  )}
                >
                  <Eye className="h-4 w-4" />
                  View
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </>
    </TooltipProvider>
  );
}
