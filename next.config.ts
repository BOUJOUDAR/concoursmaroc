import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React Strict Mode
  reactStrictMode: true,

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },

  // Headers for security and caching
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "origin-when-cross-origin" },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          { key: "Cache-Control", value: "no-store, max-age=0" },
        ],
      },
    ];
  },

  // Redirects
  async redirects() {
    return [
      {
        source: "/concours",
        destination: "/ar/concours",
        permanent: true,
      },
      {
        source: "/bibliotheque",
        destination: "/ar/bibliotheque",
        permanent: true,
      },
      {
        source: "/blog",
        destination: "/ar/blog",
        permanent: true,
      },
      {
        source: "/annales",
        destination: "/ar/annales",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
