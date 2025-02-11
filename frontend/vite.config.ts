import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // 또는 '0.0.0.0'
    port: 5173, // 사용할 포트 (기본값: 5173)
  },  
})
