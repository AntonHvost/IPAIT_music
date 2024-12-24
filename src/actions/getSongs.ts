import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Song } from "../types";

export async function getSongs(): Promise<Song[]> {
  const supabase = createServerComponentClient({
    cookies,
  });
  
  const {data: userSongIds } = await supabase
  .from("user_songs")
  .select("song_id")

  const songIds = userSongIds?.map((item) => item.song_id) || [];
  const songIdsString = `(${songIds.join(",")})`;

  const { data, error } = await supabase
  .from("songs")
  .select("*")
  .not("id", "in", songIdsString)
  .order("created_at", { ascending: false });

  if (error) {
    console.log(error.message);
    return [];
  }
  if (!data) {
    return [];
  }
  return (data as any) || [];
}