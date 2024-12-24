"use client"

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Song } from "@/types";

const TracksList = () => {
  const [tracks, setTracks] = useState<Song[]>([]);
  const supabase = useSupabaseClient();

  useEffect(() => {
    const fetchTracks = async () => {
        try {
          // Получаем идентификаторы песен, связанных с пользователями
          const { data: userSongIds, error: userSongError } = await supabase
            .from("user_songs")
            .select("song_id");
          if (userSongError) {
            console.error("Error fetching user songs:", userSongError.message);
            return;
          }
  
          // Преобразуем в массив идентификаторов
          const songIds = userSongIds?.map((item) => item.song_id) || [];
          const songIdsString = `(${songIds.join(",")})`;
  
          // Загружаем песни, которые не связаны с пользователями
          const { data: songs, error: songsError } = await supabase
            .from("songs")
            .select("*")
            .not("id", "in", (songIdsString));
  
          if (songsError) {
            console.error("Error fetching songs:", songsError.message);
          } else {
            setTracks(songs || []);
          }
        } catch (error) {
          console.error("Unexpected error:", error);
        }
      };
  
      fetchTracks();
    }, []);


  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("songs").delete().eq("id", id);
    if (error) {
      console.error("Error deleting track:", error.message);
    } else {
      setTracks(tracks.filter((track) => track.id !== id));
    }
  };

  return (
    <div className="w-full">
        <div className="h-full w-[100%] flex-col gap-y-2 bg-delft_blue p-2 md:flex">
      <h1>Tracks</h1>
      <Link href="/admin/add">
        <button className="bg-pink pl-6 pr-6">Add Track</button>
      </Link>
      <ul>
        {tracks.map((track) => (
          <div className="w-full flex justify-between" key={track.id}>
            {track.title} by {track.author}
            <div className="w-[160px] flex justify-around">
            <Link href={`/admin/edit/${track.id}`}>
              <button>Edit</button>
            </Link>
            <button onClick={() => handleDelete(track.id)}>Delete</button>
            </div>
          </div>
        ))}
      </ul>
      </div>
    </div>
  );
};

export default TracksList;