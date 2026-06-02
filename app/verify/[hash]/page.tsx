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

        // Se retornou score > 0, usar direto
        if (res.ok && json.score && json.score > 0) {
          setData(json)
          return
        }

        // Fallback: tentar com entity_id da meta
        const entityId = json.meta?.entity_id
        if (entityId) {
          const retryRes = await fetch(
            `/api/verify/${h}?entity_id=${entityId}&entity_type=event`,
            { cache: "no-store", headers: { Accept: "application/json" } }
          )
          if (!cancelled) {
            const retryJson = (await retryRes.json()) as VerifyResponse
            if (retryJson.score && retryJson.score > 0) {
              setData(retryJson)
              return
            }
          }
        }

        // Fallback 2: buscar entity_id via /api/public/verify não disponível,
        // tentar via certifications endpoint
        try {
          const certRes = await fetch(`/api/verify/${h}?resolve=1`, {
            cache: "no-store",
            headers: { Accept: "application/json" }
          })
          if (!cancelled) {
            const certJson = (await certRes.json()) as VerifyResponse
            const resolvedEntityId = certJson.meta?.entity_id
            if (resolvedEntityId && resolvedEntityId !== entityId) {
              const retryRes2 = await fetch(
                `/api/verify/${h}?entity_id=${resolvedEntityId}&entity_type=event`,
                { cache: "no-store", headers: { Accept: "application/json" } }
              )
              if (!cancelled) {
                const retryJson2 = (await retryRes2.json()) as VerifyResponse
                if (retryJson2.score && retryJson2.score > 0) {
                  setData(retryJson2)
                  return
                }
              }
            }
          }
        } catch {}

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
