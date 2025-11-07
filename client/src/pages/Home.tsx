import { useEffect } from "react";
import { useDocumentStore } from "@/stores/documentStore";
import { getAllDocuments } from "@/libs/apis/documents";
import Sidebar from "@/components/Sidebar";
import ChatUi from "@/components/Main";
import { useAuthStore } from "@/stores/authStore";


export default function Home() {
  const { setDocuments } = useDocumentStore();
  const {user} = useAuthStore()


  console.log("User: ",user?.profile_picture);
  

  // Fetch documents from API on mount
  useEffect(() => {
    const fetchDocs = async () => {
      try {
        const res = await getAllDocuments();
        // console.log("Fetched Docs: ",res);
        
        setDocuments(res);
      } catch (error) {
        console.error("Error fetching documents:", error);
      }
    };
    fetchDocs();
  }, []);
  
  return (
    <div className="flex flex-col sm:flex-row h-[calc(100vh-64px)] bg-secondary text-foreground">

      <Sidebar />

      <ChatUi />

    </div>
  );
}
