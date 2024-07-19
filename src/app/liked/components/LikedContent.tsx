"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import LikeButton from "../../../components/LikeButton";
import MediaItem from "../../../components/MediaItem";
import useOnPlay from "../../../hooks/useOnPlay";
import { useUser } from "../../../hooks/useUser";
import { Song } from "../../../types";

type Props = {
  songs: Song[];
};

export default function LikedContent({ songs }: Props) {
  const onPlay = useOnPlay(songs);
  const router = useRouter();
  const { isLoading, user } = useUser();

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/");
    }
  }, [isLoading, router, user]);

  if (songs.length === 0) {
    return (
      <div className="flex w-full flex-col gap-y-2 px-6 text-neutral-400">
        Нет понравившихся треков 
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-y-2 p-6">
      {songs.map((song) => (
        <div key={song.id} className="flex w-full items-center gap-x-4">
          <div className="flex-1">
            <MediaItem data={song} onClick={(id: string) => onPlay(id)} />
          </div>
          <LikeButton songId={song.id} />
        </div>
      ))}
    </div>
  );
}
