import "leaflet"
import type { NetworkMapItem } from "@/lib/domain/network-map/types"

declare module "leaflet" {
  interface CircleMarkerOptions {
    item?: NetworkMapItem
  }
}