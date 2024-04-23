import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Atom",
    short_name: "Atom",
    description: "Social media hobby project",
    start_url: "/",
    display: "standalone",
    theme_color: "#5b8c1f",
    icons: [
      {
        src: "/icon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
