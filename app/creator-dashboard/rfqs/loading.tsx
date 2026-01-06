import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardFooter, CardHeader } from "@/components/ui/card"

export default function RfqLoading() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Skeleton className="h-10 w-[200px]" />
        <Skeleton className="h-10 w-[200px]" />
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Skeleton className="h-10 w-full" />
      </div>

      <div className="mt-6">
        <Skeleton className="h-10 w-[400px] mb-6" />

        <div className="grid grid-cols-1 gap-6">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Card key={i} className="overflow-hidden">
                <CardHeader>
                  <div className="flex items-center justify-between gap-4">
                  <div className="gap-2 flex items-center space-y-2">
                    <Skeleton className="h-16 w-16 rounded-md" />
                    <div className=" space-y-2">
                    <Skeleton className="h-6 w-[150px]" />
                    <Skeleton className="h-4 w-[100px]" />
                    </div>
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-[150px]" />
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-[150px]" />
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                    <div className="space-y-2">
                      <Skeleton className="h-6 w-[150px]" />
                      <Skeleton className="h-4 w-[100px]" />
                    </div>
                  </div>
                  
                </CardHeader>
                <CardFooter className="flex justify-between gap-2">
                <Skeleton className="h-6 w-[150px]" />
                </CardFooter>
              </Card>
            ))}
        </div>
      </div>
    </div>
  )
}
