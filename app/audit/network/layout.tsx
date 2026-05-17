import "leaflet/dist/leaflet.css"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"

export const dynamic = "force-dynamic"

export default function NetworkLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
