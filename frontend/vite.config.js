import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// Cada entorno elige su API sin tocar el backend ni cambiar las rutas del equipo.
export default defineConfig(({ mode }) => {
  const entorno = loadEnv(mode, process.cwd(), 'ZENOIR_')
  const proxy = {
    '/api': {
      target: entorno.ZENOIR_API_TARGET || 'http://127.0.0.1:8080',
      changeOrigin: true,
      rewrite: (ruta) => ruta.replace(/^\/api/, ''),
    },
  }
  return {
    plugins: [react()],
    server: { proxy },
    preview: { proxy },
  }
})
