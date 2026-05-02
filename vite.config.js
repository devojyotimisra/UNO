import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [
      react(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.svg'],
        manifest: {
          name: 'UNO Online',
          short_name: 'UNO',
          description: 'Play UNO with friends online. Create a room, share the code, and play instantly.',
          theme_color: '#0b0a14',
          background_color: '#0b0a14',
          display: 'standalone',
          icons: [
            {
              src: '/favicon.svg',
              sizes: 'any',
              type: 'image/svg+xml',
              purpose: 'any maskable'
            }
          ]
        }
      })
    ],
    server: {
      port: 3000,
      proxy: {
        '/socket.io': {
          target: env.VITE_BACKEND_URL,
          ws: true,
        },
      },
    },
  };
});
