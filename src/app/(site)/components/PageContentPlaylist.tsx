"use client"

import {Playlist} from "../../../types";
import ListItem from "@/components/ListItem";
import PlaylistItem from "@/components/PlaylistItem";
import {FaPlus } from "react-icons/fa";
import usePlaylistModal from "@/hooks/usePlaylistModal";

type Props = {
    playlists: Playlist[];
}

export default function PageContentPlaylist({playlists}: Props){
    const { onOpen: onOpenPlaylist } = usePlaylistModal();
    const onClick = () => {
        return onOpenPlaylist();
      };

    return(
        <div className="mt-4 grid grid-cols-2 gap-1 sm:grid-cols-3 xl:grid-cols-6 2xl:grid-cols-7">
            <ListItem
                image="/images/liked.png"
                name="Liked Songs"
                href="liked"
            />
            {playlists.map((playlist) => (
            <PlaylistItem
                key={playlist.id}
                data={playlist}
            />
            ))}
        <button 
            onClick={onClick}
            className="group max-w-[64px] max-h-[64px] relative pl-4 pr-4 flex flex-col items-center justify-around bg-violet-800/50 rounded-md transition hover:bg-purple-600">
            <FaPlus size={25}/>
        </button>    
        </div>
    )
}