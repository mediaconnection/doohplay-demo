require("dotenv").config()

const fs = require("fs")
const path = require("path")
const forge = require("node-forge")

/* =========================
   ENV
========================= */

const pfxPath = process.env.A1_PFX_PATH
const pfxPassword = process.env.A1_PFX_PASSWORD

if (!pfxPath) {
  console.error("❌ A1_PFX_PATH não definido")
  process.exit(1)
}

// senha pode ser string vazia em alguns PFX
if (pfxPassword === undefined) {
  console.error("❌ A1_PFX_PASSWORD não definido")
  process.exit(1)
}

const resolvedPath = path.resolve(pfxPath)

/* =========================
   HELPERS
========================= */

function fail(message, error) {
  console.error(message)

  if (error) {
    if (error instanceof Error) {
      console.error(error.message)
    } else {
      console.error(String(error))
    }
  }

  process.exit(1)
}

function dnToString(dn) {
  if (!dn || !Array.isArray(dn.attributes)) return "—"

  return dn.attributes
    .map((attr) => {
      const key = attr.shortName || attr.name || attr.type || "attr"
      return `${key}=${attr.value}`
    })
    .join(", ")
}

function formatSerial(serialHex) {
  if (typeof serialHex !== "string" || !serialHex.trim()) return "—"

  return serialHex
    .toUpperCase()
    .match(/.{1,2}/g)
    ?.join(":") ?? serialHex.toUpperCase()
}

function sha256FingerprintFromAsn1(asn1Obj) {
  const derBytes = forge.asn1.toDer(asn1Obj).getBytes()
  const md = forge.md.sha256.create()
  md.update(derBytes)
  const hex = md.digest().toHex().toUpperCase()

  return hex.match(/.{1,2}/g)?.join(":") ?? hex
}

function daysUntil(date) {
  if (!(date instanceof Date) || Number.isNaN(date.getTime())) return null

  const diffMs = date.getTime() - Date.now()
  return Math.floor(diffMs / (1000 * 60 * 60 * 24))
}

function normalizeError(err) {
  if (err instanceof Error) return err
  return new Error(String(err))
}

function getBagsSafe(p12, bagType) {
  const bags = p12.getBags({ bagType })
  return bags?.[bagType] ?? []
}

function getBagAttribute(bag, attributeName) {
  const attrs = bag?.attributes?.[attributeName]
  return Array.isArray(attrs) && attrs.length > 0 ? attrs[0] : null
}

function findMatchingCertificate(certBags, keyBags) {
  if (!Array.isArray(certBags) || certBags.length === 0) return null
  if (!Array.isArray(keyBags) || keyBags.length === 0) return certBags[0]

  const keyLocalKeyIds = new Set(
    keyBags
      .map((bag) => getBagAttribute(bag, "localKeyId"))
      .filter(Boolean)
      .map((value) =>
        typeof value === "string" ? value : forge.util.bytesToHex(value)
      )
  )

  const matched = certBags.find((bag) => {
    const localKeyId = getBagAttribute(bag, "localKeyId")
    const normalized =
      typeof localKeyId === "string"
        ? localKeyId
        : localKeyId
          ? forge.util.bytesToHex(localKeyId)
          : null

    return normalized && keyLocalKeyIds.has(normalized)
  })

  return matched ?? certBags[0]
}

/* =========================
   EXECUTION
========================= */

console.log("📄 Lendo certificado A1 em:", resolvedPath)

if (!fs.existsSync(resolvedPath)) {
  fail("❌ Arquivo do certificado não encontrado")
}

try {
  const pfxBuffer = fs.readFileSync(resolvedPath)

  if (!Buffer.isBuffer(pfxBuffer) || pfxBuffer.length === 0) {
    throw new Error("Arquivo PFX vazio ou inválido")
  }

  const p12Der = forge.util.createBuffer(pfxBuffer.toString("binary"))
  const p12Asn1 = forge.asn1.fromDer(p12Der)
  const p12 = forge.pkcs12.pkcs12FromAsn1(p12Asn1, false, pfxPassword)

  const certBags = getBagsSafe(p12, forge.pki.oids.certBag)
  const keyBags = [
    ...getBagsSafe(p12, forge.pki.oids.pkcs8ShroudedKeyBag),
    ...getBagsSafe(p12, forge.pki.oids.keyBag),
  ]

  if (certBags.length === 0) {
    throw new Error("Nenhum certificado encontrado dentro do PFX")
  }

  if (keyBags.length === 0) {
    throw new Error("Nenhuma chave privada encontrada dentro do PFX")
  }

  const selectedCertBag = findMatchingCertificate(certBags, keyBags)
  const cert = selectedCertBag?.cert ?? null

  if (!cert) {
    throw new Error("Certificado principal não encontrado dentro do PFX")
  }

  const fingerprint = sha256FingerprintFromAsn1(
    forge.pki.certificateToAsn1(cert)
  )
  const remainingDays = daysUntil(cert.validity.notAfter)

  console.log("✅ CERTIFICADO A1 CARREGADO COM SUCESSO")
  console.log("🏛️ Emissor:", dnToString(cert.issuer))
  console.log("👤 Titular:", dnToString(cert.subject))
  console.log("🔢 Serial:", formatSerial(cert.serialNumber))
  console.log("🔐 Fingerprint SHA-256:", fingerprint)
  console.log("📆 Válido de:", cert.validity.notBefore.toISOString())
  console.log("⏳ Válido até:", cert.validity.notAfter.toISOString())
  console.log(
    "🗓️ Dias restantes:",
    remainingDays !== null ? remainingDays : "—"
  )
  console.log("🔑 Chave privada encontrada:", keyBags.length > 0 ? "sim" : "não")
  console.log("🔐 Pronto para assinatura ICP-Brasil")
} catch (err) {
  const error = normalizeError(err)
  fail("❌ ERRO AO LER CERTIFICADO A1", error)
}