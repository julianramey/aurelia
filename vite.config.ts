import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'index.css') {
            return 'assets/landing-styles.css'; // Output src/index.css as assets/landing-styles.css
          }
          return 'assets/[name]-[hash][extname]'; // Keep hashing for other assets
        },
      },
    },
    // If your src/index.css is not the default CSS entry point for your main app,
    // you might need to explicitly define it as an input if it's not processed otherwise.
    // This is usually not needed if index.css is imported in your main.tsx or similar.
  }
}));
