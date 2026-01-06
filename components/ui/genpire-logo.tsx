import Link from "next/link";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface GenpireLogoProps {
  className?: string;
  iconOnly?: boolean;
  href?: string;
  showText?: boolean;
}

export function GenpireLogo({ className, iconOnly = false, href = "/" }: GenpireLogoProps) {
  const LogoContent = () => (
    <>
      {!iconOnly && (
        <div className="relative w-[120px] h-[40px]">
          <Image src="/headerlogo.png" alt="Genpire" fill className="object-contain" />
        </div>
      )}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={cn("flex items-center", className)}>
        <LogoContent />
      </Link>
    );
  }

  return (
    <div className={cn("flex items-center", className)}>
      <LogoContent />
    </div>
  );
}
