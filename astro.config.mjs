import { defineConfig } from 'astro/config';
import PoweredWebAppBuilder from "webapp-astro-pwa/pwa";
import svelte from "@astrojs/svelte";
import node from '@astrojs/node'
import tailwindcss from "@tailwindcss/vite";
import path from 'path';

// https://astro.build/config
export default defineConfig({
    output: 'server',
    integrations: [
        PoweredWebAppBuilder({
            isManifest: true,
            createManifest: true,
            manifestPath: "manifest.json",
            manifest: {
                name: "Taller UPTP",
                short_name: "TallerUPTP",
                description: "Aplicación de gestión para el taller UPTP.",
                start_url: "/",
                display: "standalone",
                theme_color: "#8936FF",
                icons: [
                    {
                        sizes: "512x512",
                        src: "node_modules/webapp-astro-pwa/src/manifest_imgs/icon512x512.png",
                        type: "image/png",
                    },
                    {
                        sizes: "192x192",
                        src: "node_modules/webapp-astro-pwa/src/manifest_imgs/icon192x192.png",
                        type: "image/png",
                    },
                ],
            },
            icons: [
                {
                    rel: "icon",
                    type: "png",
                    sizes: "512x512",
                    href: "/webapp-astro-pwa/src/manifest_imgs/icon512x512.png",
                },
                {
                    rel: "apple-touch-icon",
                    type: "png",
                    sizes: "192x192",
                    href: "/webapp-astro-pwa/src/manifest_imgs/icon512x512.png",
                },
            ],
            meta: [
                {
                    name: "mobile-web-app-capable",
                    content: "yes",
                },
                {
                    name: "apple-mobile-web-app-capable",
                    content: "yes",
                },
                {
                    name: "application-name",
                    content: "Taller UPTP",
                },
                {
                    name: "apple-mobile-web-app-title",
                    content: "Taller UPTP",
                },
                {
                    name: "theme-color",
                    content: "#8936FF",
                },
                {
                    name: "msapplication-navbutton-color",
                    content: "#8936FF",
                },
                {
                    name: "apple-mobile-web-app-status-bar-style",
                    content: "black-translucent",
                },
                {
                    name: "viewport",
                    content: "width=device-width, initial-scale=1, shrink-to-fit=no",
                },
                {
                    name: "msapplication-starturla",
                    content: "/",
                },
            ],
            forceUpdate: true,
            strategy: "NetworkFirst",
        }),
        svelte()
    ],
    adapter: node({
        mode: 'standalone',
    }),
    server: {
        //@ts-ignore
        port: process.env.port,
        host: "0.0.0.0"
    },
    vite: {
        plugins: [tailwindcss()],
        resolve: {
            alias: {
                '@': path.resolve('./src')
            }
        }
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