import path from "path";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  // dev proxy keeps the frontend and flask on one origin, so no CORS setup needed.
  // backend runs on 5001 (see app.py); the /api prefix is preserved through to flask.
  server: { proxy: { "/api": "http://localhost:5001" } },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/test-setup.ts"],
    css: false,
  },
});
