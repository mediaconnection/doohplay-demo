import { Suspense } from "react"
import InstallContent from "./install-content"

export const dynamic = "force-dynamic"

export default function InstallPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: "100vh", background: "#0A0F1E", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ color: "#3B82F6", fontSize: 16 }}>Carregando...</div>
      </div>
    }>
      <InstallContent />
    </Suspense>
  )
}
