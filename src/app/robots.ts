import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/perfil/", "/api/", "/admin/", "/i/", "/verificar/", "/recuperar/"],
      },
    ],
    sitemap: "https://mipropina.es/sitemap.xml",
  };
}
