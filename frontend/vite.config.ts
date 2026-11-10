import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// Plugin to dynamically set favicon based on environment variable
function faviconPlugin() {
  return {
    name: 'favicon-plugin',
    transformIndexHtml(
      html: string,
      ctx: {
        path: string
        filename: string
        mode: string
        server?: unknown
        bundle?: unknown
        chunk?: unknown
      }
    ) {
      const { mode } = ctx
      // eslint-disable-next-line no-undef
      const env = loadEnv(mode, process.cwd(), '')
      const faviconPath = env.VITE_APP_FAVICON_PATH || '/favicon.svg'
      
      // Determine .ico path based on .svg path
      const faviconIcoPath = faviconPath.replace('.svg', '.ico')
      
      // Replace favicon links in HTML
      return html
        .replace(/href="\/favicon\.svg"/g, `href="${faviconPath}"`)
        .replace(/href="\/favicon\.ico"/g, `href="${faviconIcoPath}"`)
    },
  }
}

// https://vite.dev/config/
// @ts-ignore
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isDev = mode === 'development'

  // Backend address for the dev-server proxy. Inside the compose network the
  // service name "backend" resolves; when running `npm run dev` outside Docker
  // set API_PROXY_TARGET=http://127.0.0.1:5000.
  const apiProxyTarget =
    process.env.API_PROXY_TARGET || env.API_PROXY_TARGET || 'http://backend:5000'

  return {
    plugins: [
      vue(),
      ...(isDev ? [vueDevTools()] : []),
      faviconPlugin(),
    ],
    server: {
      port: 5174,
      proxy: {
        // Mirrors the nginx `location /api` used in production: the browser only
        // talks to the dev server, and "/api/..." is forwarded to the backend
        // root as "/...". No host/IP of the backend has to be known by the client.
        '/api': {
          target: apiProxyTarget,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
    },
    build: {
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
        resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      },
    },
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV),
    },
  }
})
