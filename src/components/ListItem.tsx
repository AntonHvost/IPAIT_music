"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import {Playlist} from "@/types"

type Props = {
  image: string;
  name: string;
  href: string;
};

export default function ListItem({ image, name, href}: Props) {
  const router = useRouter();
  const onClick = () => {
    router.push(href);
  };
  return (
    <div className="flex gap-x-5">
    <button
      onClick={onClick}
      className="group relative flex items-center gap-x-4 overflow-hidden rounded-md bg-neutral-100/10 pr-4 transition hover:bg-neutral-100/20"
    >
      <div className="relative min-h-[64px] min-w-[64px]">
        <Image className="object-cover" fill src={image} alt="Image" />
      </div>
      <p className="truncate py-5 font-medium">{name}</p>
      </button>
    </div>
  );
}
