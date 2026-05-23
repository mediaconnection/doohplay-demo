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
      "@/lib": path.resolve(__dirname, "lib"),
      "@/components": path.resolve(__dirname, "src/components"),
      "@/core": path.resolve(__dirname, "src/core"),
      "@/services": path.resolve(__dirname, "src/services"),
      "@": path.resolve(__dirname, "src"),
    }
    if (dev) {
      config.parallelism = 1
      config.cache = false
    }
    return config
  },
}

export default nextConfig