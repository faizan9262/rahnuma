import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useDocumentStore, type UserDocument } from "@/stores/documentStore";
import { toast } from "sonner";
import {
  getFolderContentsAPI,
  type FolderContentItem,
} from "@/libs/apis/folder";
import {
  ChevronRight,
  Folder as FolderIcon,
} from "lucide-react";
import { FaClock, FaCircleInfo } from "react-icons/fa6";
import { Skeleton } from "./ui/skeleton";
import { VscFolderLibrary } from "react-icons/vsc";
import { FiFile } from "react-icons/fi";
import { BsFiletypeDocx, BsFiletypeJpg, BsFiletypePdf, BsFiletypePng, BsFiletypePptx, BsFiletypeTxt } from "react-icons/bs";

const DocumentItem = ({ doc }: { doc: UserDocument }) => {
  const { setDoc, selectedDoc } = useDocumentStore();

  const getFileIcon = (type: string) => {
    const icon = "h-12 w-12";
    if (!type) return <FiFile className={`text-primary ${icon}`} />;
    const t = type.toUpperCase();
    if (t.includes("PDF"))
      return <BsFiletypePdf className={`text-red-500 ${icon}`} />;
    if (t.includes("PNG"))
      return <BsFiletypePng className={`text-pink-500 ${icon}`} />;
    if (t.includes("PPT"))
      return <BsFiletypePptx className={`text-yellow-500 ${icon}`} />;
    if (t.includes("JPG") || t.includes("JPEG"))
      return <BsFiletypeJpg className={`text-purple-500 ${icon}`} />;
    if (t.includes("DOCX"))
      return <BsFiletypeDocx className={`text-orange-500 ${icon}`} />;
    if (t.includes("TXT"))
      return <BsFiletypeTxt className={`text-green-500 ${icon}`} />;
    return <FiFile className={`text-primary ${icon}`} />;
  };

  const isReady = doc.status === "ready";

  return (
    <motion.div
      whileTap={isReady ? { scale: 0.98 } : {}}
      onClick={() => isReady && setDoc(doc)}
      className={`flex items-center h-8 pl-6 pr-1 gap-2 text-sm rounded-md transition-colors duration-200 select-none ${
        selectedDoc?.id === doc.id ? "bg-primary/20" : "hover:bg-primary/10"
      } ${!isReady ? "opacity-60 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <div className="flex-shrink-0 w-4 h-4 flex items-center justify-center">
        {doc.status === "processing" ? (
          <FaClock className="text-primary animate-spin text-xs" />
        ) : doc.status === "failed" ? (
          <FaCircleInfo className="text-red-500 text-xs" />
        ) : (
          getFileIcon(doc.file_type)
        )}
      </div>
      <span className="truncate flex-1 text-xs text-foreground/90">
        {doc.title}
      </span>
    </motion.div>
  );
};

// ================= FolderTree =================
const FolderTree = ({
  parentId = 0, // use 0 as root key
}: {
  parentId?: number;
}) => {
  const [expandedFolders, setExpandedFolders] = useState<Set<number>>(new Set());
  const [folderContents, setFolderContents] = useState<
    Record<number, FolderContentItem[]>
  >({});
  const [loadingFolder, setLoadingFolder] = useState<number | null>(null);

  // Fetch folder contents (folders + docs)
  const fetchContents = async (folderId: number) => {
    try {
      const items = await getFolderContentsAPI(folderId === 0 ? null : folderId);
      const typedItems: FolderContentItem[] = items.map((item) =>
        "file_type" in item
          ? { ...item, type: "document" }
          : { ...item, type: "folder" }
      );
      setFolderContents((prev) => ({ ...prev, [folderId]: typedItems }));
    } catch (err) {
      console.error(err);
      toast.error("Failed to load folder contents.");
    }
  };

  useEffect(() => {
    // fetch root items
    if (!folderContents[parentId]) {
      setLoadingFolder(parentId);
      fetchContents(parentId).finally(() => setLoadingFolder(null));
    }
  }, [parentId]);

  const toggleFolder = (folderId: number) => {
    setExpandedFolders((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) newSet.delete(folderId);
      else newSet.add(folderId);
      return newSet;
    });

    if (!folderContents[folderId]) {
      setLoadingFolder(folderId);
      fetchContents(folderId).finally(() => setLoadingFolder(null));
    }
  };

  const items = folderContents[parentId] || [];

  return (
    <div className="space-y-1 pl-2 border-l border-border/20">
      {loadingFolder === parentId ? (
        <div className="space-y-1 ml-5">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-40 rounded-md" />
          ))}
        </div>
      ) : (
        items.map((item) =>
          item.type === "folder" ? (
            <div key={`folder-${item.id}`}>
              <div
                onClick={() => toggleFolder(item.id)}
                className="flex items-center h-8 gap-2 rounded-md hover:bg-primary/10 cursor-pointer select-none"
              >
                <ChevronRight
                  className={`h-3.5 w-3.5 flex-shrink-0 transition-transform ${
                    expandedFolders.has(item.id) ? "rotate-90" : ""
                  }`}
                />
                <FolderIcon className="h-5 w-5 text-primary flex-shrink-0" />
                <span className="text-sm font-semibold flex-1 text-foreground/90">
                  {item.name}
                </span>
              </div>
              {expandedFolders.has(item.id) && (
                <div className="ml-4">
                  <FolderTree parentId={item.id} />
                </div>
              )}
            </div>
          ) : (
            <DocumentItem key={`doc-${item.id}`} doc={item as UserDocument} />
          )
        )
      )}
    </div>
  );
};

const Sidebar = () => {
  return (
    <div className="hidden sm:flex w-60 bg-secondary text-[#d4d4d4] border-r border-primary/20 p-2 flex-col font-sans text-xs">
      <h1 className="text-xl flex items-center gap-2 tracking-wider font-semibold text-primary mb-3">
        <VscFolderLibrary /> My Explore
      </h1>
      <div className="flex-1 overflow-y-auto pr-2 space-y-1">
        <FolderTree parentId={0} />
      </div>
    </div>
  );
};

export default Sidebar;
