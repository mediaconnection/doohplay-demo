import { defineConfig } from "vitest/config"
import path from "path"

// Replica EXATAMENTE os aliases de next.config.ts (config.resolve.alias)
// -- não confiar no tsconfig.json sozinho, que sugere "@/*" -> "./*"/
// "./src/*" de forma ambígua. Ver CLAUDE.md, seção "Path Aliases".
export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["**/*.test.ts", "**/*.test.tsx"],
    exclude: ["node_modules/**", ".next/**", "app/player/dtv/**"],
  },
  resolve: {
    alias: {
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
      "@proof-engine": path.resolve(__dirname, "packages/proof-engine"),
      "@": path.resolve(__dirname, "."),
    },
  },
})
