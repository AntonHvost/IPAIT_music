import { useSupabaseClient } from "@supabase/auth-helpers-react";
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Song } from "../types";

export default async function useLoadSongUrl(song: Song){
    try {
        console.log(song.song_path);
        const response = await axios.get(`http://localhost:3001/music/${song.id}`, {
            responseType: 'blob',
            headers: {
                'Range': 'bytes=0-'  // Если нужно, можно указать начальный диапазон для быстрого старта воспроизведения
            }
        });
        const blob = new Blob([response.data], { type: 'audio/mpeg' });
        const url = URL.createObjectURL(blob);
        return url;
    } catch (error) {
        console.error('Error fetching song:', error);
    }
}
  /*const supabaseClient = useSupabaseClient();
  if (!song) {
    return "";
  }
  const { data: songData } = supabaseClient.storage
    .from("songs")
    .getPublicUrl(song.song_path);
  return songData.publicUrl;*/

