"use client";

import useGetSongById from "../hooks/useGetSongById";
import React, { useState, useEffect } from 'react';
import usePlayer from "../hooks/usePlayer";
import PlayerContent from "./PlayerContent";

export default function Player() {
  const player = usePlayer();
  const { song } = useGetSongById(player.activeId); 
  /*const [songUrl, setSongUrl] = useState<string | null>(null);
  useEffect(() => {
    const loadSongUrl = async () => {
      if (song) {
        const url = await useLoadSongUrl(song);
        setSongUrl(url || null);
      }
    };
    loadSongUrl();
  }, [song]);*/

  if (!song /*|| !songUrl*/ || !player.activeId) {
    return null;
  }

  return (
    <div className="fixed bottom-0 h-[80px] w-full bg-oxford_blue px-4 py-2">
      <PlayerContent key={song.id} song={song} /*songUrl={songUrl}*/ />
    </div>
  );
}
