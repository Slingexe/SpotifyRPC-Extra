/* eslint-disable @next/next/no-img-element */
"use client";

import { useEffect, useState } from "react";

interface TrackData {
  is_offline: boolean;
  is_playing: boolean;
  title: string;
  artist: string;
  uri: string;
  artURL: string;
  progress: number;
  duration: number;
  context_type: string;
  context_uri: string;
  context_name: string;
}

export default function TrackInfo() {
  const [track, setTrack] = useState<TrackData | null>(null);
  const [error, setError] = useState(false);
  const [localProgress, setLocalProgress] = useState(0);
  const [lastUpdate, setLastUpdate] = useState<number | null>(null);

  // Fetch from server and sync local progress
  async function fetchNowPlaying() {
    try {
      const res = await fetch("/api/now-playing");
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
      setTrack(data);
      setLocalProgress(data.progress);
      setLastUpdate(Date.now());
      setError(false);
    } catch (err) {
      console.error(err);
      setError(true);
      setTrack(null);
    }
  }

  // Poll server every 3s
  useEffect(() => {
    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 3000);
    return () => clearInterval(interval);
  }, []);

  // Local progress timer
  useEffect(() => {
    if (!track || !track.is_playing) return;
    let raf: number;
    let running = true;
    const update = () => {
      if (!running) return;
      setLocalProgress(prev => {
        // Only increment if still playing and not over duration
        if (!track.is_playing) return prev;
        const now = Date.now();
        const elapsed = lastUpdate ? (now - lastUpdate) / 1000 : 0;
        let next = track.progress + elapsed;
        if (track.duration && next > track.duration) next = track.duration;
        return next;
      });
      raf = requestAnimationFrame(update);
    };
    raf = requestAnimationFrame(update);
    return () => {
      running = false;
      cancelAnimationFrame(raf);
    };
    // Only rerun when track or lastUpdate changes
  }, [track, lastUpdate]);

  if (error) return <p className="text-red-400">⚠️ Unable to sync with host.</p>;
  if (!track) return <p>Loading...</p>;

  // Helper to format time mm:ss
  function formatTime(sec: number) {
    return `${Math.floor(sec / 60)}:${Math.floor(sec % 60).toString().padStart(2, "0")}`;
  }

  // Calculate progress percent
  const progressPercent = track.duration > 0 ? (localProgress / track.duration) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-2xl shadow-lg max-w-2xl mx-auto flex flex-row items-center gap-6">
      {/* Album Art */}
      <div className="w-40 h-40 rounded-xl overflow-hidden shadow-lg flex-shrink-0 relative">
        <img
          src={track.artURL || process.env.BACKUP_IMAGE}
          alt={`${track.title || 'None'} album art`}
          className="w-full h-full object-cover"
        />
        <span
          className={`absolute bottom-2 right-2 text-xs px-2 py-0.5 rounded-full shadow-lg ${track.is_playing ? 'bg-green-700 text-green-300' : 'bg-gray-700 text-gray-400'}`}
        >
          {track.is_playing ? 'Playing' : 'Paused'}
        </span>
      </div>
      {/* Song Data */}
      <div className="flex-1 flex flex-col justify-center gap-2 overflow-hidden">
        <div className="flex flex-col items-start text-left w-full overflow-hidden">
          <h2
            className="text-2xl font-bold text-white w-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer"
            title={track.title}
          >
            {track.title}
          </h2>
          <p
            className="text-gray-300 text-base mb-1 w-full max-w-full overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer"
            title={track.artist}
          >
            {track.artist}
          </p>
          {track.context_name && track.context_type !== 'user_collection' && (
            <span className="text-xs text-gray-200 bg-gray-700 px-2 py-0.5 rounded-full mb-2 mt-1">
              {track.context_name}
              {" "}
              <span className="ml-2 text-green-400 font-semibold">
                {track.context_type === 'album' && 'Album'}
                {track.context_type === 'playlist' && 'Playlist'}
              </span>
            </span>
          )}
          {/* Show only 'Liked Songs' label for user_collection */}
          {track.context_type === 'user_collection' && (
            <span className="text-xs text-green-400 bg-gray-700 px-2 py-0.5 rounded-full mb-2 mt-1 font-semibold">Liked Songs</span>
          )}
        </div>
        <div className="w-full flex flex-col gap-1 mt-2">
          <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 transition-all"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-gray-400 font-mono mt-1">
            <span>{formatTime(localProgress) || '0:00'}</span>
            <span>{formatTime(track.duration) || '0:00'}</span>
          </div>
        </div>
        <div className="w-full flex flex-row items-center gap-2 mt-3">
          {track.is_offline && (
            <span className="text-xs bg-yellow-700 text-yellow-200 px-2 py-0.5 rounded-full">Offline</span>
          )}
          {/* Open Track Button */}
          <a
            href={`https://open.spotify.com/track/${track.uri?.split(":").pop()}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs bg-green-700 text-green-200 px-2 py-0.5 rounded-full hover:bg-green-800 transition-colors"
          >
            Open Track
          </a>
          {/* Open Context Button (Album/Playlist/Liked Songs) */}
          {track.context_type && track.context_uri && (track.context_type === 'album' || track.context_type === 'playlist') && (
            <a
              href={`https://open.spotify.com/${track.context_type}/${track.context_uri?.split(":").pop()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-blue-700 text-blue-200 px-2 py-0.5 rounded-full hover:bg-blue-800 transition-colors"
            >
              {track.context_type === 'album' && 'Open Album'}
              {track.context_type === 'playlist' && 'Open Playlist'}
            </a>
          )}
          {/* Greyed out if user_collection */}
          {track.context_type === 'user_collection' && (
            <span
              className="text-xs bg-gray-700 text-gray-400 px-2 py-0.5 rounded-full opacity-60 cursor-not-allowed"
              title="Not available for user collection"
            >
              Open Playlist
            </span>
          )}
          {/* Liked Songs special case */}
          {track.context_type === 'collection' && (
            <a
              href="https://open.spotify.com/collection/tracks"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs bg-purple-700 text-purple-200 px-2 py-0.5 rounded-full hover:bg-purple-800 transition-colors"
            >
              Open Liked Songs
            </a>
          )}
        </div>
      </div>
    </div>
  );
}