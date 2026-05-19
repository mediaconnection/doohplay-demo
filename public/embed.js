/* =========================
   DOOHPLAY EMBED SCRIPT v1
========================= */

(function () {

  try {

    /* =========================
       HELPERS
    ========================= */

    function isValidHash(hash) {
      return /^[a-f0-9]{64}$/i.test(hash)
    }

    function fetchWithTimeout(url, timeout = 4000) {
      return Promise.race([
        fetch(url),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), timeout)
        )
      ])
    }

    function renderBadge(container, baseUrl, hash, valid) {

      const badge = document.createElement("a")

      badge.href = `${baseUrl}/proof/${hash}?ref=embed`
      badge.target = "_blank"
      badge.rel = "noopener noreferrer"

      badge.style.display = "inline-flex"
      badge.style.alignItems = "center"
      badge.style.gap = "6px"
      badge.style.padding = "6px 10px"
      badge.style.borderRadius = "6px"
      badge.style.fontSize = "12px"
      badge.style.textDecoration = "none"
      badge.style.fontWeight = "500"
      badge.style.border = "1px solid"

      if (valid) {
        badge.style.background = "#e6fffa"
        badge.style.color = "#007f5f"
        badge.style.borderColor = "#b2f5ea"
        badge.innerText = "✔ Verified by DOOHPLAY"
      } else {
        badge.style.background = "#ffe6e6"
        badge.style.color = "#a80000"
        badge.style.borderColor = "#ffc1c1"
        badge.innerText = "✖ Not verified"
      }

      container.replaceChildren(badge)
    }

    function renderError(container, message) {
      const errorBadge = document.createElement("div")

      errorBadge.style.background = "#f5f5f5"
      errorBadge.style.color = "#555"
      errorBadge.style.padding = "6px 10px"
      errorBadge.style.borderRadius = "6px"
      errorBadge.style.fontSize = "12px"

      errorBadge.innerText = message || "⚠ Unable to verify"

      container.replaceChildren(errorBadge)
    }

    /* =========================
       FIND SCRIPTS
    ========================= */

    const scripts = document.querySelectorAll("script[data-hash]")

    scripts.forEach((script) => {

      // evita rodar duas vezes no mesmo elemento
      if (script.dataset.loaded) return
      script.dataset.loaded = "true"

      const hash = script.getAttribute("data-hash")

      if (!hash || !isValidHash(hash)) {
        console.warn("Invalid hash:", hash)
        return
      }

      /* =========================
         BASE URL
      ========================= */

      let baseUrl

      try {
        baseUrl = script.src
          ? new URL(script.src).origin
          : window.location.origin
      } catch {
        baseUrl = window.location.origin
      }

      /* =========================
         CONTAINER
      ========================= */

      if (!script.parentNode) return

      const container = document.createElement("div")
      container.style.display = "inline-block"
      container.style.fontFamily = "Arial, sans-serif"

      container.innerText = "Verifying proof..."

      script.parentNode.insertBefore(container, script)

      /* =========================
         CACHE
      ========================= */

      const cacheKey = `doohplay:${hash}`

      try {
        const cached = localStorage.getItem(cacheKey)

        if (cached) {
          const data = JSON.parse(cached)
          renderBadge(container, baseUrl, hash, data.valid)
          return
        }
      } catch {}

      /* =========================
         FETCH
      ========================= */

      fetchWithTimeout(`${baseUrl}/api/proof/${hash}/status`)
        .then((res) => {
          if (!res.ok) throw new Error("request_failed")
          return res.json()
        })
        .then((data) => {

          renderBadge(container, baseUrl, hash, data.valid)

          try {
            localStorage.setItem(cacheKey, JSON.stringify(data))
          } catch {}

        })
        .catch((err) => {

          if (err.message === "timeout") {
            renderError(container, "⚠ Timeout verifying proof")
          } else {
            renderError(container, "⚠ Unable to verify")
          }

        })

    })

  } catch (err) {
    console.error("DOOHPLAY_EMBED_ERROR:", err)
  }

})()