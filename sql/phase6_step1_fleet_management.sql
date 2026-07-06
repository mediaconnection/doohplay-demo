-- Fase 6 · Gestão de frota em escala
-- Nomenclatura própria (fleet_*) pra não confundir com group_id/group_position
-- que já existe em client_screens (isso é pra vídeo-wall sincronizado —
-- uma tela dividida em N aparelhos — conceito diferente e não relacionado).

-- Tags livres por tela (ex: "SP", "franquia-x", "hardware-v2", "piloto")
ALTER TABLE client_screens
  ADD COLUMN IF NOT EXISTS tags TEXT[] NOT NULL DEFAULT '{}';

-- Grupos administrativos — pra ação em massa (aplicar layout, ver saúde)
-- em várias telas de clientes diferentes de uma vez
CREATE TABLE IF NOT EXISTS fleet_groups (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fleet_group_members (
  fleet_group_id  UUID NOT NULL REFERENCES fleet_groups(id) ON DELETE CASCADE,
  screen_id       UUID NOT NULL REFERENCES client_screens(id) ON DELETE CASCADE,
  added_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (fleet_group_id, screen_id)
);
CREATE INDEX IF NOT EXISTS idx_fleet_group_members_screen ON fleet_group_members (screen_id);
