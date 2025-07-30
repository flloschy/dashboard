import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'
import { viteSingleFile } from 'vite-plugin-singlefile';
// https://vite.dev/config/
export default defineConfig(({command}) => ({
  plugins: [
    svelte(),
    command == "build" && viteSingleFile({
        removeViteModuleLoader: true
    })
  ],
  build: {
    minify: true,
    cssMinify: true
  },
}))
