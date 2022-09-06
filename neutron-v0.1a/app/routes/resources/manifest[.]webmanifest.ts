import { json } from "@remix-run/node";
import type { LoaderFunction } from "@remix-run/node";

export let loader: LoaderFunction = () => {
  return json(
    {
      short_name: "Neutron",
      name: "Neutron v0.1a",
      start_url: "/",
      display: "standalone",
      background_color: "#fff",
      description:'Neutron helps safeguard your transactions online with on-the-fly escrow agreements',
      theme_color: "#c34138",
      shortcuts: [
        {
          name: "Homepage",
          url: "/",
          icons: [
            {
              src: "/icons/android-chrome-192x192.png",
              sizes: "192x192",
              type: "image/png",
              purpose: "any monochrome",
            },
          ],
        },
      ],
      icons: [
        {
          src: "/icons/android-chrome-192x192.png",
          sizes: "192x192",
          type: "image/png",
          density: "4.0",
        },
        {
          src: "/icons/android-chrome-512x512.png",
          sizes: "512x512",
          type: "image/png",
          density: "5.0",
        },
      ],
    },
    {
      headers: {
        "Cache-Control": "public, max-age=600",
        "Content-Type": "application/manifest+json",
      },
    },
  );
};
