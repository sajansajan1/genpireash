import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import type { UserDetails } from "@/lib/types/tech-packs";
import { useUserStore } from "@/lib/zustand/useStore";
import { User } from "lucide-react";

interface UserAvatarProps {
  user: UserDetails | null;
  name?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function UserAvatar({ user, name, className, size = "md" }: UserAvatarProps) {
  const { supplierProfile, creatorProfile } = useUserStore();

  const displayName = name || user?.email || "das";

  const sizeClasses = {
    sm: "h-8 w-8 text-xs",
    md: "h-10 w-10 text-sm",
    lg: "h-16 w-16 text-xl",
  };
  const avatarSrc = supplierProfile?.company_logo || creatorProfile?.avatar_url || null;
  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      {avatarSrc && <AvatarImage src={avatarSrc || "/placeholder.svg"} alt={displayName} />}
      <AvatarFallback className="bg-muted flex items-center justify-center">
        <User className={`${size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-8 w-8"} text-[#1C1917]`} />
      </AvatarFallback>
    </Avatar>
  );
}
