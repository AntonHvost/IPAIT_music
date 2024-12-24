import { Song } from "../types";
import { useUser } from "./useUser";

export default function useAddToPlaylist(songs: Song[]){
    const user = useUser();
}