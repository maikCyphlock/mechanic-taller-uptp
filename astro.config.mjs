// @ts-check
import { defineConfig } from 'astro/config';
import PoweredWebAppBuilder from "webapp-astro-pwa/pwa";
import svelte from "@astrojs/svelte";
import node from '@astrojs/node'
import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
    output: 'server',
    integrations: [
        PoweredWebAppBuilder({}), 
        svelte()
        ],
    adapter: node({
     mode: 'standalone',

    }),
    server:{
        //@ts-ignore
        port: process.env.port ,
        host: "0.0.0.0"
    },
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