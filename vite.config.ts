import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { handleApiRequest } from './server/apiRouter';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  // Set default demo key if not provided
  if (!process.env.VITE_GOOGLE_MAPS_API_KEY && !env.VITE_GOOGLE_MAPS_API_KEY) {
    process.env.VITE_GOOGLE_MAPS_API_KEY = "AIzaSyAzS-o1oNewr03tMdAh5QJzJVw-Sa_HjPQ";
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'bloodconnect-api-server',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            handleApiRequest(req, res, next);
          });
        },
      },
    ],
    define: {
      'import.meta.env.VITE_GOOGLE_MAPS_API_KEY': JSON.stringify(
        process.env.VITE_GOOGLE_MAPS_API_KEY || env.VITE_GOOGLE_MAPS_API_KEY || "AIzaSyAzS-o1oNewr03tMdAh5QJzJVw-Sa_HjPQ"
      ),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

