import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig, type Plugin } from 'vite'

const schoolHistoryFallback: Plugin = {
  name: 'school-history-fallback',
  configureServer(server) {
    server.middlewares.use((request, _response, next) => {
      const pathname = request.url?.split('?')[0] || '/'
      const lastSegment = pathname.slice(pathname.lastIndexOf('/') + 1)
      const isApplicationRoute = pathname === '/' || !lastSegment.includes('.')

      if (isApplicationRoute && !pathname.startsWith('/@')) {
        const query = request.url?.includes('?') ? request.url.slice(request.url.indexOf('?')) : ''
        request.url = `/school.html${query}`
      }

      next()
    })
  },
}

export default defineConfig({
  plugins: [react(), tailwindcss(), schoolHistoryFallback],
})
