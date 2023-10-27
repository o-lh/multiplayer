import { dirname, join } from 'node:path';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';

import express from 'express';
import favicon from 'serve-favicon';

import { Server } from 'socket.io';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(favicon(join(__dirname, 'public', 'favicon.ico')));
app.use(express.static(join(__dirname, 'public')));

io.on('connection', (socket) => {
    console.log('Someone connected');

    socket.on('disconnect', () => {
        console.log('Someone disconnected');
    })
})

server.listen(1337, () => {
    console.log('Listening on port 1337');
});
