-- Fase 9 · Correção — institutional_media.type tinha uma CHECK constraint
-- (só 'image'/'video') que eu não sabia que existia, já que a tabela nunca
-- foi CREATE'd nesta sessão, só ALTER'd. Sem isso, tentar salvar um item
-- 'layout' ou 'youtube' quebra com "violates check constraint".
--
-- Sem bloco DO $$ — editor SQL do Supabase já causou problema com isso
-- antes nesta sessão (Fase 1). Nome da constraint veio direto na mensagem
-- de erro, então dá pra ser direto.

ALTER TABLE institutional_media DROP CONSTRAINT IF EXISTS institutional_media_type_check;

ALTER TABLE institutional_media
  ADD CONSTRAINT institutional_media_type_check
  CHECK (type IN ('image', 'video', 'layout', 'youtube'));
