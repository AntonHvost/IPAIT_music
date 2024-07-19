import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Song } from "../types";

export async function getSongs(): Promise<Song[]> {
  const supabase = createServerComponentClient({
    cookies,
  });
  const { data, error } = await supabase
    .from("songs")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) {
    console.log(error.message);
  }
  return (data as any) || [];
}