import { defineConfig } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  resolve: {
    dedupe: ['lit', '@shoelace-style/shoelace']
  },
  plugins: [
    viteStaticCopy({
      targets: [
        {
          src: 'node_modules/@shoelace-style/shoelace/dist/assets/icons/*.svg',
          dest: 'shoelace/assets/icons',
        },
        {
          src: 'node_modules/@shoelace-style/shoelace/dist/themes/*',
          dest: 'shoelace/themes',
        },
        {
          src: 'node_modules/leaflet/dist/leaflet.css',
          dest: 'leaflet',
        },
        {
          src: 'node_modules/leaflet/dist/images/*',
          dest: 'leaflet/images',
        },
      ],
    }),
    VitePWA({
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.js',
      injectRegister: false,
      manifest: false,
      includeAssets: ['assets/**/*', 'offline.html'],
    }),
  ],
  build: {
    sourcemap: false,
    target: 'es2019',
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['lit', '@shoelace-style/shoelace', 'leaflet'],
        }
      }
    }
  }
});
