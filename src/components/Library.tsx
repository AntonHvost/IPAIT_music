"use client";

import useSubscribeModal from "@/hooks/useSubscribeModal";
import { AiOutlinePlus } from "react-icons/ai";
import { TbPlaylist } from "react-icons/tb";
import useAuthModal from "../hooks/useAuthModal";
import useOnPlay from "../hooks/useOnPlay";
import useUploadModal from "../hooks/useUploadModal";
import { useUser } from "../hooks/useUser";
import { Song } from "../types";
import MediaItem from "./MediaItem";

type Props = {
  songs: Song[];
};

export default function Library({ songs }: Props) {
  const { onOpen: onOpenAuth } = useAuthModal();
  const onPlay = useOnPlay(songs);
  const { onOpen: onOpenUpload } = useUploadModal();
  const { onOpen: onOpenSubscribe } = useSubscribeModal();
  const { user, subscription } = useUser();
  const onClick = () => {
    if (!user) {
      return onOpenAuth();
    }
    if (!subscription) {
      return onOpenSubscribe();
    }
    return onOpenUpload();
  };
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between px-5 pt-4">
        <div className="inline-flex items-center gap-x-2">
          <TbPlaylist size={26} className="text-neutral-400" />
          <p className="font-medium text-neutral-400">Моя библиотека</p>
        </div>
        <AiOutlinePlus
          onClick={onClick}
          size={20}
          className="cursor-pointer text-neutral-400 transition hover:text-white"
        />
      </div>
      <div className="mt-4 flex flex-col gap-y-2 px-3">
        {songs.map((song) => (
          <MediaItem
            key={song.id}
            data={song}
            onClick={(id: string) => onPlay(id)}
          />
        ))}
      </div>
    </div>
  );
}
