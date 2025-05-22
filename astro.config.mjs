// @ts-check
import { defineConfig } from 'astro/config';
import PoweredWebAppBuilder from "webapp-astro-pwa/pwa";
import svelte from "@astrojs/svelte";
import node from '@astrojs/node'
// https://astro.build/config
export default defineConfig({
    output:'server',
    integrations: [// new code added
    PoweredWebAppBuilder({}), svelte()],
    adapter: node({
		mode: 'standalone',
	}),


  vite:{
    server:{
      cors: {
        origin: "maikol.com"
      },
      allowedHosts:["maikol.com"]
    }
  }
});