// components/DroppableFolder.tsx
import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { FaRegFolder } from "react-icons/fa6";
import { CiMenuKebab } from "react-icons/ci";
import type { Folder } from "@/stores/folderStore";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { DropdownMenuLabel, DropdownMenuSeparator } from "@radix-ui/react-dropdown-menu";
import { IoOpenOutline } from "react-icons/io5";
import { FiEdit } from "react-icons/fi";
import { MdDeleteOutline } from "react-icons/md";
import { TiDocumentAdd } from "react-icons/ti";
import { MdOutlineCreateNewFolder } from "react-icons/md";
import { HiOutlineFolderRemove } from "react-icons/hi";
import { MdOutlineFolderCopy } from "react-icons/md";

interface DroppableFolderProps {
  folder: Folder;
  openFolder: (folderId: number, folderName: string) => void;
}

export function DroppableFolder({ folder, openFolder }: DroppableFolderProps) {
  const { isOver, setNodeRef } = useDroppable({
    id: `folder-${folder.id}`,
    data: { type: "folder", folder }, // Pass data for context
  });

  const style: React.CSSProperties = {
    boxShadow: isOver ? "0 0 0 3px #2d9b67" : undefined, // Visual feedback on hover
    transform: isOver ? "scale(1.05)" : "scale(1)",
    transition: "transform 0.2s, box-shadow 0.2s",
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={() => openFolder(folder.id, folder.name)}
      className="group relative cursor-pointer bg-primary/10 border border-border  hover:bg-muted transition-all rounded-2xl shadow-lg hover:shadow-lg flex flex-col items-center justify-center p-6"
    >
      <FaRegFolder className="h-12 w-12 text-primary drop-shadow-sm transition-transform group-hover:scale-110" />
      <p className="mt-3 text-xs font-medium text-foreground text-center truncate w-full">
        {folder.name}
      </p>
      <div className="absolute top-2 right-2">
        <DropdownMenu>
          <DropdownMenuTrigger className="focus:ring-0">
            <CiMenuKebab />
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-secondary border-2 border-primary/20 font-semibold text-primary p-2">
            <DropdownMenuLabel>Options</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <MdOutlineCreateNewFolder /> New Folder
            </DropdownMenuItem>
            <DropdownMenuItem>
              <TiDocumentAdd /> Add File
            </DropdownMenuItem>
            <DropdownMenuItem>
              <IoOpenOutline /> Open
            </DropdownMenuItem>
            <DropdownMenuItem>
              <HiOutlineFolderRemove /> Cut
            </DropdownMenuItem>
            <DropdownMenuItem>
              <MdOutlineFolderCopy /> Copy
            </DropdownMenuItem>
            <DropdownMenuItem>
              <FiEdit />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem className="text-red-600">
              <MdDeleteOutline />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
