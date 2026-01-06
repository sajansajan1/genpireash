import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import Link from "next/link";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    status: string;
    lastUpdated: string;
    image: string;
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Production":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "Spec Ready":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "Quoted":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "Ideating":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200";
    }
  };

  return (
    <Link href={`/dashboard/products/${product.id}`}>
      <Card className="overflow-hidden transition-all hover:shadow-md">
        <div className="aspect-video w-full overflow-hidden">
          <img
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            className="h-full w-full object-cover transition-transform hover:scale-105"
          />
        </div>
        <CardContent className="p-4">
          <div className="flex justify-between items-start">
            <h3 className="font-semibold text-lg line-clamp-1">{product.name}</h3>
            <Badge className={`ml-2 ${getStatusColor(product.status)}`}>{product.status}</Badge>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 text-sm text-[#1C1917]">
          <div className="flex items-center">
            <Clock className="mr-1 h-3.5 w-3.5" />
            <span>Updated {product.lastUpdated}</span>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
