import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Raise the advisory warning threshold (1.1 MB minified is acceptable for a rich editor app)
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // Split vendor bundles to improve caching
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'motion': ['framer-motion'],
          'editor': [
            '@tiptap/react',
            '@tiptap/starter-kit',
            '@tiptap/extension-image',
            '@tiptap/extension-link',
            '@tiptap/extension-placeholder',
            '@tiptap/extension-text-align',
            '@tiptap/extension-underline',
            '@tiptap/extension-youtube',
            '@tiptap/extension-character-count',
          ],
          'supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
})