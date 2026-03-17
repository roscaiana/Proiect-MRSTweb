import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./theme/main.css";
import App from "./App";

const rootElement = globalThis["document"]?.getElementById("root");
if (!rootElement) {
  throw new Error('Element with id "root" was not found.');
}

createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
