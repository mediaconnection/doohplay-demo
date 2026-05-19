// /lib/ui/copy.ts

/* =========================
   TYPES
========================= */

type CopyResult = {
  success: boolean
  error?: string
}

/* =========================
   CORE FUNCTION
========================= */

/**
 * Copia texto para o clipboard (com fallback)
 */
export async function copyToClipboard(text: string): Promise<CopyResult> {
  try {
    if (!text || typeof text !== "string") {
      return {
        success: false,
        error: "Invalid text"
      }
    }

    /* =========================
       MODERN API
    ========================= */

    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(text)

      return { success: true }
    }

    /* =========================
       FALLBACK (LEGACY)
    ========================= */

    if (typeof document !== "undefined") {
      const textarea = document.createElement("textarea")

      textarea.value = text
      textarea.style.position = "fixed"
      textarea.style.opacity = "0"

      document.body.appendChild(textarea)

      textarea.focus()
      textarea.select()

      const success = document.execCommand("copy")

      document.body.removeChild(textarea)

      return { success }
    }

    return {
      success: false,
      error: "Clipboard not supported"
    }

  } catch (err: any) {
    return {
      success: false,
      error: err?.message || "Copy failed"
    }
  }
}

/* =========================
   HELPER (WITH TOAST)
========================= */

/**
 * Versão com feedback automático (opcional)
 */
export async function copyWithFeedback(
  text: string,
  options?: {
    successMessage?: string
    errorMessage?: string
    onSuccess?: () => void
    onError?: (error?: string) => void
  }
) {
  const result = await copyToClipboard(text)

  if (result.success) {
    options?.onSuccess?.()
  } else {
    options?.onError?.(result.error)
  }

  return result
}