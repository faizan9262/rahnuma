import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import axios from "axios";
import { Toaster } from "sonner";

// Axios config
axios.defaults.baseURL = "http://localhost:8000";
axios.defaults.withCredentials = true;

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
    <BrowserRouter>
      <Toaster 
        position="top-right" 
        richColors 
        closeButton={true}
        toastOptions={{
          duration: 5000,
        }}
      />
      <App />
    </BrowserRouter>
  // </React.StrictMode>
);
