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
  //const [sourceBuffer, setSourceBuffer] = useState<SourceBuffer | null>(null);

  const Icon = isPlaying ? BsPauseFill : BsPlayFill;
  const VolumeIcon = volume === 0 ? HiSpeakerXMark : HiSpeakerWave;

  let dur_time = moment.duration(song.duration);
  const dur_sec = dur_time.isValid() ? dur_time.asSeconds() : 0;
  let durationTime = <span className="w-[80px]">{`${moment.utc(dur_sec * 1000).format('HH:mm:ss')}`}</span>;
  const dur_millisec = dur_time.isValid() ? dur_time.asMilliseconds() : 0;

  const { audioRef, handleSeek, loadingProgress} = useChunkLoader(song.id, dur_millisec);
  const onPlayNext = () => {
    console.log("onPlayNext called");
    if (ids.length === 0) {
      return;
    }
    const currentIndex = ids.findIndex((id) => id === activeId);
    const nextIndex = (currentIndex + 1) % ids.length;
    const nextSong = ids[nextIndex];
    if (!nextSong) {
      return setId(ids[0]);
    }
    console.log("Next song ID:", nextSong);
    setId(nextSong);
  };

  const onPlayPrevious = () => {
    console.log("onPlayPrevious called");
    if (ids.length === 0) {
      return;
    }
    const currentIndex = ids.findIndex((id) => id === activeId);
    const previousIndex = (currentIndex - 1 + ids.length) % ids.length;
    const previousSong = ids[previousIndex];
    if (!previousSong) {
      console.log(ids, activeId);
      return setId(ids[ids.length - 1]);
    }
    console.log("Previous song ID:", previousSong);
    setId(previousSong);
    console.log(ids, activeId);
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
    audio.addEventListener("ended", onPlayNext);
    return () => {
      audio.removeEventListener("timeupdate", updateProgress);
      audio.removeEventListener("ended", onPlayNext);
    };
  }, [dur_sec]);


  useEffect(() => {
    const audio = audioRef.current;
    audio.play();
    setIsPlaying(true);
  }, [audioRef, activeId]);

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
        <div className="flex justify-center">
        <span className="w-[80px]">{`${moment.utc(Math.ceil(progress) * 1000).format('HH:mm:ss')}`}</span>
          <div className="w-[80%]"><SliderSong value={progress} loadedChunks={loadingProgress} max={duration} onChange={handleSeek} /></div>
          {durationTime}
          </div>
      </div>
    </div>
  );
}
