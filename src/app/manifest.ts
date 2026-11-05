import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "NeuroBloom",
    short_name: "NeuroBloom",
    description: "Raise Your AI Mind",
    start_url: "/dashboard",
    display: "standalone",
    background_color: "#050510",
    theme_color: "#050510",
    orientation: "portrait",
    icons: [
      {
        src: "/icon.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
