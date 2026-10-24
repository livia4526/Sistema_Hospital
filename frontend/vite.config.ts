import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Tudo que começa com /api é repassado para o Django.
    // Assim o navegador acha que React e Django são o mesmo site,
    // e o login (cookie de sessão) funciona sem complicação.
    proxy: {
      '/api': 'http://localhost:8000',
      '/media': 'http://localhost:8000', // fotos enviadas (ex.: foto do perfil)
    },
  },
})
