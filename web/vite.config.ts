import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Static SPA build → dist/ (served by Render).
export default defineConfig({
  plugins: [react()],
});
