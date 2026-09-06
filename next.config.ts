import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    middlewareClientMaxBodySize: "32mb",
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        ...config.watchOptions,
        ignored: [
          "**/node_modules/**",
          "**/.git/**",
          "**/uploads/**",
          "**/*.db",
          "**/*.db-*",
          "**/*.db-journal",
          "**/*.db-wal",
          "**/*.db-shm",
        ],
      };
    }
    return config;
  },
};

export default nextConfig;
