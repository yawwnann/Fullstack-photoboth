import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css"; // Import gaya global dan Tailwind

// Dapatkan root element, pastikan tidak null
const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element with ID 'root' not found in the DOM.");
}

// Render aplikasi
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
