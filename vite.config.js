import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    // Production optimizations
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom']
        }
      }
    },
    // Clean build output for production
    clean: false,
    // Target modern browsers
    target: ['es2020', 'chrome115', 'firefox120', 'safari14'],
    // Chunk size optimization
    chunkSizeWarningLimit: 1500,
    // No sourcemaps for production
    sourcemap: false
  },
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
