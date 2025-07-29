"use client";

import { useEffect, useState } from "react";

interface TrackData {
  title: string;
  artist: string;
  uri: string;
  artURL: string;
  progress_ms: number;
  duration_ms: number;
}

export default function TrackInfo() {
  const [track, setTrack] = useState<TrackData | null>(null);
  const [error, setError] = useState(false);

  async function fetchNowPlaying() {
    try {
      const res = await fetch("/api/now-playing");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTrack(data);
      setError(false);
    } catch (err) {
      setError(true);
      setTrack(null);
    }
  }

  useEffect(() => {
    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 3000);
    return () => clearInterval(interval);
  }, []);

  if (error) return <p className="text-red-400">⚠️ Unable to sync with host.</p>;
  if (!track) return <p>Loading...</p>;

  return (
    <div className="bg-gray-800 p-4 rounded shadow max-w-md">
      <img 
        src={`${track.artURL}`} 
        alt={`${track.title} album art`} 
        className="w-full h-auto rounded" 
      />
      <p><strong>Track:</strong> {track.title}</p>
      <p><strong>Artist:</strong> {track.artist}</p>
      <p>
        <strong>Progress:</strong>{" "}
        {Math.floor((track.progress_ms * 1000) / 60)}:
        {Math.floor((track.progress_ms * 1000) % 60).toString().padStart(2, "0")}
      </p>
      <p>
        <strong>Duration:</strong>{" "}
        {Math.floor((track.duration_ms * 1000) / 60)}:
        {Math.floor((track.duration_ms * 1000) % 60).toString().padStart(2, "0")}
      </p>

    </div>
  );
}