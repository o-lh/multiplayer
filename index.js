import path from 'node:path';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';

import express from 'express';
import favicon from 'serve-favicon';

import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server);

app.use(favicon(path.join(path.dirname(fileURLToPath(import.meta.url)), 'public', 'favicon.ico')));
app.use(express.static('public'));

io.on('connection', (socket) => {
    console.log('Someone joined :D');

    socket.on('chat message', (message) => {
        io.emit('chat message', message)
    })

    socket.on('disconnect', () => {
        console.log('Someone left   :(');
    })
})

server.listen(1337, () => {
    console.log('Listening on port 1337');
});
