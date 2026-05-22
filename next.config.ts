config.resolve.alias = {
  ...config.resolve.alias,
  "@": path.resolve(__dirname, "src"),
  "@/lib": path.resolve(__dirname, "lib"),
  "@/components": path.resolve(__dirname, "src/components"),
  "@/core": path.resolve(__dirname, "src/core"),
  "@/services": path.resolve(__dirname, "src/services"),
}