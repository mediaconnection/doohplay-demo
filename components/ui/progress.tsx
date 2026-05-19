export function Progress({ value = 0 }: { value?: number }) {
  return (
    <div style={{ width: "100%", height: 8, background: "#e5e7eb" }}>
      <div
        style={{
          width: `${Math.max(0, Math.min(100, value))}%`,
          height: "100%",
          background: "#2563eb"
        }}
      />
    </div>
  )
}