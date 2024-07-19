"use client";

import { useEffect, useRef, useState } from "react";
import { AiFillStepBackward, AiFillStepForward } from "react-icons/ai";
import { BsPauseFill, BsPlayFill } from "react-icons/bs";
import { HiSpeakerWave, HiSpeakerXMark } from "react-icons/hi2";
import MediaItem from "../components/MediaItem";
import usePlayer from "../hooks/usePlayer";
import { Song } from "../types";
import LikeButton from "./LikeButton";
import Slider from "./Slider";
import SliderSong from "./SliderSong";
import useChunkLoader from "@/hooks/useChunkLoader";

type Props = {
  song: Song;
  //songUrl: string;
};

const moment = require('moment');

export default function PlayerContent({ song/*, songUrl*/}: Props) {
  const { activeId, ids, setId } = usePlayer();
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullFileDownloaded, setFullFileDownloaded] = useState(false);
  //const [sourceBuffer, setSourceBuffer] = useState<SourceBuffer | null>(null);

  const Icon = isPlaying ? BsPauseFill : BsPlayFill;
  const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;

  let dur_time = moment.duration(song.duration);
  const dur_sec = dur_time.isValid() ? dur_time.asSeconds() : 0;
  const dur_millisec = dur_time.isValid() ? dur_time.asMilliseconds() : 0;

  const { audioRef, handleSeek } = useChunkLoader(song.id, dur_millisec);

  const onPlayNext = () => {
    if (ids.length === 0) {
      return;
    }
    const currentIndex = ids.findIndex((id) => id === activeId);
    const nextSong = ids[currentIndex + 1];
    if (!nextSong) {
      return setId(ids[0]);
    }
    setId(nextSong);
  };

  const onPlayPrevious = () => {
    if (ids.length === 0) {
      return;
    }
    const currentIndex = ids.findIndex((id) => id === activeId);
    const previousSong = ids[currentIndex - 1];
    if (!previousSong) {
      return setId(ids[ids.length - 1]);
    }
    setId(previousSong);
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying((prev) => !prev);
  };

  const toggleMute = () => {
    setVolume((prev) => (prev === 0 ? 1 : 0));
  };

  useEffect(() => {
    const audio = audioRef.current;
    audio.volume = volume;
  }, [volume]);

  useEffect(() => {
    const audio = audioRef.current;
    const updateProgress = () => {
      setProgress(audio.currentTime);
      
    };

    setDuration(dur_sec);

    audio.addEventListener("timeupdate", updateProgress);

    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
    };
  }, [dur_sec]);

  useEffect(() => {
    const audio = audioRef.current;
    audio.play();
    setIsPlaying(true);
  }, []);

  return (
    <div className="grid h-full grid-cols-2 grid-rows-2 md:grid-cols-3">
      <div className="flex w-full justify-start">
        <div className="flex items-center gap-x-4">
          <MediaItem data={song} />
          <LikeButton songId={song.id} />
        </div>
      </div>
      <div className="col-auto flex w-full items-center justify-end md:hidden">
        <div
          onClick={handlePlayPause}
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white p-1"
        >
          <Icon size={30} className="text-black" />
        </div>
      </div>
      <div className="hidden h-full w-full max-w-[722px] items-center justify-center gap-x-6 md:flex">
        <AiFillStepBackward
          onClick={onPlayPrevious}
          size={30}
          className="cursor-pointer text-neutral-400 transition hover:text-white"
        />
        <div
          className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full bg-white p-1"
          onClick={handlePlayPause}
        >
          <Icon size={30} className="text-black" />
        </div>
        <AiFillStepForward
          onClick={onPlayNext}
          size={30}
          className="cursor-pointer text-neutral-400 transition hover:text-white"
        />
      </div>
      <div className="hidden w-full justify-end pr-2 md:flex">
        <div className="flex w-[120px] items-center gap-x-2">
          <VolumeIcon
            onClick={toggleMute}
            className="cursor-pointer"
            size={34}
          />
          <Slider value={volume} max={1} onChange={(value) => setVolume(value)} />
        </div>
      </div>
      <div className="col-span-2 md:col-span-3 mt-2 ">
          <SliderSong value={progress} max={duration} onChange={handleSeek} />
      </div>
    </div>
  );
}
