import { ZodSchema } from "zod"

export function safeParse<T>(
  schema: ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data)

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues
        .map(e => `${e.path.join(".")}: ${e.message}`)
        .join(", ")
    }
  }

  return {
    success: true,
    data: result.data
  }
}