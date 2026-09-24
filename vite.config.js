import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// Mounts the Vercel functions in api/ on the dev server so `npm run dev`
// behaves like production. Server-only env vars never reach the client
// because they lack the VITE_ prefix.
function apiRoutes(env) {
  return {
    name: 'local-api-routes',
    configureServer(server) {
      server.middlewares.use('/api/extract', async (req, res) => {
        if (req.method !== 'POST') {
          res.statusCode = 405
          return res.end()
        }
        process.env.GEMINI_API_KEY ??= env.GEMINI_API_KEY
        const chunks = []
        for await (const chunk of req) chunks.push(chunk)
        const request = new Request(`http://${req.headers.host}${req.originalUrl}`, {
          method: 'POST',
          headers: req.headers,
          body: Buffer.concat(chunks),
        })
        const { POST } = await server.ssrLoadModule('/api/extract.js')
        const response = await POST(request)
        res.statusCode = response.status
        res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json')
        res.end(await response.text())
      })
    },
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react(), apiRoutes(env)],
    server: {
      port: 5173,
      open: true
    }
  }
})
