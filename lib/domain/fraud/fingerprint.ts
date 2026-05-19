// /lib/domain/fraud/fingerprint.ts

export function extractFingerprint(data: any) {
  return {
    ip: data.ip || "unknown",
    device: data.userAgent || "unknown"
  }
}