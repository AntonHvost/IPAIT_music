const express = require('express');
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const app = express();

const cors = require('cors');
const { data } = require('autoprefixer');
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
// Endpoint для потоковой передачи музыки
app.get('/music/:songId', async (req, res) => {
    const songId = req.params.songId;
    const tempDir = path.resolve(__dirname, 'temp');
    const tempFilePath = path.join(tempDir, `${songId}.mp3`);
    try {
        // Запрос к Supabase для получения метаданных о песне
        if (fs.existsSync(tempFilePath)) {
            console.log(`Using cached file: ${tempFilePath}`);
            streamFile(tempFilePath, req, res);
            return;
        }
        const { data, error } = await supabase
            .from("songs")
            .select('song_path')
            /*.getPublicUrl(req.params.song_path)*/
            .eq('id', songId)
            .single();
        if (error) {
            throw new Error(error.message);
        }
        if (!data) {
            res.status(404).send('Song not found');
            return;
        }

        
        const filePath = data.song_path; // Путь к файлу на сервере, если храните его в Supabase
        /*const relativeFilePath = dataSong.PublicUrl; // Путь к файлу на сервере
        const filePath = path.resolve(__dirname, relativeFilePath);*/
        
        const { data: fileData, error: fileError } = await supabase
        .storage
        .from('songs')
        .download(filePath);
        
        if (fileError) {
            throw new Error(fileError.message);
        }
        fs.writeFileSync(tempFilePath, Buffer.from(await fileData.arrayBuffer()));

        console.log(`Temporary file saved at: ${tempFilePath}`);

        streamFile(tempFilePath, req, res);

    } catch (error) {
        console.error('Error fetching song metadata from Supabase:', error);
        res.status(500).send('Internal server error');
    }
});

function streamFile(filePath, req, res) {
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const chunkSize = 1024 * 1024;
    const range = req.headers.range;

    if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        console.log(parts);
        const start = parseInt(parts[0], 10);
        console.log(start);
        const end = Math.min(start + chunkSize - 1, fileSize - 1);
        console.log(end);
        const chunksize = (end - start) + 1;
        console.log(chunksize);
        const file = fs.createReadStream(filePath, { start, end });
        const headers = {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': 'application/octet-stream',
            'File-Size': fileSize.toString(),
            'Is-Full-File': end === fileSize - 1 ? 'true' : 'false',
            
        };
        res.writeHead(206, headers);
        file.pipe(res);
    } else {
        const headers = {
            'Content-Length': fileSize,
            'Content-Type': 'application/octet-stream',
        };

        res.writeHead(200, headers);
        fs.createReadStream(filePath).pipe(res);
    }
}

// Запуск сервера на порте 3000
app.listen(3001, () => {
    console.log('Server is running on http://localhost:3000');
});