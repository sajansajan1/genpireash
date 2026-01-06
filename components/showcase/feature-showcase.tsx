import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface FeatureShowcaseProps {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
  link: string;
  linkText: string;
  features: string[];
  reversed?: boolean;
}

export function FeatureShowcase({
  title,
  description,
  imageSrc,
  imageAlt,
  link,
  linkText,
  features,
  reversed = false,
}: FeatureShowcaseProps) {
  return (
    <div className={`flex flex-col ${reversed ? "md:flex-row-reverse" : "md:flex-row"} gap-8 items-center`}>
      <div className="flex-1">
        <div className="rounded-lg overflow-hidden border shadow-lg">
          <img src={imageSrc || "/placeholder.svg"} alt={imageAlt} className="w-full h-auto" />
        </div>
      </div>
      <div className="flex-1 space-y-4">
        <h3 className="text-2xl font-bold">{title}</h3>
        <p className="text-[#1C1917]">{description}</p>

        <ul className="space-y-2">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start">
              <span className="mr-2 text-zinc-900">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <Button asChild>
          <Link href={link}>
            {linkText} <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
