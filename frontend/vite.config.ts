import { fileURLToPath } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import { Features } from 'lightningcss'

// Plugin to dynamically set favicon based on environment variable.
// VITE_APP_FAVICON_PATH is read at config load time from process.env.
// This is required because Vite plugins execute during config evaluation,
// not during the client build, so the "define" approach won't work here.
const faviconPath = process.env.VITE_APP_FAVICON_PATH || '/favicon.svg'
const faviconIcoPath = faviconPath.replace('.svg', '.ico')

function faviconPlugin() {
  return {
    name: 'favicon-plugin',
    transformIndexHtml(html: string) {
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
      cssMinify: 'lightningcss',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
    css: {
      transformer: 'lightningcss',
      lightningcss: {
        exclude: Features.LightDark, // https://lightningcss.dev/transpilation.html
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
