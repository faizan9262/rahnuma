// components/skeletons/FileOrFolderSkeleton.tsx

import { Skeleton } from "@/components/ui/skeleton";

export const FileOrFolderSkeleton = () => {
  const isFolder = Math.random() > 0.4;

  return (
    <div
      className={`relative border border-border flex flex-col items-center justify-center p-6 shadow-lg transition-all 
      ${isFolder ? "rounded-2xl bg-primary/10" : "rounded-xl bg-card"}`}
    >
      {/* Icon / Thumbnail Placeholder */}
      <Skeleton className="h-12 w-12 rounded-lg" />

      {/* Title Placeholder */}
      <Skeleton className="mt-3 h-4 w-24 rounded-md" />

      {/* File Type Placeholder (only for documents) */}
      {!isFolder && <Skeleton className="mt-1 h-3 w-16 rounded-md" />}

      {/* Kebab Menu Placeholder */}
      <div className="absolute top-2 right-2">
        <Skeleton className="h-5 w-5 rounded-full" />
      </div>
    </div>
  );
};