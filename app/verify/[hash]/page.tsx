useEffect(() => {
    const parts = window.location.pathname.split("/")
    const rawHash = parts[parts.length - 1] ?? ""
    const h = normalizeHash(rawHash)

    if (!h || !isValidHash(h)) {
      setFetchError("Formato de hash inválido.")
      setLoading(false)
      return
    }

    setHash(h)
    let cancelled = false

    const doFetch = async () => {
      try {
        const res = await fetch(`/api/verify/${h}`, {
          cache: "no-store",
          headers: { Accept: "application/json" }
        })

        if (cancelled) return

        if (res.status === 404) {
          setIsNotFound(true)
          return
        }

        const json = (await res.json()) as VerifyResponse

        if (res.ok && typeof json.score === "number" && json.score > 0) {
          setData(json)
          return
        }

        const entityId = json.meta?.entity_id
        if (entityId) {
          try {
            const retryRes = await fetch(
              `/api/verify/${h}?entity_id=${entityId}&entity_type=event`,
              { cache: "no-store", headers: { Accept: "application/json" } }
            )
            if (!cancelled) {
              const retryJson = (await retryRes.json()) as VerifyResponse
              if (typeof retryJson.score === "number" && retryJson.score > 0) {
                setData(retryJson)
                return
              }
            }
          } catch {}
        }

        if (!res.ok || json.error === "PROOF_NOT_FOUND") {
          if (json.error === "PROOF_NOT_FOUND") {
            setIsNotFound(true)
            return
          }
          setFetchError(json.message || json.error || "Erro ao consultar a verificação.")
          return
        }

        setData(json)
      } catch {
        if (!cancelled) setFetchError("Erro ao consultar a verificação.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    doFetch()
    return () => { cancelled = true }
  }, [])
