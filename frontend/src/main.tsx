import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "./i18n";
import "./index.css";
import App from "./App";
import { ToastHost } from "./components/Toast";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={new QueryClient({defaultOptions:{queries:{retry:1,staleTime:60000,gcTime:300000,refetchOnWindowFocus:false}}})}>
      <BrowserRouter><App /><ToastHost/></BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>
);
