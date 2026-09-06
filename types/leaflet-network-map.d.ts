import "leaflet"
import type { NetworkMapItem } from "@proof-engine/domain/network-map/types"

declare module "leaflet" {
  interface CircleMarkerOptions {
    item?: NetworkMapItem
  }
}