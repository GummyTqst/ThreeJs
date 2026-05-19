import wasm from 'vite-plugin-wasm'
import topLevelAwait from 'vite-plugin-top-level-await'

export default {
  publicDir: '../static/',
  server: { host: true, open: true },
  build: { 
    outDir: 'dist', 
    emptyOutDir: true 
  },
  plugins: [ wasm(), topLevelAwait() ]
}