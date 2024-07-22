const express = require('express');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const WebSocket = require('ws');
const http = require('http');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({server});

const cors = require('cors');
const { data } = require('autoprefixer');
const e = require('express');
const supabaseUrl = 'https://ihlnjluvhimtwklrixbg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlobG5qbHV2aGltdHdrbHJpeGJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjExMzcyODgsImV4cCI6MjAzNjcxMzI4OH0.MPBffTzRBj086odxgZMUTVskWVgnVOyIyqkLV9m56Wc';
const supabase = createClient(supabaseUrl, supabaseKey);


const corsOptions = {
    origin:'http://localhost:3000', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));

const TEMP_FOLDER = path.resolve(__dirname, 'temp');
const FILE_EXPIRATION_TIME = 360 * 1000; // 1 hour in milliseconds
let tempId = 0;

const deleteExpiredTempFiles = () => {
    const now = Date.now();
    fs.readdir(TEMP_FOLDER, (err, files) => {
        if (err) {
            console.error('Error reading temp folder:', err);
            return;
        }
        files.forEach(file => {
            const filePath = path.join(TEMP_FOLDER, file);
            fs.stat(filePath, (err, stats) => {
                if (err) {
                    console.error('Error getting file stats:', err);
                    return;
                }
                if (now - stats.mtimeMs > FILE_EXPIRATION_TIME) {
                    fs.unlink(filePath, err => {
                        if (err) {
                            console.error(`Error deleting file ${filePath}:`, err);
                        } else {
                            console.log(`Deleted expired file: ${filePath}`);
                        }
                    });
                }
            });
        });
    });
};

// Set interval to check and delete expired temporary files every hour
setInterval(deleteExpiredTempFiles, FILE_EXPIRATION_TIME);

wss.on('connection', (ws) => {
    console.log('New WebSocket connection');

    ws.on('message', async (message) => {
        const { songId, startByte} = JSON.parse(message);
        tempId = songId ? songId : 0;
        const tempFilePath = path.join(TEMP_FOLDER, `${songId}.mp3`);

        try {
            if (fs.existsSync(tempFilePath)) {
                console.log(`Using cached file: ${tempFilePath}`);
                streamFile(tempFilePath, startByte, ws);
                return;
            }

            const { data, error } = await supabase
                .from("songs")
                .select('song_path')
                .eq('id', songId)
                .single();
            if (error) {
                throw new Error(error.message);
            }
            if (!data) {
                ws.send(JSON.stringify({ error: 'Song not found' }));
                return;
            }

            const filePath = data.song_path;
            const { data: fileData, error: fileError } = await supabase
                .storage
                .from('songs')
                .download(filePath);
            if (fileError) {
                throw new Error(fileError.message);
            }

            fs.writeFileSync(tempFilePath, Buffer.from(await fileData.arrayBuffer()));

            console.log(`Temporary file saved at: ${tempFilePath}`);

            streamFile(tempFilePath, startByte, ws);

        } catch (error) {
            console.error('Error fetching song metadata from Supabase:', error);
            ws.send(JSON.stringify({ error: 'Internal server error' }));
        }
    });
});

function streamFile(filePath, startByte, ws) {
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const chunkSize = 1024 * 1024;
    let chunkId = 0;
    if(startByte > fileSize - 1){
        ws.send(JSON.stringify({done : true}));
        return 0;
    }

    const end = Math.min(startByte + chunkSize - 1, fileSize - 1);
    const chunksize = (end - startByte) + 1;
    const fileStream = fs.createReadStream(filePath, { start: startByte, end: end });

    ws.send(JSON.stringify({ fileSize, startByte, end, chunksize }));

    fileStream.on('data', (chunk) => {
        ws.send(chunk);
        chunkId++;
    });

    fileStream.on('end', () => {
        if (startByte > fileSize - 1) {
            console.log(`Completed streaming file. Ended at byte ${end}`);
            ws.send(JSON.stringify({done: true}));
        }
    });
}

server.listen(3001, () => {
    console.log('WebSocket server is running on http://localhost:3001');
});