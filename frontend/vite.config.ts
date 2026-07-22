import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import {fileURLToPath,URL} from "node:url";
export default defineConfig({plugins:[react()],resolve:{alias:{"react/jsx-runtime":fileURLToPath(new URL("./src/i18n-jsx-runtime.ts",import.meta.url)),"react/jsx-dev-runtime":fileURLToPath(new URL("./src/i18n-jsx-runtime.ts",import.meta.url))}}});
