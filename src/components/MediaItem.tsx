"use client";

import usePlayer from "@/hooks/usePlayer";
import Image from "next/image";
import useLoadImage from "../hooks/useLoadImage";
import { Song } from "../types";

type Props = {
  data: Song;
  onClick?: (id: string) => void;
};

export default function MediaItem({ data, onClick }: Props) {
  const imageUrl = useLoadImage(data.image_path);
  const { setId } = usePlayer();

  const handleClick = () => {
    if (onClick) {
      return onClick(data.id);
    }
    return setId(data.id);
  };

  return (
    <div
      onClick={handleClick}
      className="flex w-full cursor-pointer items-center gap-x-3 rounded-md p-2 hover:bg-neutral-800/50"
    >
      <div className="relative min-h-[48px] min-w-[48px] overflow-hidden rounded-md">
        <Image
          fill
          src={imageUrl || "/images/liked.png"}
          alt="Media Item"
          className="object-cover"
        />
      </div>
      <div className="flex flex-col gap-y-1 overflow-hidden">
        <p className="truncate text-white">{data.title}</p>
        <p className="truncate text-sm text-neutral-400">{data.author}</p>
      </div>
    </div>
  );
}
