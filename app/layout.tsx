import type { ReactNode } from "react"

export const metadata = {
  title: "Admin | DOOHPLAY",
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, padding: 0, background: "#0B1020" }}>
        {children}
      </body>
    </html>
  )
}
