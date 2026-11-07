import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { router } from "./App.jsx";
import "./index.css";
import { ThemeProvider } from "./context/ThemeContext";
import { SoundProvider } from "./context/SoundContext";

// This is the actual entry point of the app — Vite injects this file
// through the <script> tag in index.html. The router itself is defined in App.jsx.
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider>
      <SoundProvider>
        <RouterProvider router={router} />
      </SoundProvider>
    </ThemeProvider>
  </React.StrictMode>
);
