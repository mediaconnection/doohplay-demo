import type { NextConfig } from "next"
import path from "path"

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  experimental: {
    cpus: 1,
  },
  webpack(config, { dev }) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname),
      "@/src": path.resolve(__dirname, "src"),
    }
    if (dev) {
      config.parallelism = 1
      config.cache = false
    }
    return config
  },
}

export default nextConfig