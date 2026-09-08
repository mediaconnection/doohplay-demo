// app/admin/media/[id]/route.ts
//
// Achado 2026-09-08: esta rota (`/admin/media/{id}`, sem prefixo `/api`)
// não tem nenhum consumidor real -- a UI do admin (`app/admin/page.tsx`)
// sempre chamou `/api/admin/media/{id}`. As duas tinham lógica própria
// duplicada e já haviam divergido de verdade (esta tinha um fix de
// fallback de telefone que a outra não tinha; a outra tinha tags/
// display_format/sincronização com creative_assets_v2/placements_v2 que
// esta nunca recebeu). Colapsada numa única implementação -- o caminho
// sancionado é `app/api/admin/media/[id]/route.ts`; esta rota permanece
// só por retrocompatibilidade caso algo externo ainda a chame.
export { PATCH } from "../../../api/admin/media/[id]/route"
