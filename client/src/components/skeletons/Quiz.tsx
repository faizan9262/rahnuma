import { Skeleton } from "@/components/ui/skeleton";

export default function Quiz() {
  return (
    <div className="flex h-full w-full flex-col p-4 sm:p-6 md:p-8 lg:p-10">
      {/* Header Skeleton */}
      <div className="mb-6 flex flex-col items-center">
        <Skeleton className="h-5 w-48 mb-2" /> {/* Difficulty Selector */}
        <Skeleton className="h-3 w-full rounded-lg" /> {/* Progress bar */}
      </div>

      {/* Main Content Area Skeleton */}
      <div className="flex flex-1 flex-col justify-center gap-6">
        {/* Question Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-7 w-full max-w-lg mx-auto" />
          <Skeleton className="h-6 w-full max-w-md mx-auto" />
        </div>

        {/* Options Skeleton: 2x2 Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
          <Skeleton className="h-12 w-full rounded-md" />
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <Skeleton className="h-10 w-10 rounded-md" /> {/* Previous button */}
        <Skeleton className="h-10 w-32 rounded-md" /> {/* Check button */}
        <Skeleton className="h-10 w-10 rounded-md" /> {/* Next/Done button */}
      </div>
    </div>
  );
}
