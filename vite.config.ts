import vinext from "vinext";
import { defineConfig } from "vite";
import { nitro } from "nitro/vite";

// Nitro detects Vercel during its build and writes the .output directory that
// Vercel consumes for server functions and static assets.
export default defineConfig({
  plugins: [vinext(), nitro()],
});
