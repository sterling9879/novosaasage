import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3002,
    host: true
  },
  preview: {
    port: 3002,
    host: true,
    allowedHosts: ['teacher.sageapp.com.br', 'localhost']
  }
})
