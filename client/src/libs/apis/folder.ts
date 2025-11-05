import type { Folder } from "@/stores/folderStore";
import axios from "axios";
import { type UserDocument } from "@/stores/documentStore";

// The FolderContentItem should correctly reflect the 'type' property
export type FolderContentItem = (UserDocument & { type: 'document' }) | (Folder & { type: 'folder' });

export const getFolderContentsAPI = async (
  folderId: number | null = null
): Promise<FolderContentItem[]> => {
  try {
    let url = "/folder/get";
    if (folderId !== null) {
      url += `?folder_id=${folderId}`;
    }

    // The backend returns a mix of raw Document and Folder objects
    const response = await axios.get<(UserDocument | Folder)[]>(url);

    if (response.status !== 200) {
      throw new Error(`Failed to get folder contents: ${response.statusText}`);
    }

    // --- THIS IS THE FIX ---
    // Use a more robust check to differentiate between Documents and Folders.
    // We check for the 'title' property, which is unique to a Document.
    const contents: FolderContentItem[] = response.data.map((item) => {
      if ("title" in item && "file_url" in item) {
        return { ...item, type: "document" };
      } else {
        return { ...item, type: "folder" };
      }
    });

    return contents;

  } catch (error) {
    console.error("Error while fetching folder contents: ", error);
    throw error;
  }
};

export const createNewFolder = async (
  name: string,
  parent_folder_id: number | null
) => {
  try {
    const folder_in = {
      name: name,
      parent_folder_id: parent_folder_id,
    };
    const response = await axios.post("/folder/create", folder_in);
    if (response.status !== 201) {
      throw new Error("Failed to create folder");
    }
    return response.data;
  } catch (error) {
    console.log("Error While creating folder: ", error);
  }
};

export const getFolderDocs = async (folder_id: number) => {
  try {
    const response = await axios.post("/folder/folder-docs", { folder_id });
    if (response.status !== 200) {
      throw new Error("Failed to get folder docs");
    }
    return response.data;
  } catch (error) {
    console.log("Error While fetching folder docs: ", error);
  }
};
