import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

if (window.location.pathname !== "/") {
  window.history.replaceState(null, "", "/");
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
