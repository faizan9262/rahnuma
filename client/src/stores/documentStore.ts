import { create } from "zustand";
import { getAllDocuments } from "@/libs/apis/documents";
import type { Message } from "@/types";

export interface UserDocument {
  id: number;
  title: string;
  file_type: string;
  file_url: string;
  status: string;
  folder_id: number | null;
  key_topics_json: string[];
  quiz: any[];
}

export interface DocumentState {
  documents: UserDocument[];
  selectedDoc: UserDocument | null;
  chats: { [docId: number]: Message[] };
  clipboard: { doc: UserDocument | null; action: "cut" | "copy" | null }; // <-- new
  setDocuments: (docs: UserDocument[]) => void;
  addDocument: (doc: UserDocument) => void;
  fetchDocuments: () => Promise<void>;
  setDoc: (doc: UserDocument | null) => void;
  updateDocumentFolder: (docId: number, folderId: number | null) => void;
  removeDocument: (docId: number) => void;
  addMessage: (docId: number, message: Message) => void;
  resetChat: (docId: number) => void;
  setClipboard: (doc: UserDocument, action: "cut" | "copy") => void;
  clearClipboard: () => void;
}


export const useDocumentStore = create<DocumentState>((set) => ({
  documents: [],
  selectedDoc: null,
  chats: {},
  clipboard: { doc: null, action: null }, // <-- initialize

  setDocuments: (docs) => set({ documents: docs }),
  addDocument: (doc) => set((state) => ({ documents: [...state.documents, doc] })),
  fetchDocuments: async () => {
    try {
      const res = await getAllDocuments();
      set({ documents: res });
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  },
  setDoc: (doc) => set({ selectedDoc: doc }),
  updateDocumentFolder: (docId, folderId) =>
    set((state) => ({
      documents: state.documents.map((doc) =>
        doc.id === docId ? { ...doc, folder_id: folderId } : doc
      ),
    })),
  removeDocument: (docId) =>
    set((state) => ({
      documents: state.documents.filter((doc) => doc.id !== docId),
    })),

  addMessage: (docId, message) =>
    set((state) => ({
      chats: {
        ...state.chats,
        [docId]: [...(state.chats[docId] || []), message],
      },
    })),

  resetChat: (docId) =>
    set((state) => ({
      chats: { ...state.chats, [docId]: [] },
    })),

  setClipboard: (doc, action) =>
    set({ clipboard: { doc, action } }),

  clearClipboard: () =>
    set({ clipboard: { doc: null, action: null } }),
}));

