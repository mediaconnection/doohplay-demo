import { loadIcpCerts } from "./loader"

/* =========================
   LOAD CERTS
========================= */

export const icpBrasilCerts = loadIcpCerts()

/* =========================
   EXPORT TYPES
========================= */

export type IcpCertBundle = {
  roots: string[]
  intermediates: string[]
  all: string[]
}