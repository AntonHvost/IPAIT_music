
const express = require('express');
const app = express();
const server = require('http').createServer(app);
const fs = require('fs');
const path = require('path');

const PORT = process.env.PORT || 3001;

const { createClient, SupabaseClient } = require('@supabase/supabase-js');
const supabaseUrl = 'https://ihlnjluvhimtwklrixbg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlobG5qbHV2aGltdHdrbHJpeGJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjExMzcyODgsImV4cCI6MjAzNjcxMzI4OH0.MPBffTzRBj086odxgZMUTVskWVgnVOyIyqkLV9m56Wc';
const supabase = createClient(supabaseUrl, supabaseKey);

const cors = require('cors');
const { data } = require('autoprefixer');

const corsOptions = {
    origin:'http://localhost:3000', 
    credentials:true,            //access-control-allow-credentials:true
    optionSuccessStatus:200
}
app.use(cors(corsOptions));

app.get('/music/:songId', async (req, res) => {
    const songId = req.params.songId;
    
    try {
        const supabaseClient = useSupabaseClient();
        // Запрос к Supabase для получения метаданных о песне
        const { data, error } = await SupabaseClient.storage
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
        
        const tempFilePath = path.resolve(__dirname, 'temp', `${songId}.mp3`);
        fs.writeFileSync(tempFilePath, Buffer.from(await fileData.arrayBuffer()));

        console.log(`Temporary file saved at: ${tempFilePath}`);

        if (fs.existsSync(tempFilePath)) {
            // Отправляем файл клиенту как поток данных
            const stat = fs.statSync(tempFilePath);
            const fileSize = stat.size;
            const range = req.headers.range;

            if (!range) {
                // Если запрос содержит заголовок Range (для частичного контента)
                const parts = range.replace(/bytes=/, "").split("-");
                const start = parseInt(parts[0], 10);
                const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

                const chunksize = (end - start) + 1;
                const file = fs.createReadStream(tempFilePath, { start, end });
                const headers = {
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                    'Content-Length': chunksize,
                    'Content-Type': 'audio/mpeg',
                };

                res.writeHead(206, headers);
                file.pipe(res);
            } else {
                // Если нет заголовка Range, отправляем весь файл целиком
                const headers = {
                    'Content-Length': fileSize,
                    'Content-Type': 'audio/mpeg',
                };

                res.writeHead(200, headers);
                fs.createReadStream(tempFilePath).pipe(res);
            }
        } else {
            res.status(404).send('File nnnnnnnnnnot found');
        }
    } catch (error) {
        console.error('Error fetching song metadata from Supabase:', error);
        res.status(500).send('Internal server error');
    }
});

server.listen(PORT, () => {
    console.log('Server Started!')
})
