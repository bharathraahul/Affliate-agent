import React from "react";
import { createRoot } from "react-dom/client";
// OpenUI styles must load before our overrides.
import "@openuidev/react-ui/components.css";
import "@openuidev/react-ui/defaults.css";
import "./styles.css";
import { App } from "./App";

createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
