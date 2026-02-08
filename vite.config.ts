import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Separate vendor chunks for better caching
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['framer-motion'],

          // Admin portal chunk
          'admin': [
            './src/pages/Admin/Cars.tsx',
            './src/pages/Admin/Dashboard.tsx',
            './src/pages/Admin/Agents.tsx',
            './src/pages/Admin/Services.tsx',
            './src/pages/Admin/FAQs.tsx',
            './src/pages/Admin/Contacts.tsx',
          ],

          // Agent portal chunk
          'agent': [
            './src/pages/Agent/MyCars.tsx',
            './src/pages/Agent/Dashboard.tsx',
            './src/pages/Agent/Profile.tsx',
          ],
        },
      },
    },
    chunkSizeWarningLimit: 400, // Warn if chunks exceed 400KB
    sourcemap: false, // Disable sourcemaps in production for smaller builds
  },
  // Optimize deps
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom', 'framer-motion'],
  },
})
