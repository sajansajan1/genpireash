import { Skeleton } from "@/components/ui/skeleton";

export default function CreatorSidebarLoading() {
  // For menu items, include badge for specific indices (2, 3, 4)
  const menuItems = [
    { badge: false },
    { badge: false },
    { badge: true },
    { badge: true },
    { badge: true },
    { badge: false },
    { badge: false },
    { badge: false },
    { badge: false },
  ];

  return (
    <div className="flex flex-col justify-between w-64 p-6 border-r border-gray-200 min-h-screen bg-gray-50">
      {/* Menu Items */}
      <nav className="space-y-6">
        {menuItems.map((item, i) => (
          <div key={i} className="flex items-center space-x-3">
            {/* Icon skeleton */}
            <Skeleton className="h-5 w-5 rounded" />

            {/* Text skeleton */}
            <Skeleton className="h-5 w-28 rounded-md" />

            {/* Badge skeleton aligned right */}
            {item.badge && (
              <div className="ml-auto">
                <Skeleton className="h-5 w-14 rounded-full" />
              </div>
            )}
          </div>
        ))}
      </nav>

      {/* Bottom Sections */}
      <div className="space-y-10">
        {/* CONNECT Section */}
        <div>
          <Skeleton className="h-5 w-20 rounded-md mb-4" />
          <div className="flex space-x-4">
            <Skeleton className="h-6 w-6 rounded-full" />
            <Skeleton className="h-6 w-6 rounded-full" />
          </div>
        </div>

        {/* LEGAL Section */}
        <div>
          <Skeleton className="h-5 w-16 rounded-md mb-4" />
          <div className="space-y-3">
            <Skeleton className="h-4 w-32 rounded-md" />
            <Skeleton className="h-4 w-28 rounded-md" />
          </div>
        </div>

        {/* Footer */}
        <Skeleton className="h-4 w-40 rounded-md" />
      </div>
    </div>
  );
}
