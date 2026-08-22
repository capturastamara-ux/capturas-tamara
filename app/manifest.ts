import type { MetadataRoute } from "next";
import { faviconConfig } from "@/config/favicon";
import { siteConfig } from "@/config/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteConfig.name,
    short_name: "J Montoya",
    description: siteConfig.description,
    start_url: "/",
    display: "standalone",
    background_color: siteConfig.pwa.backgroundColor,
    theme_color: siteConfig.pwa.themeColor,
    icons: [
      {
        src: faviconConfig.android192,
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: faviconConfig.android512,
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
