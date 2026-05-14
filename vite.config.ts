import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import standaloner from 'standaloner/vite'
import vike from 'vike/plugin'
import vikeSolid from 'vike-solid/vite'
import type { Plugin, UserConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

const minify = true

const build = {
  target: 'esnext',
  outDir: '../dist',
  minify,
  emptyOutDir: true
}

export default {
  root: 'src',
  cacheDir: '../.vite',
  plugins: [
    standaloner({
      bundle: {
        isolated: true,
        input: {
          index: '../dist/server/entrypoint.mjs'
        }
      },
      minify
    }),
    tailwindcss(),
    vike(),
    vikeSolid(),
    ...((process.env.NODE_ENV !== 'production' || process.env.ENTRY_NODE === 'true')
      // - Development → run vike dev
      // - Preview deployment + Docker → run build:node-entry and then run preview or run node dist/server/entry.mjs
      ? []
      // - Vercel
      : [{
        name: 'emit-server-entrypoint',
        apply: 'build',
        config() {
          return {
            environments: {
              ssr: {
                resolve: {
                  noExternal: true
                },
                build: {
                  rollupOptions: {
                    input: {
                      entrypoint: '/server/entrypoint.ts'
                    }
                  },
                  minify
                }
              }
            }
          }
        }
      } as Plugin])
  ],
  server: {
    // host: '127.0.0.1',
    port: 3000,
    cors: false
  },
  // preview: {
  //   port: 3000
  // },
  build,
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, 'src')
    }
  }
} satisfies UserConfig
