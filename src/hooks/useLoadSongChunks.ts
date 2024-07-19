import axios from 'axios';

async function loadSongChunks(songId: string, startByte: number) {
  try {
    const response = await axios.get(`http://localhost:3001/music/${songId}`, {
      responseType: 'arraybuffer',
      headers: {
        Range: `bytes=${startByte}`,
      },
    });
    const chunk = response.data;
    const isFullFile = response.headers['is-full-file'] === 'true';
    
    console.log('Response headers:', response.headers);
    
    const fileSize = parseInt(response.headers['file-size'],10);
    console.log(fileSize);
    return {chunk, isFullFile};
  } catch (error) {
    console.error('Error fetching song chunk:', error);
    return null;
  }
}

export default loadSongChunks;