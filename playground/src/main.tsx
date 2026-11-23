import { ThemeProvider, type ColourPreference } from "@wiltshirescouts/theme";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { App } from "./App";
import "./app.css";

const q = new URLSearchParams(location.search).get("mode");
const forced = q === "light" || q === "dark" || q === "auto" ? (q as ColourPreference) : undefined;

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <ThemeProvider forcePreference={forced}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
);
