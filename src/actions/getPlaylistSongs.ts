import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Song } from "../types";

export async function getPlaylistSongs(): Promise<Song[]> {
  const supabase = createServerComponentClient({
    cookies,
  });
  const { data, error } = await supabase
    .from("playlist_items")
    .select("*, songs(*)")
    .eq("id_playlist", supabase
        .from("playlists")
        .select("id")
    );
  if (error) {
    console.log(error.message);
    return [];
  }
  if (!data) {
    return [];
  }
  console.log(data);
  return data.map((item) => ({ ...item.songs }));
}
