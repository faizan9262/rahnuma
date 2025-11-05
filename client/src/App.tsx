// App.tsx
import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { useAuthStore } from "./stores/authStore";
import { useEffect, lazy, Suspense } from "react";
import Login from "./pages/Login";
import Signup from "./pages/Signup";

// Lazy-loaded pages
const Home = lazy(() => import("./pages/Home"));
const Hero = lazy(() => import("./pages/Hero"));
const Documents = lazy(() => import("./pages/Documents"));

export default function App() {
  const location = useLocation();
  const hideNavbar = ["/login", "/signup"].includes(location.pathname);

  const { verify, user } = useAuthStore();

  useEffect(() => {
    verify();
  }, []);

  return (
    <>
      {!hideNavbar && <Navbar />}
      <Suspense fallback={<div className="text-center py-20">Loading...</div>}>
        <Routes>
          <Route path="/" element={user?.id ? <Home /> : <Hero />} />
          <Route path="/files" element={<Documents />} />
          <Route path="/files/:folderId" element={<Documents />} />
          <Route path="/files/:folderId/:folderName" element={<Documents />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Suspense>
    </>
  );
}
