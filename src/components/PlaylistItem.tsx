"use client"

import Image from "next/image";
import useLoadImagePlaylist from "@/hooks/useLoadImagePlaylist";
import { useRouter } from "next/navigation";
import {Playlist} from "@/types";

type Props = {
    data: Playlist;
}

export default function PlaylistItem({data}: Props){
    const image_path = useLoadImagePlaylist(data.image);
    const router = useRouter();

    return(
        <div className="flex gap-x-5">
        <button
              onClick={() =>  router.push(`/playlist/${data.name}`)}
              className="group relative flex items-center gap-x-4 overflow-hidden rounded-md bg-neutral-100/10 pr-4 transition hover:bg-neutral-100/20"
            >
              <div className="relative max-h-[64px] min-h-[64px] max-w-[64px] min-w-[64px]">
                <Image className="object-cover" fill src={image_path || "/images/liked.png"} alt="Image" />
              </div>
              <p className="truncate py-5 font-medium">{data.name}</p>
        </button>
        </div>
    );
}