import { useEffect, useRef, useState } from "react";

const useChunkLoader = (songId: string, duration: number) => {

  const mediaSourceRef = useRef(new MediaSource());
  const sourceBufferRef = useRef<SourceBuffer | null>(null);
  const audioRef = useRef<HTMLAudioElement>(new Audio());
  const fileSizeRef = useRef<number | null>(null);
  const [fullFileDownloaded, setFullFileDownloaded] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);

  const pendingSeekTimeRef = useRef<number | null>(null);
  const loadedBytes = useRef<number>(0);

  let receivedChunks: { id: number, chunk: ArrayBuffer }[] = [];
  let chunkIdCounter = 0;
  let pendingChunks: { id: number, chunk: ArrayBuffer }[] = [];
  let isAppending = false;

const requestNextChunk = (startByte: number) => {
  if (wsRef.current && 
      wsRef.current.readyState === WebSocket.OPEN && 
      !fullFileDownloaded
    ) {
    wsRef.current.send(JSON.stringify({ songId, startByte }));
  }
};

const processReceivedChunks = () => {
  receivedChunks.sort((a, b) => a.id - b.id);
    pendingChunks = pendingChunks.concat(receivedChunks);
    receivedChunks = [];
    appendPendingChunks();
    
};

const appendPendingChunks = () => {
  if (isAppending) {
    return;
  }
  if (sourceBufferRef.current && !sourceBufferRef.current.updating && pendingChunks.length > 0) {
    isAppending = true;
    const { chunk } = pendingChunks.shift()!;
    sourceBufferRef.current.appendBuffer(new Uint8Array(chunk));
    loadedBytes.current += chunk.byteLength;
    isAppending = false;
    appendPendingChunks();


    const audio = audioRef.current;
    const bufferedEnd = audio.buffered.length > 0 
      ? audio.buffered.end(audio.buffered.length - 1) 
      : 0;

    if (pendingSeekTimeRef.current !== null && bufferedEnd >= pendingSeekTimeRef.current) {
      audio.currentTime = pendingSeekTimeRef.current;
      audio.play();
      pendingSeekTimeRef.current = null; // Сбрасываем временное значение
    }
    else if(pendingSeekTimeRef.current !== null && bufferedEnd <= pendingSeekTimeRef.current && isAppending == false){
      requestNextChunk(loadedBytes.current);
    }

    const progress = fileSizeRef.current ? (loadedBytes.current / fileSizeRef.current) * 100 : 0;
    setLoadingProgress(progress);
  }
};


/*useEffect(() => {
  const intervalId = setInterval(() => {
    if(pendingSeekTimeRef.current === null) requestNextChunk(loadedBytes.current);
  }, 250); 

  return () => clearInterval(intervalId);
}, [loadedBytes, fullFileDownloaded]);*/

  useEffect(() => {
    const audio = audioRef.current;
    const mediaSource = mediaSourceRef.current;
    audio.src = URL.createObjectURL(mediaSource);

    const onSourceOpen = async () => {
      sourceBufferRef.current = mediaSource.addSourceBuffer('audio/mpeg');
      sourceBufferRef.current.addEventListener('updateend', () => {
        isAppending = false;
        appendPendingChunks();
      });

      audio.addEventListener('timeupdate', async () => {
        const bufferedEnd = audio.buffered.end(audio.buffered.length - 1);
        if ((audio.currentTime > bufferedEnd - 40 || audio.currentTime > bufferedEnd)&& !fullFileDownloaded && pendingSeekTimeRef.current === null) {
          console.log(bufferedEnd);
          await requestNextChunk(loadedBytes.current);
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

  const handleSeek = async (value: number) => {
    const audio = audioRef.current;
    const bufferedEnd = audio.buffered.length > 0 
      ? audio.buffered.end(audio.buffered.length - 1) 
      : 0;
    if (value > bufferedEnd) {
      pendingSeekTimeRef.current = value;
      
      if (fileSizeRef.current) {
        if (loadedBytes.current <= fileSizeRef.current && !fullFileDownloaded) {
          await requestNextChunk(loadedBytes.current);
        }
      }
    } else {
      audio.currentTime = value;

      pendingSeekTimeRef.current = null; // Если данные уже есть, обновляем сразу
    }
  };
  

  useEffect(() => {
    const socket = new WebSocket("ws://localhost:3001");
    socket.onopen = () => {
      console.log('WebSocket connection established');
      wsRef.current = socket;
      requestNextChunk(0);
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

  return {
    audioRef,
    mediaSourceRef,
    handleSeek,
    fullFileDownloaded,
    loadingProgress
  };
};

export default useChunkLoader;