function normalizeMultilinePem(value: string): string {
  return value.replace(/\\n/g, "\n").trim()
}

export function getOptionalEnv(name: string): string | null {
  const value = process.env[name]
  return value?.trim() ? value.trim() : null
}

export function getRequiredEnv(name: string): string {
  const value = process.env[name]

  if (!value || !value.trim()) {
    throw new Error(`${name}_NOT_CONFIGURED`)
  }

  return value.trim()
}

export function getOptionalPemEnv(name: string): string | null {
  const value = getOptionalEnv(name)
  return value ? normalizeMultilinePem(value) : null
}

export function getRequiredPemEnv(name: string): string {
  return normalizeMultilinePem(getRequiredEnv(name))
}