import { Button } from "@/components/ui/button";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { useDocumentStore, type UserDocument } from "@/stores/documentStore";
import { toast } from "sonner";
import { deleteDocumentFromDB, uploadFileToDB } from "@/libs/apis/documents";
import ConfirmAlert from "./ConfirmAlert";
import FilePreviewModal from "./FilePreviewModel";
import { FiFile } from "react-icons/fi";
import {
  BsFiletypeDocx,
  BsFiletypeJpg,
  BsFiletypePdf,
  BsFiletypePng,
  BsFiletypePptx,
  BsFiletypeTxt,
} from "react-icons/bs";
import { useRef } from "react";
import { Input } from "./ui/input";
import type { DocumentListProps } from "@/types";

const getFileIcon = (type: string) => {
  const iconProps = "h-8 w-8 mr-2";

  if (!type) return <FiFile className={`text-primary ${iconProps}`} />;

  type = type.toUpperCase();

  if (type.includes("PDF")) {
    return <BsFiletypePdf className={`text-red-500 ${iconProps}`} />;
  }
  if (type.includes("PNG")) {
    return <BsFiletypePng className={`text-pink-500 ${iconProps}`} />;
  }
  if (type.includes("PPT") || type.includes("PPTX")) {
    return <BsFiletypePptx className={`text-yellow-500 ${iconProps}`} />;
  }
  if (type.includes("JPG") || type.includes("JPEG")) {
    return <BsFiletypeJpg className={`text-purple-500 ${iconProps}`} />;
  }
  if (type.includes("DOCX")) {
    return <BsFiletypeDocx className={`text-orange-500 ${iconProps}`} />;
  }
  if (type.includes("TXT")) {
    return <BsFiletypeTxt className={`text-green-500 ${iconProps}`} />;
  }

  // fallback generic file icon
  return <FiFile className={`text-primary ${iconProps}`} />;
};

const DocumentList: React.FC<DocumentListProps> = ({ document }) => {
  const { setDocuments, documents } = useDocumentStore();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleDocumentDelete = async (docId: number) => {
    try {
      toast.loading("Deleting Document", { id: "delete" });
      await deleteDocumentFromDB(docId);
      setDocuments(documents.filter((doc) => doc.id !== docId));
      toast.success("Document Deleted", { id: "delete" });
    } catch (error) {
      toast.error("Failed to delete document", { id: "delete" });
    }
  };

  const getPreviewUrl = (doc: UserDocument) => {
    const ext = doc.file_type.toLowerCase();

    if (ext === "pdf") {
      // PDFs are served directly from backend preview endpoint
      return `http://localhost:8000/documents/preview/${doc.id}`;
    }

    if (["docx", "pptx"].includes(ext)) {
      // Use Google Docs Viewer for DOCX / PPTX
      return `https://docs.google.com/viewer?url=${encodeURIComponent(
        `http://localhost:8000/documents/preview/${doc.id}`
      )}&embedded=true`;
    }

    // Images from Cloudinary
    return doc.file_url;
  };

  const openFileManager = () => {
    fileRef.current?.click();
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    toast.loading("Uploading Document", { id: "upload" });

    const uploadedDoc = await uploadFileToDB(file,null);

    if (uploadedDoc?.error) {
      // Show actual error from backend
      toast.error(uploadedDoc.error, { id: "upload" });
    } else {
      setDocuments([...documents, uploadedDoc]);
      toast.success("Document Uploaded", { id: "upload" });
    }
  };

  return (
    <>
      <div className="hidden md:block overflow-hidden rounded-lg border border-secondary/30">
        {document.length > 0 ? (
          <table className="w-full table-fixed text-sm">
            <thead className="bg-primary text-background">
              <tr>
                <th className="w-1/2 text-left px-4 py-3 font-medium">File</th>
                <th className="w-1/4 text-left px-4 py-3 font-medium">Type</th>
                <th className="w-1/4 text-left px-4 py-3 font-medium">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {document.map((doc) => (
                <tr
                  key={doc.id}
                  className="border-t border-secondary/20 hover:bg-primary/10 transition"
                >
                  <td className="px-4 py-3 flex items-center gap-3 truncate">
                    {doc.file_type.match(/PNG|JPEG|JPG/i) ? (
                      <img
                        src={doc.file_url}
                        alt={doc.title}
                        className="w-10 h-10 object-cover rounded-md border flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 flex items-center justify-center bg-secondary/20 rounded-md flex-shrink-0">
                        {getFileIcon(doc.file_type)}
                      </div>
                    )}
                    <span className="truncate">{doc.title}</span>
                  </td>

                  <td className="px-4 py-3 text-muted-foreground truncate">
                    {doc.file_type}
                  </td>

                  <td className="px-4 py-3 flex gap-2">
                    <FilePreviewModal
                      fileUrl={getPreviewUrl(doc)}
                      fileType={doc.file_type}
                      trigger={
                        <Button
                          size="sm"
                          variant="default"
                          className="text-secondary"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      }
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => console.log("Edit doc:", doc)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <ConfirmAlert
                      trigger={
                        <Button size="sm" variant="destructive">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                      message={`Are you sure you want to delete "${doc.title}"? This action cannot be undone.`}
                      onConfirm={() => handleDocumentDelete(doc.id)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="flex flex-col items-center justify-center gap-4 p-6">
              <p className="italic font-semibold text-lg text-foreground/80">
                No Documents Found
              </p>
              <Button
                onClick={openFileManager}
                variant="default"
                size="sm"
                className="bg-primary text-background hidden sm:flex"
              >
                Upload
              </Button>

              <Input
                type="file"
                ref={fileRef}
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {documents.map((doc) => (
          <FilePreviewModal
            key={doc.id}
            fileUrl={getPreviewUrl(doc)}
            fileType={doc.file_type}
            trigger={
              <div className="p-4 rounded-lg border border-primary/20 bg-secondary/20 shadow-sm flex items-center gap-4 hover:bg-primary/10 transition cursor-pointer">
                {doc.file_type.match(/PNG|JPEG|JPG/i) ? (
                  <img
                    src={doc.file_url}
                    alt={doc.title}
                    className="w-12 h-12 object-cover rounded-md border flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 flex items-center justify-center bg-secondary/20 rounded-md flex-shrink-0">
                    {getFileIcon(doc.file_type)}
                  </div>
                )}

                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate">{doc.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {doc.file_type}
                  </p>
                </div>

                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log("Edit doc:", doc);
                    }}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <ConfirmAlert
                    trigger={
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    }
                    message={`Are you sure you want to delete "${doc.title}"? This action cannot be undone.`}
                    onConfirm={() => handleDocumentDelete(doc.id)}
                  />
                </div>
              </div>
            }
          />
        ))}
      </div>
    </>
  );
};

export default DocumentList;
