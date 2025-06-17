// @ts-check
import { defineConfig } from 'astro/config';
import PoweredWebAppBuilder from "webapp-astro-pwa/pwa";
import svelte from "@astrojs/svelte";
import node from '@astrojs/node'
import tailwindcss from "@tailwindcss/vite";

import vercel from "@astrojs/vercel";

import netlify from "@astrojs/netlify";

// https://astro.build/config
export default defineConfig({
    output: 'server',
    integrations: [
        PoweredWebAppBuilder({}), 
        svelte()
        ],
    adapter: netlify(),
    vite:{
        plugins:[tailwindcss()]
    },


  // vite:{
  //   server:{
  //     cors: {
  //       origin: "maikol.com"
  //     },
  //     allowedHosts:["maikol.com"]
  //   }
  // }
});