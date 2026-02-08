import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 3000,
    open: true
  },
  base: './' // GitHub Pages 배포를 위한 상대 경로 설정
})

