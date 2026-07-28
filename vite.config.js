import { defineConfig } from "vite"

export default defineConfig(({ command }) => ({
  define: {
    "process.env": {
      NODE_ENV: JSON.stringify(
        command === "build" ? "production" : "development",
      ),
    },
  },
  build: {
    lib: {
      entry: "src/main.ts",
      formats: ["es"],
      fileName: () => "index.js",
    },
    outDir: "dist",
    emptyOutDir: true,
    target: "es2020",
    minify: false,
  },
}))
