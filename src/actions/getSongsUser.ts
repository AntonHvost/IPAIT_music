import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Song } from "../types";

export async function getSongsUser(): Promise<Song[]> {
  const supabase = createServerComponentClient({
    cookies,
  });
  const { data: {session} } = await supabase.auth.getSession();
  
  const { data, error } = await supabase
    .from("user_songs")
    .select("*, songs(*)")
    .eq("user_id", session?.user.id)
    //.order("songs.created_at", { ascending: false });
  if (error) {
    console.log(error.message);
    return [];
  }

  if (!data) {
    return [];
  }
  return data.map((item) => ({ ...item.songs }));//(data as any) || [];
}