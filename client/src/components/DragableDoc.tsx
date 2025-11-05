import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { CiMenuKebab } from "react-icons/ci";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  IoOpenOutline,
  IoCutOutline,
  IoCopyOutline,
  IoTrashOutline,
} from "react-icons/io5";
import {
  BsFiletypeDocx,
  BsFiletypeJpg,
  BsFiletypePdf,
  BsFiletypePng,
  BsFiletypePptx,
  BsFiletypeTxt,
} from "react-icons/bs";
import { FiFile } from "react-icons/fi";
import { useDocumentStore, type UserDocument } from "@/stores/documentStore";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";

interface DraggableItemProps {
  doc: UserDocument;
  handleDeleteDoc: (docId: number) => void;
}

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

export function DraggableItem({ doc, handleDeleteDoc }: DraggableItemProps) {
  const { setClipboard } = useDocumentStore();
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `doc-${doc.id}`,
      data: { type: "document", doc },
    });

  const style: React.CSSProperties = {
    transform: transform ? CSS.Translate.toString(transform) : undefined,
    zIndex: isDragging ? 50 : 1,
    opacity: isDragging ? 0.8 : 1,
    transition: "transform 0.15s ease, box-shadow 0.2s ease",
  };

  const isImage =
    doc.file_type &&
    ["PNG", "JPG", "JPEG"].some((ext) =>
      doc.file_type.toUpperCase().includes(ext)
    );

  const handleClick = () => {
    console.log("Clicked file");
  };

  const handleCut = () => {
    setClipboard(doc, "cut");
  };

  const handleCopy = () => {
    setClipboard(doc, "copy");
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={handleClick}
      className="group relative cursor-pointer border border-border transition-all rounded-2xl shadow-md hover:shadow-lg flex flex-col items-center justify-center p-6 bg-card"
    >
      {isImage ? (
        <img
          src={doc.file_url}
          alt={doc.title}
          className="rounded-xl h-12 w-12 object-cover"
        />
      ) : (
        getFileIcon(doc.file_type)
      )}

      <p className="mt-3 text-sm font-medium text-foreground text-center truncate w-full">
        {doc.title}
      </p>
      <p className="text-xs text-primary mt-1">{doc.file_type}</p>

      {/* <div
        className="absolute top-2 left-2"
        onClick={(e) => e.stopPropagation()}
      >
        <Dialog>
          <DialogTrigger>Open</DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Are you absolutely sure?</DialogTitle>
              <DialogDescription>
                This action cannot be undone. This will permanently delete your
                account and remove your data from our servers.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </div> */}

      <div
        className="absolute top-2 right-2"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:ring-0">
            <CiMenuKebab className="text-primary w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="bg-secondary border-2 border-primary/20 font-semibold text-primary p-2"
            onClick={(e) => e.stopPropagation()}
          >
            <DropdownMenuLabel>Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <IoOpenOutline /> Open
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCut();
              }}
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCut;
              }}
            >
              <IoCutOutline /> Cut
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCopy();
              }}
              onPointerDown={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCopy;
              }}
            >
              <IoCopyOutline /> Copy
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleDeleteDoc(doc.id);
              }}
              onPointerDown={(e) => {
                e.preventDefault(); // ensures delete runs before dropdown unmount
                e.stopPropagation();
                handleDeleteDoc(doc.id);
              }}
              className="text-red-600"
            >
              <IoTrashOutline /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
