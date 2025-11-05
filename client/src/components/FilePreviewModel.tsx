import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface FilePreviewModalProps {
  fileUrl: string;
  fileType: string;
  trigger: React.ReactNode;
}

const FilePreviewModal: React.FC<FilePreviewModalProps> = ({ fileUrl, fileType, trigger }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [openImageModal, setOpenImageModal] = useState(false);

  const ext = fileType.toLowerCase();
  const isImage = ext.match(/png|jpeg|jpg/i);
  const isPDF = ext === "pdf";
  const isGoogleDocsFile = ["docx", "pptx"].includes(ext);

  const previewUrl = isGoogleDocsFile
    ? `https://docs.google.com/viewer?url=${encodeURIComponent(fileUrl)}&embedded=true`
    : fileUrl;

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleClick = () => {
    if (isImage) {
      // Show modal for images
      setOpenImageModal(true);
    } else if (isPDF || isGoogleDocsFile) {
      // Open supported docs in new tab
      const newTab = window.open();
      if (newTab) {
        newTab.document.write(`
          <html>
            <head>
              <title></title>
              <style>
                body { margin:0; display:flex; flex-direction:column; height:100vh; font-family:sans-serif; background:#f9fafb; }
                iframe { flex:1; width:100%; border:none; }
              </style>
            </head>
            <body>
              <iframe src="${previewUrl}"></iframe>
            </body>
          </html>
        `);
        newTab.document.close();
      }
    } else {
      const newTab = window.open();
      if (newTab) {
        newTab.document.write(`
          <html>
            <head>
              <title></title>
              <style>
                body { margin:0; display:flex; align-items:center; justify-content:center; height:100vh; font-family:sans-serif; background:#f9fafb; }
                a.button { padding:12px 24px; background:#2d9b67; color:white; text-decoration:none; border-radius:6px; font-weight:bold; }
              </style>
            </head>
            <body>
              <a class="button" href="${fileUrl}" download target="_blank">Download File</a>
            </body>
          </html>
        `);
        newTab.document.close();
      }
    }
  };

  return (
    <>
      {/* Trigger */}
      <span onClick={handleClick}>{trigger}</span>

      {/* Image Modal only */}
      {openImageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-[95vw] h-[90vh] bg-background rounded-xl shadow-xl flex flex-col">
            <img
              src={fileUrl}
              alt="Preview"
              className="flex-1 max-h-full max-w-full object-contain mx-auto"
            />
            <div className="mt-4 text-center">
              <a href={fileUrl} download target="_blank" rel="noopener noreferrer">
                <Button>Download</Button>
              </a>
            </div>
            <button
              className="absolute top-2 right-2 text-white text-lg font-bold"
              onClick={() => setOpenImageModal(false)}
            >
              ×
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default FilePreviewModal;
