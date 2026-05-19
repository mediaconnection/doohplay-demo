"use client"

import { useEffect, useMemo, useRef } from "react"

import L from "leaflet"
import "leaflet/dist/leaflet.css"

import "leaflet.markercluster"
import "leaflet.markercluster/dist/MarkerCluster.css"
import "leaflet.markercluster/dist/MarkerCluster.Default.css"

type DevicePoint = {
  id: string
  name?: string | null
  lat: number
  lng: number
  status?: string | null
  city?: string | null
}

type MarkerClusterGroupInstance = L.MarkerClusterGroup

function isValidCoordinate(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value)
}

function normalizePoints(data: unknown): DevicePoint[] {
  if (!Array.isArray(data)) return []

  return data
    .map((item: unknown): DevicePoint | null => {
      if (!item || typeof item !== "object") {
        return null
      }

      const row = item as Record<string, unknown>

      const lat = Number(row.lat)
      const lng = Number(row.lng)

      if (!isValidCoordinate(lat) || !isValidCoordinate(lng)) {
        return null
      }

      return {
        id: String(row.id ?? crypto.randomUUID()),
        name:
          typeof row.name === "string"
            ? row.name
            : typeof row.label === "string"
              ? row.label
              : "Device",
        lat,
        lng,
        status:
          typeof row.status === "string"
            ? row.status
            : null,
        city:
          typeof row.city === "string"
            ? row.city
            : null
      }
    })
    .filter((item): item is DevicePoint => item !== null)
}

export default function NetworkMapPage() {
  const mapRef = useRef<L.Map | null>(null)
  const clusterRef = useRef<MarkerClusterGroupInstance | null>(null)
  const containerRef = useRef<HTMLDivElement | null>(null)

  const points = useMemo<DevicePoint[]>(() => {
    return normalizePoints([
      {
        id: "1",
        name: "São Paulo Display",
        lat: -23.55052,
        lng: -46.633308,
        status: "ONLINE",
        city: "São Paulo"
      },
      {
        id: "2",
        name: "Rio Display",
        lat: -22.906847,
        lng: -43.172897,
        status: "ONLINE",
        city: "Rio de Janeiro"
      },
      {
        id: "3",
        name: "Brasília Display",
        lat: -15.793889,
        lng: -47.882778,
        status: "OFFLINE",
        city: "Brasília"
      }
    ])
  }, [])

  useEffect(() => {
    if (!containerRef.current || mapRef.current) {
      return
    }

    const map = L.map(containerRef.current, {
      zoomControl: true
    }).setView([-15.7801, -47.9292], 4)

    mapRef.current = map

    L.tileLayer(
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      {
        attribution: "&copy; OpenStreetMap contributors"
      }
    ).addTo(map)

    const clusterGroup = L.markerClusterGroup()

    clusterRef.current = clusterGroup

    map.addLayer(clusterGroup)

    return () => {
      map.remove()
      mapRef.current = null
      clusterRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!clusterRef.current) {
      return
    }

    clusterRef.current.clearLayers()

    points.forEach((point: DevicePoint) => {
      const marker = L.circleMarker(
        [point.lat, point.lng],
        {
          radius: 8,
          color:
            point.status === "OFFLINE"
              ? "#ef4444"
              : "#10b981",
          weight: 2,
          fillOpacity: 0.8
        }
      )

      marker.bindPopup(`
        <div style="min-width:180px">
          <strong>${point.name ?? "Device"}</strong>
          <br />
          Status: ${point.status ?? "UNKNOWN"}
          <br />
          Cidade: ${point.city ?? "-"}
        </div>
      `)

      clusterRef.current?.addLayer(marker)
    })
  }, [points])

  return (
    <main className="p-6">
      <div className="mb-4">
        <h1 className="text-2xl font-bold">
          🌎 Network Map
        </h1>

        <p className="text-sm text-gray-500">
          Monitoramento geográfico da rede DOOHPLAY
        </p>
      </div>

      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "75vh",
          borderRadius: 16,
          overflow: "hidden"
        }}
      />
    </main>
  )
}