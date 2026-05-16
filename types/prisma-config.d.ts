declare module "prisma/config" {
  export function defineConfig(config: { schema?: string; [key: string]: unknown }): unknown
}
