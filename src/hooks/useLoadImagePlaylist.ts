import { useSupabaseClient } from "@supabase/auth-helpers-react";
import { Song } from "../types";

export default function useLoadImagePlaylist(image_path: string) {
  const supabaseClient = useSupabaseClient();
  if (!image_path) {
    return null;
  }
  const { data: imageData } = supabaseClient.storage
    .from("playlist_images")
    .getPublicUrl(image_path);
  console.log(imageData)
  return imageData.publicUrl;
}
