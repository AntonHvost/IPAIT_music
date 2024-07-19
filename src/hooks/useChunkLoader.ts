import { useEffect, useRef, useState } from "react";
import useLoadSongChunks from "@/hooks/useLoadSongChunks";

let loadedBytes = 0;

const useChunkLoader = (songId: string, duration: number) => {

  const mediaSourceRef = useRef(new MediaSource());
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const fileSizeRef = useRef<number | null>(null);
  const [fullFileDownloaded, setFullFileDownloaded] = useState(false);

  const fetchAndAppendChunk = async (startByte: number) => {
    try {
    const response = await useLoadSongChunks(songId, startByte);
    if (response) {
      const { chunk, isFullFile } = response;
      /*if (fileSize && !fileSizeRef.current) {
        fileSizeRef.current = fileSize;
      }*/
      setFullFileDownloaded(isFullFile);
      if (chunk && sourceBufferRef.current && !sourceBufferRef.current.updating) {
        sourceBufferRef.current.appendBuffer(chunk);
        loadedBytes += chunk.byteLength;
        console.log(`Loaded bytes: ${loadedBytes}`);
      }
    }
    } catch (error) {
        console.error("Error fetching chunk:", error);
        // Попробуйте повторить запрос или обработайте ошибку соответствующим образом
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    const mediaSource = mediaSourceRef.current;
    audio.src = URL.createObjectURL(mediaSource);

    const onSourceOpen = async () => {
      sourceBufferRef.current = mediaSource.addSourceBuffer('audio/mpeg');
      await fetchAndAppendChunk(0);

      audio.addEventListener('timeupdate', async () => {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        if (audio.currentTime > bufferedEnd - 30 && !fullFileDownloaded) {
          await fetchAndAppendChunk(loadedBytes);
        }
      });
    };

    mediaSource.addEventListener('sourceopen', onSourceOpen);

    return () => {
      audio.pause();
      audio.src = '';
      mediaSource.removeEventListener('sourceopen', onSourceOpen);
    };
  }, [songId]);

  let bytePosition = 0;
  const handleSeek = async (value: number) => {
    const audio = audioRef.current;
    if (!isNaN(value) && isFinite(value)) {
      const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
      if (value > bufferedEnd) {
        bytePosition = Math.floor((value / duration) * fileSizeRef.current!);
        await fetchAndAppendChunk(bytePosition);
      }
      else {
        console.warn(`Attempted to fetch beyond file size. Byte position: ${bytePosition}, File size: ${fileSizeRef.current}`);
      }
      audio.currentTime = value;
    }
  };

  return {
    audioRef,
    mediaSourceRef,
    handleSeek,
    fullFileDownloaded,
  };
};

export default useChunkLoader;