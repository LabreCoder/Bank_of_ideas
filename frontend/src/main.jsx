import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";

// This is the actual entry point of the app — Vite injects this file
// through the <script> tag in index.html.
// BrowserRouter wraps everything so we can use React Router anywhere
// below it (Sidebar links, page navigation, etc).
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
