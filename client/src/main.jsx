import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import { applyTheme } from "./constants/theme";
import { AuthProvider } from "./Features/Auth/Hooks/AuthContext";
import App from "./App";

import "./index.css";
import "./App.css";

// Inject colour / typography / layout constants as CSS variables before first paint.
applyTheme();

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
