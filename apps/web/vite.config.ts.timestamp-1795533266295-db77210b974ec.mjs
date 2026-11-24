// vite.config.ts
import { sveltekit } from "file:///Users/lucaclaessens/Documents/Development/Memento/node_modules/.pnpm/@sveltejs+kit@2.70.4_@sveltejs+vite-plugin-svelte@4.0.4_svelte@5.59.1_@typescript-eslint+type_puplxv5rksxddz2kcpujome7da/node_modules/@sveltejs/kit/src/exports/vite/index.js";
import { defineConfig } from "file:///Users/lucaclaessens/Documents/Development/Memento/node_modules/.pnpm/vite@5.4.21_@types+node@22.20.5_terser@5.51.4/node_modules/vite/dist/node/index.js";
import { VitePWA } from "file:///Users/lucaclaessens/Documents/Development/Memento/node_modules/.pnpm/vite-plugin-pwa@0.21.2_vite@5.4.21_@types+node@22.20.5_terser@5.51.4__workbox-build@7.4.1_workbox-window@7.4.1/node_modules/vite-plugin-pwa/dist/index.js";
var vite_config_default = defineConfig({
  plugins: [
    sveltekit(),
    VitePWA({
      registerType: "autoUpdate",
      manifest: {
        name: "Memento",
        short_name: "Memento",
        description: "Personal support tool",
        theme_color: "#6750A4",
        background_color: "#FFFBFE",
        display: "standalone",
        start_url: "/",
        icons: [
          { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
          { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
        ]
      }
    })
  ]
});
export {
  vite_config_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9kaXJuYW1lID0gXCIvVXNlcnMvbHVjYWNsYWVzc2Vucy9Eb2N1bWVudHMvRGV2ZWxvcG1lbnQvTWVtZW50by9hcHBzL3dlYlwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL1VzZXJzL2x1Y2FjbGFlc3NlbnMvRG9jdW1lbnRzL0RldmVsb3BtZW50L01lbWVudG8vYXBwcy93ZWIvdml0ZS5jb25maWcudHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL1VzZXJzL2x1Y2FjbGFlc3NlbnMvRG9jdW1lbnRzL0RldmVsb3BtZW50L01lbWVudG8vYXBwcy93ZWIvdml0ZS5jb25maWcudHNcIjtpbXBvcnQgeyBzdmVsdGVraXQgfSBmcm9tIFwiQHN2ZWx0ZWpzL2tpdC92aXRlXCI7XG5pbXBvcnQgeyBkZWZpbmVDb25maWcgfSBmcm9tIFwidml0ZVwiO1xuaW1wb3J0IHsgVml0ZVBXQSB9IGZyb20gXCJ2aXRlLXBsdWdpbi1wd2FcIjtcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgcGx1Z2luczogW1xuICAgIHN2ZWx0ZWtpdCgpLFxuICAgIFZpdGVQV0Eoe1xuICAgICAgcmVnaXN0ZXJUeXBlOiBcImF1dG9VcGRhdGVcIixcbiAgICAgIG1hbmlmZXN0OiB7XG4gICAgICAgIG5hbWU6IFwiTWVtZW50b1wiLFxuICAgICAgICBzaG9ydF9uYW1lOiBcIk1lbWVudG9cIixcbiAgICAgICAgZGVzY3JpcHRpb246IFwiUGVyc29uYWwgc3VwcG9ydCB0b29sXCIsXG4gICAgICAgIHRoZW1lX2NvbG9yOiBcIiM2NzUwQTRcIixcbiAgICAgICAgYmFja2dyb3VuZF9jb2xvcjogXCIjRkZGQkZFXCIsXG4gICAgICAgIGRpc3BsYXk6IFwic3RhbmRhbG9uZVwiLFxuICAgICAgICBzdGFydF91cmw6IFwiL1wiLFxuICAgICAgICBpY29uczogW1xuICAgICAgICAgIHsgc3JjOiBcIi9pY29ucy9pY29uLTE5Mi5wbmdcIiwgc2l6ZXM6IFwiMTkyeDE5MlwiLCB0eXBlOiBcImltYWdlL3BuZ1wiIH0sXG4gICAgICAgICAgeyBzcmM6IFwiL2ljb25zL2ljb24tNTEyLnBuZ1wiLCBzaXplczogXCI1MTJ4NTEyXCIsIHR5cGU6IFwiaW1hZ2UvcG5nXCIgfSxcbiAgICAgICAgXSxcbiAgICAgIH0sXG4gICAgfSksXG4gIF0sXG59KTtcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBbVcsU0FBUyxpQkFBaUI7QUFDN1gsU0FBUyxvQkFBb0I7QUFDN0IsU0FBUyxlQUFlO0FBRXhCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLFNBQVM7QUFBQSxJQUNQLFVBQVU7QUFBQSxJQUNWLFFBQVE7QUFBQSxNQUNOLGNBQWM7QUFBQSxNQUNkLFVBQVU7QUFBQSxRQUNSLE1BQU07QUFBQSxRQUNOLFlBQVk7QUFBQSxRQUNaLGFBQWE7QUFBQSxRQUNiLGFBQWE7QUFBQSxRQUNiLGtCQUFrQjtBQUFBLFFBQ2xCLFNBQVM7QUFBQSxRQUNULFdBQVc7QUFBQSxRQUNYLE9BQU87QUFBQSxVQUNMLEVBQUUsS0FBSyx1QkFBdUIsT0FBTyxXQUFXLE1BQU0sWUFBWTtBQUFBLFVBQ2xFLEVBQUUsS0FBSyx1QkFBdUIsT0FBTyxXQUFXLE1BQU0sWUFBWTtBQUFBLFFBQ3BFO0FBQUEsTUFDRjtBQUFBLElBQ0YsQ0FBQztBQUFBLEVBQ0g7QUFDRixDQUFDOyIsCiAgIm5hbWVzIjogW10KfQo=
