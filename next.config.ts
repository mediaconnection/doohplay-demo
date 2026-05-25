import type { NextConfig } from "next"
import path from "path"

const nextConfig: NextConfig = {
  output: "standalone",
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    cpus: 1,
  },
  webpack(config, { dev }) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@/lib": path.resolve(__dirname, "lib"),
      "@/components/block": path.resolve(__dirname, "components/block"),
      "@/components/explorer": path.resolve(__dirname, "components/explorer"),
      "@/components/ledger": path.resolve(__dirname, "components/ledger"),
      "@/components/merkle": path.resolve(__dirname, "components/merkle"),
      "@/components/netwok": path.resolve(__dirname, "components/netwok"),
      "@/components/network": path.resolve(__dirname, "components/network"),
      "@/components/proof": path.resolve(__dirname, "components/proof"),
      "@/components/trust": path.resolve(__dirname, "components/trust"),
      "@/components/ui": path.resolve(__dirname, "components/ui"),
      "@/components": path.resolve(__dirname, "src/components"),
      "@/core": path.resolve(__dirname, "core"),
      "@/services": path.resolve(__dirname, "src/services"),
      "@/reports": path.resolve(__dirname, "reports"),
      "@/hooks": path.resolve(__dirname, "hooks"),
      "@/supabase": path.resolve(__dirname, "supabase"),
      "@/types": path.resolve(__dirname, "types"),
      "@/workers": path.resolve(__dirname, "workers"),
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