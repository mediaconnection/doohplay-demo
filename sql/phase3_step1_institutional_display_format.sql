-- Fase 3 · Passo 1 — coluna nova em institutional_media
-- Aditivo, com default seguro. Zero impacto no que já existe (tudo continua
-- 'fullscreen', comportamento idêntico ao de hoje).
ALTER TABLE institutional_media
  ADD COLUMN IF NOT EXISTS display_format TEXT NOT NULL DEFAULT 'fullscreen'
    CHECK (display_format IN ('fullscreen', 'shrink_lateral'));
