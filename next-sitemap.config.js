/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_APP_URL || "https://concoursmaroc.ma",
  generateRobotsTxt: true,
  sitemapSize: 5000,
  exclude: ["/admin", "/api/*"],
  robotsTxtOptions: {
    additionalSitemaps: [],
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api/"],
      },
    ],
  },
  transform: async (config, path) => {
    // Custom priority and changefreq based on path
    let priority = 0.7;
    let changefreq = "weekly";

    if (path === "/" || path === "/ar" || path === "/fr") {
      priority = 1.0;
      changefreq = "daily";
    } else if (path.includes("/concours/")) {
      priority = 0.9;
      changefreq = "weekly";
    } else if (path.includes("/bibliotheque/") || path.includes("/annales/")) {
      priority = 0.7;
      changefreq = "monthly";
    } else if (path.includes("/blog/")) {
      priority = 0.6;
      changefreq = "weekly";
    } else if (path.includes("/categories/")) {
      priority = 0.8;
      changefreq = "monthly";
    }

    return {
      loc: path,
      changefreq,
      priority,
      lastmod: new Date().toISOString(),
    };
  },
};
