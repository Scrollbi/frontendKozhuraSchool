import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

const backend = process.env.VITE_BACKEND_URL ?? 'http://127.0.0.1:8000'

/** Переписываем Location у редиректов с бэкенда на путь /api/... — иначе браузер уходит на 127.0.0.1:8000 и ловит CORS */
function rewriteProxyRedirectLocation(proxyRes: { statusCode?: number; headers: Record<string, string | string[] | undefined> }) {
  const code = proxyRes.statusCode
  if (code !== 301 && code !== 302 && code !== 307 && code !== 308) return
  const raw = proxyRes.headers['location']
  const loc = Array.isArray(raw) ? raw[0] : raw
  if (!loc || typeof loc !== 'string') return
  try {
    const u = new URL(loc, backend)
    const target = new URL(backend)
    if (u.origin === target.origin) {
      proxyRes.headers['location'] = '/api' + u.pathname + u.search
    }
  } catch {
    /* ignore */
  }
}

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true,
    open: true,
    proxy: {
      '/api': {
        target: backend,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, ''),
        configure: (proxy) => {
          proxy.on('proxyRes', rewriteProxyRedirectLocation)
        },
      },
      '/files': {
        target: backend,
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
