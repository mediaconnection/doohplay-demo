import fs from "fs"
import path from "path"

function readCert(filePath: string): string {
  try {
    return fs.readFileSync(filePath, "utf-8")
  } catch (err) {
    console.warn("Cert not found:", filePath)
    return ""
  }
}

export function loadIcpCerts() {

  const base = path.join(process.cwd(), "lib/certs/icp")

  const roots = [
    readCert(path.join(base, "roots/ac_raiz_icp_brasil.pem"))
  ].filter(Boolean)

  const intermediates = [
    readCert(path.join(base, "intermediates/ac_serasa.pem")),
    readCert(path.join(base, "intermediates/ac_valid.pem")),
    readCert(path.join(base, "intermediates/ac_safeweb.pem")),
  ].filter(Boolean)

  return {
    roots,
    intermediates,
    all: [...roots, ...intermediates]
  }
}