// lib/mp4-probe.ts
//
// Leitor mínimo do formato MP4 (ISO Base Media File Format) pra extrair
// resolução e duração sem depender de ffmpeg (incerto se está disponível
// no ambiente do Render) nem de nenhuma lib externa.
//
// Não cobre todos os casos possíveis (ex: mvhd/tkhd versão 1 de 64 bits,
// containers não padrão) — nesses casos retorna null e o upload NÃO bloqueia
// (preferimos deixar passar um vídeo que não conseguimos analisar do que
// bloquear um upload legítimo por engano).

export interface Mp4Info {
  width: number
  height: number
  durationSec: number
}

// Tipos de box que são "containers" (têm boxes filhos dentro, não dados crus)
const CONTAINER_TYPES = new Set(["moov", "trak", "mdia", "minf", "stbl", "edts", "udta"])

function readBoxes(buf: Buffer, start: number, end: number): { type: string; start: number; end: number }[] {
  const boxes: { type: string; start: number; end: number }[] = []
  let offset = start
  while (offset + 8 <= end) {
    const size = buf.readUInt32BE(offset)
    const type = buf.toString("ascii", offset + 4, offset + 8)
    if (size < 8) break // box inválido, evita loop infinito
    const boxEnd = size === 0 ? end : Math.min(offset + size, end)
    boxes.push({ type, start: offset + 8, end: boxEnd })
    offset = boxEnd
  }
  return boxes
}

function findBox(buf: Buffer, start: number, end: number, type: string): { start: number; end: number } | null {
  for (const box of readBoxes(buf, start, end)) {
    if (box.type === type) return box
  }
  return null
}

function findBoxRecursive(buf: Buffer, start: number, end: number, type: string): { start: number; end: number } | null {
  for (const box of readBoxes(buf, start, end)) {
    if (box.type === type) return box
    if (CONTAINER_TYPES.has(box.type)) {
      const found = findBoxRecursive(buf, box.start, box.end, type)
      if (found) return found
    }
  }
  return null
}

export function probeMp4(buf: Buffer): Mp4Info | null {
  try {
    const moov = findBox(buf, 0, buf.length, "moov")
    if (!moov) return null

    // ── duração (mvhd) ──
    const mvhd = findBox(buf, moov.start, moov.end, "mvhd")
    if (!mvhd) return null
    const version = buf.readUInt8(mvhd.start)
    if (version !== 0) return null // não cobre versão 1 (64 bits) — não bloqueia
    const timescale = buf.readUInt32BE(mvhd.start + 12)
    const duration = buf.readUInt32BE(mvhd.start + 16)
    if (!timescale || !duration) return null
    const durationSec = duration / timescale

    // ── resolução (tkhd do primeiro trak de vídeo encontrado) ──
    const trak = findBoxRecursive(buf, moov.start, moov.end, "trak")
    if (!trak) return null
    const tkhd = findBox(buf, trak.start, trak.end, "tkhd")
    if (!tkhd) return null
    const tkhdVersion = buf.readUInt8(tkhd.start)
    if (tkhdVersion !== 0) return null
    // version 0: 4 (version+flags) + 20 + 8 + 4 + 4 + 36 = 76 bytes antes de width/height
    const widthOffset = tkhd.start + 76
    const width = buf.readUInt32BE(widthOffset) >> 16
    const height = buf.readUInt32BE(widthOffset + 4) >> 16
    if (!width || !height) return null

    return { width, height, durationSec }
  } catch {
    return null // qualquer erro de parsing — não bloqueia o upload
  }
}
