// components/skeletons/DocumentsGridSkeleton.tsx

import { FileOrFolderSkeleton } from "./skeletons/FolderSkeleton";

export const DocumentsGridSkeleton = () => {
  // Render a number of placeholders to fill the screen
  const placeholders = Array.from({ length: 16 });

  return (
    <>
      {placeholders.map((_, i) => (
        <FileOrFolderSkeleton key={i} />
      ))}
    </>
  );
};