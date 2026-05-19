"use client";

import { useEffect, useState } from "react";

interface PlaylistItem {
  id: string;
  type: "image" | "video";
  url: string;
  duration: number;
  campaign_id?: string;
}

export default function PlayerPage() {

  const [playlist, setPlaylist] = useState<PlaylistItem[]>([]);
  const [index, setIndex] = useState(0);

  const screenId =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("screen")
      : null;

  // ------------------------------------------------
  // FETCH PLAYLIST
  // ------------------------------------------------

  async function loadPlaylist() {

    if (!screenId) return;

    try {

      const res = await fetch(
        `/api/player/playlist?screen=${screenId}`
      );

      const data = await res.json();

      setPlaylist(data.items ?? []);

    } catch (err) {

      console.error("playlist error", err);

    }

  }

  useEffect(() => {

    loadPlaylist();

    const interval = setInterval(loadPlaylist, 60000);

    return () => clearInterval(interval);

  }, []);

  // ------------------------------------------------
  // PLAYBACK LOOP
  // ------------------------------------------------

  useEffect(() => {

    if (!playlist.length) return;

    const item = playlist[index];

    const timer = setTimeout(() => {

      setIndex((prev) =>
        prev + 1 >= playlist.length ? 0 : prev + 1
      );

    }, item.duration * 1000);

    registerDisplay(item);

    return () => clearTimeout(timer);

  }, [index, playlist]);

  // ------------------------------------------------
  // REGISTER DISPLAY EVENT
  // ------------------------------------------------

  async function registerDisplay(item: PlaylistItem) {

    try {

      await fetch("/api/events/display", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          screen_id: screenId,
          campaign_id: item.campaign_id,
          asset_url: item.url,
          timestamp: new Date().toISOString()
        })
      });

    } catch (err) {

      console.error("display event error", err);

    }

  }

  if (!playlist.length) {

    return (
      <div
        style={{
          background: "black",
          color: "white",
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        Loading playlist...
      </div>
    );

  }

  const item = playlist[index];

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        background: "black"
      }}
    >
      {item.type === "image" && (
        <img
          src={item.url}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
        />
      )}

      {item.type === "video" && (
        <video
          src={item.url}
          autoPlay
          muted
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover"
          }}
        />
      )}
    </div>
  );

}