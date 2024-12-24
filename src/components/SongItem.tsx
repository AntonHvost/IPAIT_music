"use client";

import Image from "next/image";
import useLoadImage from "../hooks/useLoadImage";
import { Song } from "../types";
import PlayButton from "./PlayButton";
import OptionButton from "./OptionButton";
import { useUser } from "@/hooks/useUser";

type Props = {
  data: Song;
  onClick: (id: string) => void;
};

export default function SongItem({ data, onClick}: Props) {
  const imagePath = useLoadImage(data.image_path);
  const user = useUser();

  return (
    <div
      onClick={() => onClick(data.id)}
      className="group relative flex cursor-pointer flex-col items-center justify-center gap-x-4 overflow-hidden rounded-md bg-neutral-400/5 p-3 transition hover:bg-neutral-400/10"
    >
      <div className="relative aspect-square h-full w-full overflow-hidden rounded-md">
        <Image
          className="object-cover"
          src={imagePath || "/images/liked.png"}
          fill
          alt="Image"
        />
      </div>
      <div className="flex w-full items-center justify-around">
      <div className="flex w-full flex-col items-start gap-y-1 pt-4">
        <p className="w-full truncate font-semibold">{data.title}</p>
        <p className="w-full truncate pb-4 text-sm text-neutral-400">
          By {data.author}
        </p>
      </div>
      {user ? (<div className=""><OptionButton songId={data.id}/></div>) : (<></>)}
      
      </div>
      <div className="absolute bottom-24 right-5">
        <PlayButton />
      </div>
    </div>
  );
}
