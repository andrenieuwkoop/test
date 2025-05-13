import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/test', // belangrijk voor relatieve paden bij Codeberg Pages
  plugins: [react()],
})