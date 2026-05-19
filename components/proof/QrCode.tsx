"use client"

import QRCode from "qrcode"
import { useEffect, useState } from "react"

export default function QrCode({ value }: { value: string }) {
  const [src, setSrc] = useState("")

  useEffect(() => {
    QRCode.toDataURL(value).then(setSrc)
  }, [value])

  if (!src) return null

  return (
    <img src={src} alt="QR Code" className="w-32 h-32" />
  )
}