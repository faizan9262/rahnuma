import axios from "axios";
import { number } from "framer-motion";

export const getAllDocuments = async () => {
  try {
    const response = await axios.get("/documents/list");
    if (response.status !== 200) {
      console.log("Somethin went wrong while fetching documents");
    }
    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const uploadFileToDB = async (
  file: File,
  parent_folder_id: number | null
) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    if (parent_folder_id !== null) {
      formData.append("parent_folder_id", String(parent_folder_id));
    }

    const response = await axios.post("/documents/upload", formData);
    return response.data;
  } catch (error: any) {
    if (error.response) {
      const { status, data } = error.response;
      if (status === 400 && data?.detail) {
        return { error: data.detail }; // pass clean error up
      }
      return { error: "Something went wrong while uploading the document." };
    }
    return { error: "Network error. Please check your connection." };
  }
};

export const deleteDocumentFromDB = async (docId: number) => {
  try {
    const response = await axios.delete(`/documents/delete/${docId}`);

    if (response.status !== 200) {
      console.log(
        "Something went wrong while deleting document, please try again."
      );
    }

    return response.data;
  } catch (error) {
    console.log(error);
  }
};

export const moveDocumentToFolder = async (
  doc_id: number,
  target_folder_id: number | null
) => {
  try {
    const response = await axios.post("/folder/move-doc", {
      doc_id,
      target_folder_id,
    });
    return response.data;
  } catch (error) {
    console.log("Error while moving doc: ", error);
  }
};

export const copyDocumentToFolder = async (
  doc_id: number,
  target_folder_id: number | null
) => {
  try {
    const response = await axios.post("/folder/copy-doc", {
      doc_id,
      target_folder_id,
    });
    return response.data;
  } catch (error) {
    console.log("Error while copying doc: ", error);
  }
};
