import { Skeleton } from "@/components/ui/skeleton";
export default function CreatorHeaderLoading() {
  return (
    <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200">
      {/* Logo */}
      <Skeleton className="h-10 w-10 rounded-lg" />

      {/* Right side: credits, notifications, profile */}
      <div className="flex items-center space-x-4">
        {/* Credits */}
        <Skeleton className="h-6 w-20 rounded-full" />

        {/* Notification bell with badge */}
        <div className="relative">
          <Skeleton className="h-8 w-8 rounded-full" />
          <Skeleton className="absolute top-0 right-0 h-4 w-4 rounded-full" />
        </div>

        {/* Profile: avatar + name/email */}
        <div className="flex items-center space-x-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex flex-col space-y-1">
            <Skeleton className="h-4 w-24 rounded-md" />
            <Skeleton className="h-3 w-32 rounded-md" />
          </div>
        </div>
      </div>
    </div>
  );
}
