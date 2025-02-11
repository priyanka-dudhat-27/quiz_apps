import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/

export default defineConfig({
  server: {
    host: 'localhost',
    port: 5173,
    hmr: {
      clientPort: 5173, 
    },
  },
   watch: {
    usePolling: true, // Avoid WebSocket issues
  },
  plugins: [react(),tailwindcss()], 
});
