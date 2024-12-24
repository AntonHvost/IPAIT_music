import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { Playlist } from "@/types";

export async function getPlaylists(): Promise<Playlist[]> {
    const supabase = createServerComponentClient({
        cookies,
    });

    const {data: {session}} = await supabase.auth.getSession();

    const {data, error} = await supabase
        .from("playlists")
        .select("*")
        .eq("user_id", session?.user?.id);
    if (error) {
        console.log(error.message);
        return [];
    }
    return (data as any) || [];
}