import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  preview: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: ['mass-mailing-solution-frontend-1.onrender.com', 'mass-mailing-frontend.onrender.com', 'localhost', '127.0.0.1'],
  }
})
