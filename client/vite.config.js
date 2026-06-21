import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    watch: {
      ignored: ['**/node_modules_old/**']
    }
  },
  build: {
    rollupOptions: {
      external: [/node_modules_old/]
    }
  }
});
