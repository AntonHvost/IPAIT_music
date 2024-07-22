import { useEffect, useRef, useState } from "react";

const useChunkLoader = (songId: string, duration: number) => {

  const mediaSourceRef = useRef(new MediaSource());
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const fileSizeRef = useRef<number | null>(null);
  const [fullFileDownloaded, setFullFileDownloaded] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);

  let loadedBytes = 0;
  let receivedChunks: { id: number, chunk: ArrayBuffer }[] = [];
  let chunkIdCounter = 0;
  let pendingChunks: { id: number, chunk: ArrayBuffer }[] = [];
  let isAppending = false;

useEffect(() => {
  console.log('Initializing WebSocket connection...');
  const socket = new WebSocket("ws://localhost:3001");
  socket.onopen = () => {
    console.log('WebSocket connection established');
    wsRef.current = socket;
    fetchAndAppendChunk(0);
  };
  socket.onclose = () => {
    console.log('WebSocket connection closed');
    wsRef.current = null;
  };

  socket.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  socket.onmessage = (event) => {
      if (typeof event.data === 'string') {
      const data = JSON.parse(event.data);
      if(data.done == true){
      setFullFileDownloaded(data.done);
      }
      //console.log(fullFileDownloaded);
      //console.log(data.done);

      if (data.fileSize) {
        fileSizeRef.current = data.fileSize;
      }

      if (data.error) {
        console.error(data.error);
      }
    } else if (event.data instanceof Blob) {
      event.data.arrayBuffer().then((chunk) => {
        const id = chunkIdCounter++;
          receivedChunks.push({ id, chunk });
          processReceivedChunks();
      });
    }
  };

  return () => {
    socket.close();
  };
}, [songId]);

const fetchAndAppendChunk = (startByte: number) => {
  if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && !fullFileDownloaded) {
    wsRef.current.send(JSON.stringify({ songId, startByte}));
    //console.log(`Requested chunk from byte ${startByte}`);
  } else {
    console.warn('WebSocket is not open. Cannot fetch chunk.');
  }
};

const processReceivedChunks = () => {
  receivedChunks.sort((a, b) => a.id - b.id);
    pendingChunks = pendingChunks.concat(receivedChunks);
    receivedChunks = [];
    appendPendingChunks();
};

const appendPendingChunks = () => {
  if (isAppending) return;
  if (sourceBufferRef.current && !sourceBufferRef.current.updating && pendingChunks.length > 0) {
    isAppending = true;
    const { chunk } = pendingChunks.shift()!;
    sourceBufferRef.current.appendBuffer(new Uint8Array(chunk));
    loadedBytes += chunk.byteLength;
    
    //console.log(`Loaded bytes: ${loadedBytes}`);
  }
};


  useEffect(() => {
    const audio = audioRef.current;
    const mediaSource = mediaSourceRef.current;
    audio.src = URL.createObjectURL(mediaSource);

    const onSourceOpen = async () => {
      sourceBufferRef.current = mediaSource.addSourceBuffer('audio/mpeg');
      sourceBufferRef.current.addEventListener('updateend', () => {
        isAppending = false;
        appendPendingChunks(); // Attempt to append more chunks when possible
      });

      audio.addEventListener('timeupdate', async () => {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        if (audio.currentTime > bufferedEnd - 40 && !fullFileDownloaded) {
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
        if (fileSizeRef.current) { 
        bytePosition = Math.floor((value / duration) * fileSizeRef.current!);
        if (bytePosition <= fileSizeRef.current && !fullFileDownloaded) {
        await fetchAndAppendChunk(bytePosition);
      } else {
        console.warn(`Attempted to fetch beyond file size. Byte position: ${bytePosition}, File size: ${fileSizeRef.current}`);
      }
    } else {
      console.warn("File size is not initialized.");
    }
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