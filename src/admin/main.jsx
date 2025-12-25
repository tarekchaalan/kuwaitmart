import React from "react";
import { createRoot } from "react-dom/client";
import "../index.css";
import AdminApp from "./AdminApp.jsx";

const root = createRoot(document.getElementById("admin-root"));
root.render(
  <React.StrictMode>
    <AdminApp />
  </React.StrictMode>
);


