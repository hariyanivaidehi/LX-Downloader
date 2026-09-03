import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  // Whitelist local network development origins to allow multi-device testing over Wi-Fi
  allowedDevOrigins: ["192.168.1.111", "localhost:3000"],
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "**.cdninstagram.com" },
      { protocol: "https", hostname: "**.fbcdn.net" },
      { protocol: "https", hostname: "**.ytimg.com" },
      { protocol: "https", hostname: "**.ggpht.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async rewrites() {
    const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:8000";
    return [
      {
        source: "/api/py/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
} as any;

export default nextConfig;
