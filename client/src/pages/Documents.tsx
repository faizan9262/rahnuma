import React, { useEffect, useRef, useState, useMemo } from "react";
import { DndContext, type DragEndEvent } from "@dnd-kit/core";
import { useNavigate, useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Search, Upload } from "lucide-react";
import { MdOutlineCreateNewFolder } from "react-icons/md";
import { VscFolderLibrary } from "react-icons/vsc";

// Your stores and types
import { useDocumentStore, type UserDocument } from "@/stores/documentStore";
import { useFolderStore, type Folder } from "@/stores/folderStore";
import { createNewFolder, getFolderContentsAPI } from "@/libs/apis/folder";
import {
  copyDocumentToFolder,
  deleteDocumentFromDB,
  moveDocumentToFolder,
  uploadFileToDB,
} from "@/libs/apis/documents";
import { DroppableFolder } from "@/components/DroppableFolder";
import { DraggableItem } from "@/components/DragableDoc";
import { DocumentsGridSkeleton } from "@/components/GridSkeleton";
import { number } from "framer-motion";

type FolderContentItem =
  | (UserDocument & { type: "document" })
  | (Folder & { type: "folder" });

const Documents: React.FC = () => {
  const { addDocument, removeDocument, updateDocumentFolder, clipboard,clearClipboard } =
    useDocumentStore();
  const {
    folders,
    addFolder,
    fetchFolders: fetchAllFolders,
  } = useFolderStore();

  const [currentItems, setCurrentItems] = useState<FolderContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [newFolderName, setNewFolderName] = useState("");
  const fileRef = useRef<HTMLInputElement | null>(null);

  const navigate = useNavigate();
  const { folderId } = useParams<{ folderId?: string }>();
  const currentFolderId = folderId ? parseInt(folderId) : null;

  useEffect(() => {
    fetchAllFolders();
  }, [fetchAllFolders]);

  useEffect(() => {
    const fetchContent = async () => {
      setIsLoading(true);
      try {
        const rawItems = await getFolderContentsAPI(currentFolderId);
        const itemsWithType: FolderContentItem[] = rawItems.map((item) => {
          if ("file_type" in item) {
            return { ...item, type: "document" };
          } else {
            return { ...item, type: "folder" };
          }
        });

        setCurrentItems(itemsWithType);
      } catch (error) {
        console.error("Error fetching content:", error);
        toast.error("Failed to load folder content.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchContent();
  }, [currentFolderId]);

  const breadcrumbs = useMemo(() => {
    const crumbs: { id: number | null; name: string }[] = [];
    let currentId: number | null | undefined = currentFolderId;

    while (currentId) {
      const folder = folders.find((f) => f.id === currentId);
      if (folder) {
        crumbs.unshift({ id: folder.id, name: folder.name });
        currentId = folder.parent_folder_id;
      } else {
        break;
      }
    }
    crumbs.unshift({ id: null, name: "My Explore" });
    return crumbs;
  }, [currentFolderId, folders]);

  const openFileManager = () => fileRef.current?.click();

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    toast.loading("Uploading Document...", { id: "upload" });
    try {
      const uploadedDoc = await uploadFileToDB(file, currentFolderId);
      addDocument(uploadedDoc);
      setCurrentItems((prev) => [
        ...prev,
        { ...uploadedDoc, type: "document" },
      ]);
      toast.success("Document Uploaded!", { id: "upload" });
    } catch (error: any) {
      toast.error(error.message || "Failed to upload document", {
        id: "upload",
      });
    }
  };

  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) return;
    toast.loading("Creating folder...", { id: "folder-create" });
    try {
      const newFolder = await createNewFolder(newFolderName, currentFolderId);
      addFolder(newFolder);
      setCurrentItems((prev) => [...prev, { ...newFolder, type: "folder" }]);
      toast.success("Folder created!", { id: "folder-create" });
      setNewFolderName("");
    } catch (error) {
      toast.error("Failed to create folder", { id: "folder-create" });
    }
  };

  const handleDeleteDoc = async (docId: number) => {
    toast.loading("Deleting document...", { id: `doc-delete-${docId}` });
    try {
      console.log("Delete:");

      await deleteDocumentFromDB(docId);
      removeDocument(docId);
      setCurrentItems((prev) =>
        prev.filter((item) => item.id !== docId || item.type !== "document")
      );
      toast.success("Document Deleted", { id: `doc-delete-${docId}` });
    } catch (error) {
      toast.error("Failed to delete document", { id: `doc-delete-${docId}` });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { over, active } = event;
    if (
      !over ||
      active.data.current?.type !== "document" ||
      over.data.current?.type !== "folder"
    )
      return;

    const draggedDoc = active.data.current.doc as UserDocument;
    const targetFolder = over.data.current.folder as Folder;
    if (draggedDoc.folder_id === targetFolder.id) return;

    setCurrentItems((prev) =>
      prev.filter(
        (item) => item.id !== draggedDoc.id || item.type !== "document"
      )
    );
    toast.loading(`Moving '${draggedDoc.title}'...`, { id: "move-doc" });

    try {
      await moveDocumentToFolder(draggedDoc.id, targetFolder.id);
      updateDocumentFolder(draggedDoc.id, targetFolder.id);
      toast.success("Document moved!", { id: "move-doc" });
    } catch (error) {
      setCurrentItems((prev) => [...prev, { ...draggedDoc, type: "document" }]);
      toast.error("Failed to move document.", { id: "move-doc" });
    }
  };

  const displayedItems = useMemo(() => {
    return currentItems
      .filter((item) =>
        (item.type === "folder" ? item.name : item.title)
          .toLowerCase()
          .includes(search.toLowerCase())
      )
      .sort((a, b) => {
        if (a.type === "folder" && b.type === "document") return -1;
        if (a.type === "document" && b.type === "folder") return 1;
        const nameA = a.type === "folder" ? a.name : a.title;
        const nameB = b.type === "folder" ? b.name : b.title;
        return nameA.localeCompare(nameB);
      });
  }, [currentItems, search]);

  console.log("Cut file: ", clipboard);

  const handleCutPaste = async () => {
    const doc = clipboard.doc;
    if (!doc) return;
    if (displayedItems.some((f) => f.id === doc.id)) return;

    try {
      const res = await moveDocumentToFolder(doc.id, currentFolderId);
      updateDocumentFolder(doc.id, currentFolderId);

      setCurrentItems((prev) => [
        ...prev,
        { ...doc, folder_id: currentFolderId, type: "document" },
      ]);
      clearClipboard();

      toast.success("Document moved successfully!");
    } catch (error) {
      toast.error("Failed to move document");
    }
  };
  const handleCopyPaste = async () => {
    // const doc = clipboard.doc;
    // if (!doc) return;
    // if (displayedItems.some((f) => f.id === doc.id)) return;

    // try {
    //   const res = await copyDocumentToFolder(doc.id, currentFolderId);
    //   updateDocumentFolder(doc.id, currentFolderId);

    //   setCurrentItems((prev) => [
    //     ...prev,
    //     { ...doc, folder_id: currentFolderId, type: "document" },
    //   ]);
    //   clearClipboard();

    //   toast.success("Document moved successfully!");
    // } catch (error) {
    //   toast.error("Failed to move document");
    // }
  };


  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="min-h-screen bg-secondary text-foreground p-6 sm:p-8 relative">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card/80 backdrop-blur-xl border border-border rounded-2xl shadow-md px-5 py-4">
            <h1
              onClick={() => navigate("/files")}
              className="text-2xl flex gap-2 items-center justify-center font-extrabold text-primary tracking-tight cursor-pointer"
            >
              <VscFolderLibrary /> My Explore
            </h1>
            <div className="flex flex-wrap gap-3 items-center justify-between w-full sm:w-auto">
              <div className="relative flex-1 sm:w-72">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground" />
                <Input
                  placeholder="Search current folder..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 bg-card text-foreground border-border rounded-xl"
                />
              </div>
              <Button
                onClick={openFileManager}
                className="bg-primary hidden hover:bg-primary-hover text-background rounded-xl shadow-md px-4 md:flex items-center gap-2"
              >
                <Upload className="h-4 w-4" /> Upload
              </Button>
              <input
                type="file"
                ref={fileRef}
                onChange={handleFileSelect}
                className="hidden"
              />
              <Dialog>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary-hover text-background rounded-xl shadow-md">
                    <MdOutlineCreateNewFolder className="!w-6 !h-6" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-secondary border-primary/20 border-2">
                  <DialogHeader>
                    <DialogTitle className="text-primary font-bold text-xl mb-2">
                      Create New Folder
                    </DialogTitle>
                    <Input
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      className="bg-secondary/80 border-2 border-primary"
                      placeholder="Folder Name Here"
                    />
                    <DialogClose asChild>
                      <Button
                        onClick={handleCreateFolder}
                        className="mt-4 bg-primary hover:bg-primary-hover text-background rounded-lg"
                      >
                        Create
                      </Button>
                    </DialogClose>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Breadcrumbs */}
          <div className="flex items-center justify-between">
            <nav className="flex items-center space-x-2 text-sm font-medium text-foreground/70">
              {breadcrumbs.map((crumb, index) => (
                <React.Fragment key={crumb.id ?? "root"}>
                  {index < breadcrumbs.length - 1 ? (
                    <Link
                      to={crumb.id === null ? "/files" : `/files/${crumb.id}`}
                      className="hover:text-primary transition-colors"
                    >
                      {crumb.name}
                    </Link>
                  ) : (
                    <span className="text-primary font-semibold">
                      {crumb.name}
                    </span>
                  )}
                  {index < breadcrumbs.length - 1 && (
                    <span className="text-foreground/50">/</span>
                  )}
                </React.Fragment>
              ))}
            </nav>
            {clipboard.doc && (
              <Button onClick={clipboard.action == 'copy' ? handleCopyPaste : handleCutPaste}>Paste Here</Button>
            )}
          </div>

          {/* Finder Grid */}
          <div className="grid w-full grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 xl:grid-cols-8 gap-4 mt-4">
            {isLoading ? (
              <DocumentsGridSkeleton />
            ) : (
              displayedItems.map((item) =>
                item.type === "folder" ? (
                  <DroppableFolder
                    key={`folder-${item.id}`}
                    folder={item as Folder}
                    openFolder={() => navigate(`/files/${item.id}`)}
                  />
                ) : (
                  <DraggableItem
                    key={`doc-${item.id}`}
                    doc={item as UserDocument}
                    handleDeleteDoc={handleDeleteDoc}
                  />
                )
              )
            )}

            {!isLoading && displayedItems.length === 0 && (
              <div className="col-span-full text-center text-muted-foreground py-10">
                <p>This folder is empty.</p>
              </div>
            )}
          </div>

          <div className="fixed bottom-6 right-6 md:hidden">
            <Button
              size="icon"
              variant="default"
              className="bg-primary text-background rounded-full w-12 h-12 shadow-lg"
              onClick={openFileManager}
            >
              +
            </Button>
            <input
              type="file"
              ref={fileRef}
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>
      </div>
    </DndContext>
  );
};

export default Documents;
