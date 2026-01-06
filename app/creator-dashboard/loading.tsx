import CreatorHeaderLoading from "./headerLoading";
import CreatorSidebarLoading from "./sidebarLoading";

export default function CreatorDashboardLoading() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header Skeleton */}
      <div className="sticky top-0 z-50 w-full bg-background border-b">
        <CreatorHeaderLoading />
      </div>

      {/* Sidebar Skeleton */}
      <div
        className="fixed left-0 bottom-0 z-40 w-64 hidden lg:block overflow-y-auto scrollbar-hide border-r"
        style={{ top: "var(--header-height, 64px)" }}
      >
        <CreatorSidebarLoading />
      </div>

      {/* Main Content Skeleton */}
      <div className="lg:ml-64">
        <main className="container mx-auto px-4 py-6 pt-8">
          <div className="flex-1 p-2 pt-1 sm:pt-2 md:pt-2 bg-[#EEEAE6]">
            <div className="max-w-2xl mx-auto space-y-6 py-8">
              {/* Main Card Skeleton */}
              <div className="bg-white rounded-2xl border border-[#D2C8BC] p-6 md:p-8 space-y-6 shadow-sm">
                {/* Title Section */}
                <div className="space-y-3">
                  <div className="h-8 w-64 bg-[#EEEAE6] rounded-lg animate-pulse" />
                  <div className="h-4 w-full max-w-md bg-[#EEEAE6] rounded animate-pulse" />
                </div>

                {/* Tab Buttons */}
                <div className="flex gap-3">
                  <div className="h-12 flex-1 bg-[#EEEAE6] rounded-xl animate-pulse" />
                  <div className="h-12 flex-1 bg-[#EEEAE6] rounded-xl animate-pulse" />
                </div>

                {/* Prompt Guide Accordion */}
                <div className="h-14 w-full bg-[#EEEAE6] rounded-xl animate-pulse border border-[#D2C8BC]" />

                {/* Brand DNA Toggle */}
                <div className="flex items-center justify-between p-4 bg-[#EEEAE6]/50 rounded-xl border border-[#D2C8BC]">
                  <div className="h-5 w-32 bg-[#D2C8BC] rounded animate-pulse" />
                  <div className="h-6 w-12 bg-[#D2C8BC] rounded-full animate-pulse" />
                </div>

                {/* Product Description Section */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-[#D2C8BC] animate-pulse" />
                    <div className="h-2 w-2 rounded-full bg-[#D2C8BC] animate-pulse" />
                    <div className="h-2 w-2 rounded-full bg-[#D2C8BC] animate-pulse" />
                    <div className="h-5 w-48 bg-[#EEEAE6] rounded animate-pulse" />
                  </div>

                  {/* Text Area */}
                  <div className="h-32 w-full bg-[#EEEAE6] rounded-xl animate-pulse border border-[#D2C8BC]" />

                  {/* Add Button */}
                  <div className="h-12 w-12 bg-[#EEEAE6] rounded-lg animate-pulse" />
                </div>

                {/* Improve with AI Button */}
                <div className="flex justify-center">
                  <div className="h-10 w-40 bg-[#EEEAE6] rounded-lg animate-pulse border border-[#D2C8BC]" />
                </div>
              </div>

              {/* Create Button */}
              <div className="h-14 w-full bg-[#D2C8BC] rounded-2xl animate-pulse shadow-sm" />

              {/* Inspiration Section */}
              <div className="bg-white rounded-2xl border border-[#D2C8BC] p-6 space-y-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 bg-[#EEEAE6] rounded animate-pulse" />
                  <div className="h-6 w-48 bg-[#EEEAE6] rounded animate-pulse" />
                </div>

                {/* Inspiration Cards */}
                <div className="space-y-3">
                  {Array(3)
                    .fill(null)
                    .map((_, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-4 bg-[#EEEAE6]/50 rounded-xl border border-[#D2C8BC]"
                      >
                        <div className="h-10 w-10 bg-[#EEEAE6] rounded-lg animate-pulse flex-shrink-0" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-full bg-[#EEEAE6] rounded animate-pulse" />
                          <div className="h-4 w-3/4 bg-[#EEEAE6] rounded animate-pulse" />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
