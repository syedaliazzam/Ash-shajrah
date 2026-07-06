import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ash-Shajrah Learning Hub",
    short_name: "Ash-Shajrah",
    description:
      "Online early years learning rooted in values, character and leadership.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFF8EA",
    theme_color: "#064635",
    icons: [
      {
        src: "/ash-shajrah-favicon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/ash-shajrah-favicon.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
