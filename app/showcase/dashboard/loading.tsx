import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

export default function DashboardShowcaseLoading() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      <div className="mb-8">
        <Skeleton className="h-10 w-32 mb-6" />
        <Skeleton className="h-12 w-3/4 mb-4" />
        <Skeleton className="h-6 w-1/2" />
      </div>

      <div className="mb-12">
        <Skeleton className="h-8 w-64 mb-6" />
        <Skeleton className="h-[500px] w-full rounded-lg" />
      </div>

      <div className="space-y-8">
        <Skeleton className="h-8 w-40 mb-6" />

        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border">
            <CardHeader>
              <Skeleton className="h-7 w-48 mb-2" />
              <Skeleton className="h-5 w-full" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2 mb-6">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-5 w-full" />
                ))}
              </div>
              <Skeleton className="h-10 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-12 text-center">
        <Skeleton className="h-5 w-64 mx-auto mb-4" />
        <Skeleton className="h-12 w-48 mx-auto" />
      </div>
    </div>
  )
}
