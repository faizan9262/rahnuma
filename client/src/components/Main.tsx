import { useDocumentStore } from "@/stores/documentStore";
import {
  File,
  FileArchive,
  FileText,
  Image,
  Key,
  SplitSquareHorizontal,
  ChevronDown,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Switch } from "./ui/switch";
import Chat from "./ChatUI";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import type { Message } from "@/types";
import QuizUI from "./QuizUI";

const initialDummyChat: Message[] = [
  { sender: "ai", text: "Hello! Ask me anything about your document." },
];

const ChatUi = () => {
  const { documents, selectedDoc, setDoc, chats } = useDocumentStore();
  const [messages, setMessages] = useState<Message[]>(initialDummyChat);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // new: viewMode → "chat" | "quiz" | "split"
  const [viewMode, setViewMode] = useState<"chat" | "quiz" | "split">("chat");

  // Auto-scroll on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const getFileIcon = (type: string) => {
    const iconProps = { className: "h-6 w-6 mr-2" };
    if (!type) return <File {...iconProps} />;
    type = type.toUpperCase();
    if (type.includes("PDF"))
      return <FileText {...iconProps} className="text-red-500" />;
    if (type.match(/PNG|JPEG|JPG/i))
      return <Image {...iconProps} className="text-blue-500" />;
    if (type.includes("ZIP") || type.includes("RAR"))
      return <FileArchive {...iconProps} className="text-yellow-500" />;
    if (type.includes("KEY"))
      return <Key {...iconProps} className="text-purple-500" />;
    return <File {...iconProps} className="text-gray-500" />;
  };

  useEffect(() => {
    if (selectedDoc) {
      setMessages(chats[selectedDoc.id] || initialDummyChat);
    }
  }, [selectedDoc]);

  return (
    <div className="flex-1 flex flex-col p-2 bg-card relative">
      {/* Mobile Dropdown + Controls */}
      <div className="sm:hidden mb-2 flex items-center justify-between gap-2">
        {/* Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex-1 min-w-0 flex justify-between items-center bg-card-dark border border-border rounded-lg p-3">
              <span className="truncate">
                {selectedDoc ? selectedDoc.title : "Select a document"}
              </span>
              <ChevronDown className="ml-2 h-4 w-4" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)] bg-card-dark border border-border rounded-lg shadow-lg">
            {documents?.map((doc) => (
              <DropdownMenuItem
                key={doc.id}
                onClick={() => setDoc(doc)}
                className="flex items-center gap-2 cursor-pointer"
              >
                {getFileIcon(doc.file_type)}
                <span className="truncate">{doc.title}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Controls (Toggle + Split) */}
        <div className="flex items-center gap-2">
          {viewMode !== "split" && (
            <Switch
              checked={viewMode === "quiz"}
              onCheckedChange={(checked) =>
                setViewMode(checked ? "quiz" : "chat")
              }
              className="bg-gray-300 data-[state=checked]:bg-primary"
            />
          )}
          <button
            onClick={() => setViewMode(viewMode === "split" ? "chat" : "split")}
            className={`p-2 rounded-lg border hidden md:block ${
              viewMode === "split"
                ? "bg-primary text-card-dark"
                : "bg-card-dark text-foreground hover:bg-muted"
            }`}
          >
            <SplitSquareHorizontal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {selectedDoc ? (
        <>
          {/* Desktop Header */}
          <div className="hidden sm:flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-primary">
              {selectedDoc.title}
            </h2>

            <div className="flex items-center space-x-3">
              {viewMode !== "split" && (
                <div className="flex flex-col items-center justify-center">
                  <span className="text-sm font-medium">
                    <span className="font-bold capitalize">Quiz</span>
                  </span>
                  <Switch
                    checked={viewMode === "quiz"}
                    onCheckedChange={(checked) =>
                      setViewMode(checked ? "quiz" : "chat")
                    }
                    className="bg-gray-300 data-[state=checked]:bg-primary"
                  />
                </div>
              )}

              <button
                onClick={() =>
                  setViewMode(viewMode === "split" ? "chat" : "split")
                }
                className={`p-2 rounded-lg border ${
                  viewMode === "split"
                    ? "bg-primary text-card-dark"
                    : "bg-card-dark text-foreground hover:bg-muted"
                }`}
              >
                <SplitSquareHorizontal className="w-5 h-5" />
              </button>
            </div>
          </div>
          {/* Render Views */}
          {viewMode === "chat" && <Chat />}
          {viewMode === "quiz" && <QuizUI docId={selectedDoc.id}/>}
          {viewMode === "split" && (
            <ResizablePanelGroup
              direction="horizontal"
              className="flex-1 flex overflow-hidden gap-2"
            >
              <ResizablePanel
                minSize={30} // Adjusted minSize for better usability
                defaultSize={50}
                className="overflow-hidden"
              >
                <div className="h-full flex flex-col">
                  <QuizUI docId={selectedDoc.id} />
                </div>
              </ResizablePanel>

              {/* CORRECTED: Added the 'withHandle' prop to make it draggable */}
              <ResizableHandle withHandle className="bg-primary"/>

              <ResizablePanel
                minSize={30} // Adjusted minSize for better usability
                defaultSize={50}
                className="overflow-hidden"
              >
                <div className="h-full flex flex-col">
                  <Chat />
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          )}
        </>
      ) : (
        <div className="flex-1 flex flex-col justify-center items-center text-muted">
          <div className="text-4xl font-bold mb-2 text-primary animate-pulse">
            Select a document
          </div>
          <div className="text-lg text-foreground">
            Chat/Quiz will appear here when you select a document
          </div>
        </div>
      )}
      <div ref={chatEndRef} />
    </div>
  );
};

export default ChatUi;
