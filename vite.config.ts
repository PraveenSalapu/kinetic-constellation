import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'copy-extension-files',
      closeBundle: async () => {
        const fs = await import('fs');
        const path = await import('path');
        const srcManifest = path.resolve(__dirname, 'src/extension/manifest.json');
        const distManifest = path.resolve(__dirname, 'dist/manifest.json');

        // Copy manifest
        if (fs.existsSync(srcManifest)) {
          fs.copyFileSync(srcManifest, distManifest);
          console.log('Copied manifest.json to dist');
        }
      }
    }
  ],
  server: {
    proxy: {
      '/n8n-proxy': {
        target: 'http://localhost:5678',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/n8n-proxy/, ''),
      },
    },
  },
  optimizeDeps: {
    include: ['@react-pdf/renderer'],
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      input: {
        main: 'index.html',
        content: 'src/extension/content.js'
      },
      output: {
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
})
