import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',
  plugins: [react()],
  build: { outDir: 'dist' },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:4040',
        changeOrigin: true,
        secure: false,
      },
      // Add proxy for /test/api routes as well
      '/test/api': {
        target: 'http://localhost:4040',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/test\/api/, '/api')
      },
    },
  },
})
