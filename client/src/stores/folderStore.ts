import { create } from "zustand";
import { getFolderContentsAPI } from "@/libs/apis/folder";

export interface Folder {
  id: number;
  name: string;
  parent_folder_id: number | null;
  created_at: string;
}

interface FolderState {
  folders: Folder[];
  setFolders: (folders: Folder[]) => void;
  addFolder: (folder: Folder) => void;
  fetchFolders: () => Promise<void>;
}

export const useFolderStore = create<FolderState>((set) => ({
  folders: [],
  setFolders: (folders) => set({ folders }),
  addFolder: (folder) => set((state) => ({ folders: [...state.folders, folder] })),
  fetchFolders: async () => {
    try {
      // getFolderContentsAPI() with no arguments fetches root items (docs and folders).
      const items = await getFolderContentsAPI();

      // Filter the mixed array to only keep items that are folders.
      // A type guard is used to ensure TypeScript understands the result.
      const rootFolders = items.filter(
        (item): item is Folder & { type: "folder" } => item.type === "folder"
      );

      set({ folders: rootFolders });
    } catch (error) {
      console.error("Error fetching folders:", error);
    }
  },
}));