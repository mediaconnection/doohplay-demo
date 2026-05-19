"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false }
);

const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false }
);

const CircleMarker = dynamic(
  () => import("react-leaflet").then((m) => m.CircleMarker),
  { ssr: false }
);

const Popup = dynamic(
  () => import("react-leaflet").then((m) => m.Popup),
  { ssr: false }
);

type NetworkScreen = {
  id: string;
  name: string | null;
  city: string | null;
  latitude: number;
  longitude: number;
  status: string;
  last_seen: string | null;
};

export default function NetworkMapPage() {

  const [screens, setScreens] = useState<NetworkScreen[]>([]);

  useEffect(() => {

    async function load() {

      const res = await fetch("/api/audit/network", {
        cache: "no-store"
      });

      const json = await res.json();

      setScreens(json.screens ?? []);

    }

    load();

  }, []);

  return (
    <div style={{ padding: 40, fontFamily: "Arial" }}>

      <h1>DOOHPLAY Network Transparency Map</h1>

      <p>
        Geographic distribution of screens participating in the DOOHPLAY network.
      </p>

      <div style={{ height: 600, marginTop: 20 }}>

        <MapContainer
          center={[-23.55, -46.63]}
          zoom={4}
          style={{ height: "100%", width: "100%" }}
        >

          <TileLayer
            attribution="© OpenStreetMap contributors"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {screens
            .filter((s) => s.latitude && s.longitude)
            .map((s) => (

              <CircleMarker
                key={s.id}
                center={[s.latitude, s.longitude]}
                radius={6}
                pathOptions={{
                  color: s.status === "online" ? "#22c55e" : "#ef4444"
                }}
              >

                <Popup>

                  <b>{s.name ?? "Unnamed screen"}</b>

                  <div>{s.city ?? "Unknown city"}</div>

                  <div>Status: {s.status}</div>

                  <div style={{ fontSize: 12 }}>
                    Last seen:{" "}
                    {s.last_seen
                      ? new Date(s.last_seen).toLocaleString()
                      : "Unknown"}
                  </div>

                </Popup>

              </CircleMarker>

            ))}

        </MapContainer>

      </div>

    </div>
  );
}